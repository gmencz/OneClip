import { usePusher } from "@harelpls/use-pusher";
import { useEffect, useState } from "react";
import type { Device } from "~/types";

interface UseIsPusherReadyParams {
  deviceInfo: Device | undefined;
}

function useIsPusherReady({ deviceInfo }: UseIsPusherReadyParams) {
  const { client: pusher } = usePusher();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!pusher || !deviceInfo) {
      return;
    }

    pusher.config = {
      ...pusher.config,
      auth: {
        params: { device: JSON.stringify(deviceInfo) }
      }
    };

    setIsReady(true);
  }, [deviceInfo, pusher]);

  return isReady;
}

export { useIsPusherReady };
