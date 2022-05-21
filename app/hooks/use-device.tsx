import Pusher from "pusher-js";
import { useEffect, useMemo, useState } from "react";
import { isFirefox, isIE } from "react-device-detect";
import { snakeCase } from "~/utils/strings";
import { useDeviceInfo } from "./use-device-info";
import { usePusherSubscription } from "./use-pusher-subscription";

interface DeviceParams {
  ip?: string;
  allDevices: string[];
  shouldConnect?: boolean;
}

const defaultParams: DeviceParams = {
  ip: "",
  allDevices: [],
  shouldConnect: true
};

function useDevice(params: DeviceParams = defaultParams) {
  const [pusher, setPusher] = useState<Pusher>();
  const isSupported = !isFirefox && !isIE;
  const info = useDeviceInfo({ allDevices: params.allDevices });
  const enabled = !!info && params.shouldConnect && isSupported;
  const config = useMemo(() => {
    if (!info) {
      return undefined;
    }

    return { auth: { params: { device: JSON.stringify(info) } } };
  }, [info]);

  useEffect(() => {
    if (enabled && config && !pusher) {
      setPusher(
        new Pusher(window.ENV.PUBLIC_PUSHER_KEY!, {
          cluster: window.ENV.PUBLIC_PUSHER_CLUSTER,
          authEndpoint: "/api/pusher/auth",
          ...config
        })
      );
    }
  }, [config, enabled, pusher]);

  const selfSub = usePusherSubscription(
    pusher,
    `private-${snakeCase(info?.name ?? "")}-${params.ip}`
  );

  const networkSub = usePusherSubscription(pusher, `presence-${params.ip}`);

  return {
    isFirefox,
    isIE,
    isConnecting: selfSub.isLoading || networkSub.isLoading,
    isConnected: selfSub.isSuccess && networkSub.isSuccess,
    isError: selfSub.isError || networkSub.isError,
    error: selfSub.error,
    info,
    selfChannel: selfSub.channel,
    networkChannel: networkSub.channel
  };
}

export { useDevice };
