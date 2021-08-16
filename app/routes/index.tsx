import {
  json,
  useRouteData,
  redirect,
  ActionFunction,
  usePendingFormSubmit
} from "remix";
import toast from "react-hot-toast";
import { useState, useEffect, useMemo } from "react";
import { Device, useDevice } from "../utils/device";
import { rest } from "../utils/pusher.server";
import { commitSession, getSession } from "../utils/sessions";
import { MainScreen } from "../components/main-screen";
import { ErrorScreen } from "../components/error-screen";
import type { ClipboardData, Loader } from "../types";
import {
  MAX_NOTIFICATIONS,
  useNotifications
} from "../components/notifications";
import { nanoid } from "nanoid";
import { useCallback } from "react";

type PresenceChannel = {
  members: Record<string, Omit<Device, "name">>;
};

type MemberData = {
  id: string;
  info: Omit<Device, "name">;
};

export let loader: Loader = async ({ context, request }) => {
  let session = await getSession(request.headers.get("Cookie"));
  if (!context.ip) {
    return json(
      { error: "failed to retrieve public IP address" },
      {
        status: 500
      }
    );
  }

  let base64IP = Buffer.from(context.ip).toString("base64");
  let response = await rest.get({
    path: `/channels/presence-${base64IP}/users`
  });
  if (!response.ok) {
    return json(
      { error: "server error" },
      {
        status: 500
      }
    );
  }

  let body = await response.json();
  let allDevices = (body.users as { id: string }[]).map(device => device.id);

  if (allDevices.length >= 100) {
    return json(
      { error: "network is full, try again later" },
      {
        status: 500
      }
    );
  }

  return json(
    {
      ip: base64IP,
      clipboardError: session.get("clipboardError"),
      lastDeviceName: session.get("lastDeviceName"),
      allDevices
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    }
  );
};

export let action: ActionFunction = async ({ request }) => {
  let session = await getSession(request.headers.get("Cookie"));
  let body = new URLSearchParams(await request.text());
  let fromName = body.get("fromName");
  let fromType = body.get("fromType");
  let deviceChannel = body.get("channel");
  let text = body.get("text");
  let deviceName = body.get("deviceName");

  if (!deviceChannel || !fromName || !fromType || !text || !deviceName) {
    session.flash("clipboardError", "Invalid payload");

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    });
  }

  const response = await rest.trigger(deviceChannel, "copy-to-clipboard", {
    from: {
      name: fromName,
      type: fromType
    },
    text
  });

  if (!response.ok) {
    session.flash("clipboardError", "Invalid event");

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    });
  }

  session.flash("lastDeviceName", deviceName);
  return redirect("/", {
    headers: {
      "Set-Cookie": await commitSession(session)
    }
  });
};

type RouteData = {
  ip?: string;
  clipboardError?: string;
  error?: string;
  lastDeviceName?: string;
  allDevices?: string[];
};

export default function Index() {
  let { ip, error, clipboardError, lastDeviceName, allDevices } =
    useRouteData<RouteData>();

  let { notifications, setNotifications } = useNotifications();
  let [devices, setDevices] = useState<Device[]>([]);
  let pendingSubmit = usePendingFormSubmit();
  let myDevice = useDevice({
    ip,
    allDevices: allDevices ?? [],
    shouldConnect: !!ip
  });

  let devicesHalves = useMemo(() => {
    let half = Math.ceil(devices.length / 2);
    return {
      first: devices.slice(0, half),
      second: devices.slice(half)
    };
  }, [devices]);

  useEffect(() => {
    if (pendingSubmit) {
      return;
    }

    if (clipboardError) {
      console.error(clipboardError);
      toast.error(<span className="text-sm">Failed to share clipboard</span>, {
        style: {
          paddingLeft: "15px",
          paddingRight: 0
        },
        duration: 4000
      });
      return;
    }

    if (lastDeviceName) {
      toast.success(
        <span className="text-sm">Clipboard shared with {lastDeviceName}</span>,
        {
          style: {
            paddingLeft: "15px",
            paddingRight: 0
          },
          duration: 4000
        }
      );
    }
  }, [clipboardError, lastDeviceName, pendingSubmit]);

  let copyToClipboard = useCallback(
    async ({ from, text }: ClipboardData) => {
      try {
        await navigator.clipboard.writeText(text);
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
        if (notifications.length < MAX_NOTIFICATIONS) {
          setNotifications(currentNotifications => [
            ...currentNotifications,
            {
              id: nanoid(),
              from: {
                name: from.name,
                type: from.type
              },
              text,
              timestamp: new Date().toISOString()
            }
          ]);

          return;
        }

        console.error(error);
        toast.error(
          <span className="text-sm">
            {from.name} shared their clipboard with you but your notifications
            folder is full so it couldn't be saved
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
    },
    [notifications.length, setNotifications]
  );

  let joinNetwork = useCallback(
    ({ members }: PresenceChannel) => {
      setDevices(
        Object.keys(members)
          .filter(memberId => memberId !== myDevice?.info?.name)
          .map(memberId => {
            return {
              name: memberId,
              type: members[memberId].type
            };
          })
      );
    },
    [myDevice?.info?.name]
  );

  let someoneJoined = useCallback((member: MemberData) => {
    setDevices(prevDevices => [
      ...prevDevices,
      { name: member.id, type: member.info.type }
    ]);
  }, []);

  let someoneLeft = useCallback((member: MemberData) => {
    setDevices(prevDevices =>
      prevDevices.filter(device => device.name !== member.id)
    );
  }, []);

  useEffect(() => {
    if (!myDevice.selfChannel || !myDevice.networkChannel) {
      return;
    }

    myDevice.selfChannel.bind("copy-to-clipboard", copyToClipboard);
    myDevice.networkChannel.bind("pusher:subscription_succeeded", joinNetwork);
    myDevice.networkChannel.bind("pusher:member_added", someoneJoined);
    myDevice.networkChannel.bind("pusher:member_removed", someoneLeft);

    return () => {
      if (!myDevice.selfChannel || !myDevice.networkChannel) {
        return;
      }

      myDevice.selfChannel.unbind("copy-to-clipboard", copyToClipboard);
      myDevice.networkChannel.unbind(
        "pusher:subscription_succeeded",
        joinNetwork
      );
      myDevice.networkChannel.unbind("pusher:member_added", someoneJoined);
      myDevice.networkChannel.unbind("pusher:member_removed", someoneLeft);
    };
  }, [
    copyToClipboard,
    joinNetwork,
    myDevice.networkChannel,
    myDevice.selfChannel,
    someoneJoined,
    someoneLeft
  ]);

  if (myDevice.isFirefox) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg mt-auto">
          Firefox is not supported. Download Chrome/Edge/Opera/Brave.
        </p>
      </ErrorScreen>
    );
  }

  if (myDevice.isIE) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg mt-auto">
          Internet Explorer is not supported. Download Chrome/Edge/Opera/Brave.
        </p>
      </ErrorScreen>
    );
  }

  if (error || !ip) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg mt-auto">
          Failed to connect, reason:{" "}
          {error ?? "failed to retrieve public IP address"}
        </p>
      </ErrorScreen>
    );
  }

  if (myDevice.isError) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-lg mt-auto">
          Failed to connect, reason: {myDevice.error || "unknown"}
        </p>
      </ErrorScreen>
    );
  }

  return (
    <MainScreen ip={ip} devicesHalves={devicesHalves} myDevice={myDevice} />
  );
}
