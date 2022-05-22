import type { Device } from "~/types";
import { DevicesList } from "./devices-list";
import { InfoFooter } from "./info-footer";

interface MainScreenProps {
  ip: string;
  deviceInfo: Device;
  devices: Device[];
}

const getDeviceHalves = (devices: Device[]) => {
  const half = Math.ceil(devices.length / 2);
  return {
    first: devices.slice(0, half),
    second: devices.slice(half)
  };
};

export function MainScreen({ devices, ip, deviceInfo }: MainScreenProps) {
  const devicesHalves = getDeviceHalves(devices);

  return (
    <div className="p-12 flex flex-1 flex-col items-center justify-center relative">
      <DevicesList
        devicesHalves={devicesHalves}
        ip={ip}
        myDevice={deviceInfo}
      />

      {devicesHalves.first.length === 0 && devicesHalves.second.length === 0 ? (
        <p className="text-gray-200 text-center mt-12">
          Open OneClip on other devices to start sharing
        </p>
      ) : null}

      <InfoFooter myDevice={deviceInfo} />
    </div>
  );
}
