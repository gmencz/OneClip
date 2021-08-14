import { useEffect, useState } from "react";
import {
  isConsole,
  isDesktop,
  isMobileOnly,
  isSmartTV,
  isTablet,
  isWearable
} from "react-device-detect";
import { uniqueNamesGenerator, animals, colors } from "unique-names-generator";

type DeviceType =
  | "mobile"
  | "tablet"
  | "desktop"
  | "smarttv"
  | "wearable"
  | "console"
  | "unknown";

type Device = {
  name: string;
  type: DeviceType;
};

function generateDeviceName() {
  return uniqueNamesGenerator({
    length: 2,
    separator: " ",
    dictionaries: [colors, animals],
    style: "capital"
  });
}

function useDevice(): Device | undefined {
  let [device, setDevice] = useState<Device>();

  useEffect(() => {
    let savedDevice = localStorage.getItem("device");
    if (savedDevice) {
      setDevice(JSON.parse(savedDevice));
      return;
    }

    let name = generateDeviceName();
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
    localStorage.setItem("device", JSON.stringify({ name, type }));
  }, []);

  return device;
}

export { Device, DeviceType, generateDeviceName, useDevice };
