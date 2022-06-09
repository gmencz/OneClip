import type { PresenceChannelState } from "@harelpls/use-pusher";
import { useChannel, useEvent } from "@harelpls/use-pusher";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { snakeCase } from "~/utils/strings";
import type { Device } from "~/types";
import toast from "react-hot-toast";
import { useNotifications } from "~/hooks/use-notifications";
import { nanoid } from "nanoid";
import { getDeviceChannelName, getNetworkChannelName } from "~/utils/channels";

interface DeviceSubscriptionsProps {
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  deviceInfo: Device;
  networkID: string;
}

interface MemberData {
  id: string;
  info: Omit<Device, "name">;
}

interface ClipboardData {
  from: Device;
  text: string;
}

function DeviceSubscriptions({
  setDevices,
  deviceInfo,
  networkID
}: DeviceSubscriptionsProps) {
  const copyToClipboard = useCopyToClipboard();
  const { notifications, setNotifications } = useNotifications();
  const myChannel = useChannel(
    getDeviceChannelName(deviceInfo.name, networkID)
  );

  const networkChannel = useChannel(getNetworkChannelName(networkID));

  const onSubscribeToNetworkChannel = (
    data: PresenceChannelState | undefined
  ) => {
    if (!data) return;

    const { myID, members: allMembers } = data;

    const otherMembers: Device[] = Object.keys(allMembers)
      .filter(id => id !== myID)
      .map(id => {
        return {
          name: id,
          type: allMembers[id].type
        };
      });

    setDevices(otherMembers);
  };

  const onCopyToClipboard = async (data: ClipboardData | undefined) => {
    if (!data) return;

    const { from, text } = data;

    try {
      await copyToClipboard(text);
      toast.success(
        <span className="text-sm">
          Check your clipboard, {from.name} just shared their clipboard with
          you!
        </span>,
        {
          style: {
            paddingLeft: "15px",
            paddingRight: 0
          },
          duration: 4000
        }
      );
    } catch (error) {
      console.error(error);

      // If the error was caused because the user didn't have the site focused, we save it as a notification.
      if (error instanceof DOMException && error.code === 0) {
        setNotifications([
          {
            id: nanoid(),
            from: {
              name: from.name,
              type: from.type
            },
            text,
            timestamp: new Date().toISOString()
          },
          ...notifications
        ]);
      } else {
        toast.error(
          <span className="text-sm">
            {from} tried to share their clipboard but something went wrong
          </span>,
          {
            style: {
              paddingLeft: "15px",
              paddingRight: 0
            },
            duration: 4000
          }
        );
      }
    }
  };

  const onSomeoneJoinedNetwork = (member: MemberData | undefined) => {
    if (!member) return;

    setDevices(currentDevices => [
      ...currentDevices,
      { name: member.id, type: member.info.type }
    ]);
  };

  const onSomeoneLeftNetwork = (member: MemberData | undefined) => {
    if (!member) return;

    setDevices(currentDevices =>
      currentDevices.filter(device => device.name !== member.id)
    );
  };

  // My channel events
  useEvent<ClipboardData>(myChannel, "copy-to-clipboard", onCopyToClipboard);

  // Network channel events
  useEvent<PresenceChannelState>(
    networkChannel,
    "pusher:subscription_succeeded",
    onSubscribeToNetworkChannel
  );

  useEvent<MemberData>(
    networkChannel,
    "pusher:member_added",
    onSomeoneJoinedNetwork
  );

  useEvent<MemberData>(
    networkChannel,
    "pusher:member_removed",
    onSomeoneLeftNetwork
  );

  return null;
}

export { DeviceSubscriptions };
