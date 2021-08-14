import { json, MetaFunction, useRouteData } from "remix";
import { useState, useEffect, useRef } from "react";
import { pusher } from "../utils/pusher.client";
import { Device, useDevice } from "../utils/device";
import type { Loader } from "../types";
import { NetDevice } from "../components/discovered-device";
import { useMemo } from "react";
import { Channel } from "pusher-js";
import { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { rest } from "../utils/pusher.server";
import { MyDevice } from "../components/my-device";

export let meta: MetaFunction = () => {
  return {
    title: "OneClip",
    description: "Share your clipboard from any device, anywhere."
  };
};

export let loader: Loader = async ({ context }) => {
  if (!context.ip) {
    return json(
      { ip: "", notFound: true },
      {
        status: 404
      }
    );
  }

  return { ip: Buffer.from(context.ip).toString("base64") };
};

type RouteData = {
  ip: string;
  notFound?: boolean;
};

type PresenceChannel = {
  members: Record<string, Omit<Device, "name">>;
};

type MemberData = {
  id: string;
  info: Omit<Device, "name">;
};

type ConnectionStatus = "connecting" | "success" | "error";

const snakeCase = (str: string) => {
  return str
    .replace(/\W+/g, " ")
    .split(/ |\B(?=[A-Z])/)
    .map(word => word.toLowerCase())
    .join("-");
};

type ClipboardData = {
  from: string;
  text: string;
};

export let action: ActionFunction = async ({ request }) => {
  let body = new URLSearchParams(await request.text());
  let from = body.get("from");
  let deviceChannel = body.get("channel");
  let text = body.get("text");

  if (!deviceChannel) {
    // Handle error
    return redirect("/");
  }

  if (!from) {
    // Handle error
    return redirect("/");
  }

  if (!text) {
    // Handle error
    return redirect("/");
  }

  const response = await rest.trigger(deviceChannel, "copy-to-clipboard", {
    from,
    text
  });

  if (!response.ok) {
    // Handle error
    console.log(response.status);
    return redirect("/");
  }

  return redirect("/");
};

export default function Index() {
  let { ip, notFound } = useRouteData<RouteData>();
  let [subscriptionsCount, setSubscriptionsCount] = useState(0);
  let [devices, setDevices] = useState<Device[]>([]);
  let myDevice = useDevice();
  let networkChannel = useRef<Channel>();
  let deviceChannel = useRef<Channel>();
  let [clipboardText, setClipboardText] = useState("");
  let [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  let devicesHalves = useMemo(() => {
    let half = Math.ceil(devices.length / 2);
    return {
      first: devices.slice(0, half),
      second: devices.slice(half)
    };
  }, [devices]);

  useEffect(() => {
    (async () => {
      try {
        const text = await navigator.clipboard.readText();
        setClipboardText(text);
      } catch (error) {
        // Handle error
        console.error(error);
      }
    })();
  }, []);

  useEffect(() => {
    if (subscriptionsCount === 2 && myDevice) {
      setConnectionStatus("success");
    }
  }, [myDevice, ip, subscriptionsCount]);

  useEffect(() => {
    if (!myDevice) {
      return;
    }

    pusher.config = {
      ...pusher.config,
      auth: {
        ...(pusher.config.auth || {}),
        params: {
          ...(pusher.config.auth?.params || {}),
          device: JSON.stringify(myDevice)
        }
      }
    };
  }, [myDevice]);

  useEffect(() => {
    if (notFound || !myDevice) {
      return;
    }

    deviceChannel.current = pusher.subscribe(
      `private-${snakeCase(myDevice.name)}-${ip}`
    );
    deviceChannel.current.bind("pusher:subscription_succeeded", () => {
      setSubscriptionsCount(prevCount => prevCount + 1);
    });

    deviceChannel.current.bind(
      "copy-to-clipboard",
      async (data: ClipboardData) => {
        console.log(`${data.from} wants to copy his clipboard to your device`);

        try {
          await navigator.clipboard.writeText(data.text);
        } catch (error) {
          // Handle error
          console.error(error);
        }
      }
    );

    networkChannel.current = pusher.subscribe(`presence-${ip}`);
    networkChannel.current.bind(
      "pusher:subscription_succeeded",
      ({ members }: PresenceChannel) => {
        setSubscriptionsCount(prevCount => prevCount + 1);
        setDevices(
          Object.keys(members)
            .filter(memberId => memberId !== myDevice?.name)
            .map(memberId => {
              return {
                name: memberId,
                type: members[memberId].type
              };
            })
        );
      }
    );

    networkChannel.current.bind("pusher:member_added", (member: MemberData) => {
      setDevices(prevDevices => [
        ...prevDevices,
        { name: member.id, type: member.info.type }
      ]);
    });

    networkChannel.current.bind(
      "pusher:member_removed",
      (member: MemberData) => {
        setDevices(prevDevices =>
          prevDevices.filter(device => device.name !== member.id)
        );
      }
    );
  }, [myDevice, ip, notFound]);

  if (notFound) {
    // TODO
    return null;
  }

  return (
    <div className="flex flex-col justify-center min-h-screen p-12 bg-gray-900">
      {connectionStatus === "success" ? (
        <div className="mt-auto flex gap-14 items-center justify-center flex-wrap mb-32">
          {devicesHalves.first.map(device => (
            <NetDevice
              clipboardText={clipboardText}
              myDeviceName={myDevice?.name ?? ""}
              key={device.name}
              device={device}
              channel={`private-${snakeCase(device.name)}-${ip}`}
            />
          ))}

          <MyDevice type={myDevice?.type ?? "unknown"} />

          {devicesHalves.second.map(device => (
            <NetDevice
              clipboardText={clipboardText}
              myDeviceName={myDevice?.name ?? ""}
              key={device.name}
              device={device}
              channel={`private-${snakeCase(device.name)}-${ip}`}
            />
          ))}
        </div>
      ) : (
        <div className="mt-auto flex items-center justify-center mb-32">
          <MyDevice type="unknown" />
        </div>
      )}

      <div className="mt-auto flex flex-col items-center text-center">
        {connectionStatus === "connecting" ? (
          <img
            src="/logo.svg"
            alt="OneClip"
            className="h-14 w-14 mb-3 animate-spin"
          />
        ) : (
          <img src="/logo.svg" alt="OneClip" className="h-14 w-14 mb-3" />
        )}

        {connectionStatus === "connecting" ? (
          <>
            <p className="text-gray-200">Connecting you...</p>
            <p className="text-brand text-sm mt-1.5">
              Once connected, you'll be discoverable by everyone on this network
            </p>
          </>
        ) : connectionStatus === "success" ? (
          <>
            <p className="text-gray-200">You are known as {myDevice?.name}</p>
            <p className="text-brand text-sm mt-1.5">
              You can be discovered by everyone on this network
            </p>
          </>
        ) : connectionStatus === "error" ? (
          <p className="text-red-500">Error connecting</p>
        ) : null}
      </div>
    </div>
  );
}
