import { useEffect, useState } from "react";
import {
  isConsole,
  isDesktop,
  isMobileOnly,
  isSmartTV,
  isTablet,
  isWearable
} from "react-device-detect";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator
} from "unique-names-generator";
import type { Device, DeviceType } from "~/types";

interface UseDeviceInfoParams {
  allDevices: string[];
}

function generateDeviceName() {
  return uniqueNamesGenerator({
    length: 2,
    separator: " ",
    dictionaries: [colors, animals, adjectives],
    style: "capital"
  });
}

function useDeviceInfo(params: UseDeviceInfoParams): Device | undefined {
  let [device, setDevice] = useState<Device>();

  useEffect(() => {
    let name = generateDeviceName();
    // Make sure the name generated is unique among all devices.
    while (params.allDevices.includes(name)) {
      name = generateDeviceName();
    }

    let type: DeviceType = "unknown";
    if (isMobileOnly) {
      type = "mobile";
    } else if (isTablet) {
      type = "tablet";
    } else if (isDesktop) {
      type = "desktop";
    } else if (isSmartTV) {
      type = "smarttv";
    } else if (isWearable) {
      type = "wearable";
    } else if (isConsole) {
      type = "console";
    }

    setDevice({ name, type });
  }, [params.allDevices]);

  return device;
}

export { useDeviceInfo };
