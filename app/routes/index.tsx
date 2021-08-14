import { json, MetaFunction, useRouteData } from "remix";
import { useState, useEffect, useRef } from "react";
import { pusher } from "../utils/pusher.client";
import { Device, useDevice } from "../utils/device";
import type { Loader } from "../types";
import { NetDevice } from "../components/net-device";
import { useMemo } from "react";
import { Channel } from "pusher-js";

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

export default function Index() {
  let { ip, notFound } = useRouteData<RouteData>();
  let [subscriptionsCount, setSubscriptionsCount] = useState(0);
  let [devices, setDevices] = useState<Device[]>([]);
  let device = useDevice();
  let networkChannel = useRef<Channel>();
  let deviceChannel = useRef<Channel>();
  let [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("connecting");

  let devicesHalves = useMemo(() => {
    let half = Math.ceil(devices.length / 2);
    return {
      first: devices.slice(0, half),
      second: devices.slice(half)
    };
  }, [devices]);

  let pc = useRef<RTCPeerConnection>();

  useEffect(() => {
    if (subscriptionsCount === 2 && device) {
      setConnectionStatus("success");
    }
  }, [device, ip, subscriptionsCount]);

  useEffect(() => {
    if (notFound || !device) {
      return;
    }

    deviceChannel.current = pusher.subscribe(
      `private-${snakeCase(device.name)}-${ip}`
    );
    deviceChannel.current.bind("pusher:subscription_succeeded", () => {
      setSubscriptionsCount(prevCount => prevCount + 1);
    });

    networkChannel.current = pusher.subscribe(`presence-${ip}`);
    networkChannel.current.bind(
      "pusher:subscription_succeeded",
      ({ members }: PresenceChannel) => {
        setSubscriptionsCount(prevCount => prevCount + 1);
        setDevices(
          Object.keys(members)
            .filter(memberId => memberId !== device?.name)
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
  }, [device, ip, notFound]);

  const sendClipboard = (toDevice: Device) => {
    pc.current = new RTCPeerConnection();
    let peerChannel = pusher.channel(
      `private-${snakeCase(toDevice.name)}-${ip}`
    );

    pc.current.onicecandidate = ({ candidate }) => {
      peerChannel.trigger("rtc-ice-candidate", { candidate });
    };

    pc.current.onnegotiationneeded = async () => {
      try {
        await pc.current?.setLocalDescription(await pc.current.createOffer());
        peerChannel.trigger("rtc-negotation-needed", {
          desc: pc.current?.localDescription
        });
      } catch (error) {
        // Handle
        console.error(error);
      }
    };

    // TODO
  };

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
              onClick={() => sendClipboard(device)}
              key={device.name}
              device={device}
            />
          ))}

          <NetDevice
            onClick={() => {
              // Can't send to yourself!
            }}
            showRadar
            device={{ name: "You", type: device!.type }}
          />

          {devicesHalves.second.map(device => (
            <NetDevice
              onClick={() => sendClipboard(device)}
              key={device.name}
              device={device}
            />
          ))}
        </div>
      ) : (
        <div className="mt-auto flex items-center justify-center mb-32">
          <NetDevice
            onClick={() => {
              // Can't send yet, loading!
            }}
            device={{ name: "You", type: "unknown" }}
          />
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
            <p className="text-gray-200">You are known as {device?.name}</p>
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
