import { useEffect } from "react";
import type { useDevice } from "~/hooks/use-device";
import type { Device, Notification } from "~/types";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { nanoid } from "nanoid";
import toast from "react-hot-toast";
import { IMG_PREFIX } from "~/constants";

interface DeviceSubscriptionsProps {
  myDevice: ReturnType<typeof useDevice>;
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<Notification[]>;
}

interface PresenceChannel {
  members: Record<string, Omit<Device, "name">>;
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
  myDevice,
  setDevices,
  notifications,
  setNotifications
}: DeviceSubscriptionsProps) {
  const copyToClipboard = useCopyToClipboard();

  useEffect(() => {
    if (!myDevice.selfChannel || !myDevice.networkChannel) {
      return;
    }

    const onJoinNetwork = ({ members }: PresenceChannel) => {
      const membersOtherThanSelf = Object.keys(members)
        .filter(memberId => memberId !== myDevice?.info?.name)
        .map(memberId => {
          return {
            name: memberId,
            type: members[memberId].type
          };
        });

      setDevices(membersOtherThanSelf);
    };

    const onSomeoneJoined = (member: MemberData) => {
      setDevices(currentDevices => [
        ...currentDevices,
        { name: member.id, type: member.info.type }
      ]);
    };

    const onSomeoneLeft = (member: MemberData) => {
      setDevices(currentDevices =>
        currentDevices.filter(device => device.name !== member.id)
      );
    };

    const onCopyToClipboard = async ({ from, text }: ClipboardData) => {
      try {
        await copyToClipboard(text);
        const [notificationPrefix] = text.split(":");
        const isImageNotification = notificationPrefix === IMG_PREFIX;

        toast.success(
          <span className="text-sm">
            Check your clipboard, {from.name} just shared their clipboard{" "}
            {isImageNotification ? "image" : "text"} with you!
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
        }
      }
    };

    myDevice.selfChannel.bind("copy-to-clipboard", onCopyToClipboard);
    myDevice.networkChannel.bind(
      "pusher:subscription_succeeded",
      onJoinNetwork
    );
    myDevice.networkChannel.bind("pusher:member_added", onSomeoneJoined);
    myDevice.networkChannel.bind("pusher:member_removed", onSomeoneLeft);

    return () => {
      if (!myDevice.selfChannel || !myDevice.networkChannel) {
        return;
      }

      myDevice.selfChannel.unbind("copy-to-clipboard", onCopyToClipboard);
      myDevice.networkChannel.unbind(
        "pusher:subscription_succeeded",
        onJoinNetwork
      );
      myDevice.networkChannel.unbind("pusher:member_added", onSomeoneJoined);
      myDevice.networkChannel.unbind("pusher:member_removed", onSomeoneLeft);
    };
  }, [
    copyToClipboard,
    myDevice?.info?.name,
    myDevice.networkChannel,
    myDevice.selfChannel,
    notifications,
    setDevices,
    setNotifications
  ]);

  return null;
}

export { DeviceSubscriptions };
