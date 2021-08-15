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
import { ActivityInfoModal } from "../components/activity-info-modal";
import { MainScreen } from "../components/main-screen";
import { ErrorScreen } from "../components/error-screen";
import type { ClipboardData, Loader } from "../types";

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
  let allDevices = body.users.map((device: { id: string }) => device.id);

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
  let from = body.get("from");
  let deviceChannel = body.get("channel");
  let text = body.get("text");
  let deviceName = body.get("deviceName");

  if (!deviceChannel || !from || !text || !deviceName) {
    session.flash("clipboardError", "Invalid payload");

    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session)
      }
    });
  }

  const response = await rest.trigger(deviceChannel, "copy-to-clipboard", {
    from,
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

  let [devices, setDevices] = useState<Device[]>([]);
  let [showInfoModal, setShowInfoModal] = useState(false);
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

  let dismissInfoModal = () => {
    setShowInfoModal(false);
    localStorage.setItem("saw-info-modal", "1");
  };

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
  }, [clipboardError, lastDeviceName, pendingSubmit]);

  useEffect(() => {
    if (myDevice.isConnected) {
      if (!localStorage.getItem("saw-info-modal")) {
        setShowInfoModal(true);
      }
    }
  }, [myDevice.isConnected]);

  useEffect(() => {
    if (!myDevice.selfChannel || !myDevice.networkChannel) {
      return;
    }

    myDevice.selfChannel.bind(
      "copy-to-clipboard",
      async ({ from, text }: ClipboardData) => {
        try {
          await navigator.clipboard.writeText(text);
          toast.success(
            <span className="text-sm">
              Check your clipboard, {from} just shared their clipboard with you!
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
          if (error instanceof DOMException) {
            toast.error(
              <span className="text-sm">
                {from} shared their clipboard with you but this page wasn't open
                and focused so it couldn't be saved
              </span>,
              {
                style: {
                  paddingLeft: "15px",
                  paddingRight: 0
                },
                duration: 4000
              }
            );

            return;
          }

          toast.error(
            <span className="text-sm">
              {from} shared their clipboard with you but something went wrong
              copying it
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
    );

    myDevice.networkChannel.bind(
      "pusher:subscription_succeeded",
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
      }
    );

    myDevice.networkChannel.bind(
      "pusher:member_added",
      (member: MemberData) => {
        setDevices(prevDevices => [
          ...prevDevices,
          { name: member.id, type: member.info.type }
        ]);
      }
    );

    myDevice.networkChannel.bind(
      "pusher:member_removed",
      (member: MemberData) => {
        setDevices(prevDevices =>
          prevDevices.filter(device => device.name !== member.id)
        );
      }
    );
  }, [myDevice?.info?.name, myDevice.networkChannel, myDevice.selfChannel]);

  if (error || !ip) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-xl mt-auto">
          Failed to connect, reason:{" "}
          {error ?? "failed to retrieve public IP address"}
        </p>
      </ErrorScreen>
    );
  }

  if (myDevice.isError) {
    return (
      <ErrorScreen>
        <p className="text-red-500 text-xl mt-auto">
          Failed to connect, reason: {myDevice.error || "unknown"}
        </p>
      </ErrorScreen>
    );
  }

  return (
    <>
      <ActivityInfoModal show={showInfoModal} onClose={dismissInfoModal} />
      <MainScreen ip={ip} devicesHalves={devicesHalves} myDevice={myDevice} />
    </>
  );
}
