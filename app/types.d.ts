type DeviceType =
  | "mobile"
  | "tablet"
  | "desktop"
  | "smarttv"
  | "wearable"
  | "console"
  | "unknown";

interface Device {
  name: string;
  type: DeviceType;
}

interface Notification {
  id: string;
  from: Device;
  timestamp: string;
  text: string;
}

export { Device, DeviceType, Notification };
