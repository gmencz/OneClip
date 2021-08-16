import { Device } from "../utils/device";
import { snakeCase } from "../utils/words";
import { DiscoveredDevice } from "./discovered-device";
import { MyDevice } from "./my-device";

type Props = {
  myDevice: Device;
  ip: string;
  devicesHalves: {
    first: Device[];
    second: Device[];
  };
};

export function DevicesList({ devicesHalves, myDevice, ip }: Props) {
  return (
    <div className="flex mt-auto gap-14 items-center justify-center flex-wrap">
      {devicesHalves.first.map(device => (
        <DiscoveredDevice
          myDevice={myDevice}
          key={device.name}
          device={device}
          channel={`private-${snakeCase(device.name)}-${ip}`}
        />
      ))}

      <MyDevice type={myDevice.type} />

      {devicesHalves.second.map(device => (
        <DiscoveredDevice
          myDevice={myDevice}
          key={device.name}
          device={device}
          channel={`private-${snakeCase(device.name)}-${ip}`}
        />
      ))}
    </div>
  );
}
