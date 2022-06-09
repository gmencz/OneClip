import type { Device } from "~/types";
import { getDeviceChannelName } from "~/utils/channels";
import { snakeCase } from "../utils/strings";
import { DiscoveredDevice } from "./discovered-device";
import { MyDevice } from "./my-device";

interface DevicesListProps {
  myDevice: Device;
  networkID: string;
  devicesHalves: {
    first: Device[];
    second: Device[];
  };
}

export function DevicesList({
  devicesHalves,
  myDevice,
  networkID
}: DevicesListProps) {
  return (
    <div className="flex mt-auto gap-14 items-center justify-center flex-wrap">
      {devicesHalves.first.map(device => (
        <DiscoveredDevice
          myDevice={myDevice}
          key={device.name}
          device={device}
          channel={getDeviceChannelName(device.name, networkID)}
        />
      ))}

      <MyDevice type={myDevice.type} />

      {devicesHalves.second.map(device => (
        <DiscoveredDevice
          myDevice={myDevice}
          key={device.name}
          device={device}
          channel={getDeviceChannelName(device.name, networkID)}
        />
      ))}
    </div>
  );
}
