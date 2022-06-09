import { useLocation } from "@remix-run/react";
import type { Device } from "~/types";
import { DevicesList } from "./devices-list";
import { InfoFooter } from "./info-footer";

interface MainScreenProps {
  networkID: string;
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

export function MainScreen({
  devices,
  networkID,
  deviceInfo
}: MainScreenProps) {
  const devicesHalves = getDeviceHalves(devices);
  const location = useLocation();

  return (
    <>
      <DevicesList
        devicesHalves={devicesHalves}
        networkID={networkID}
        myDevice={deviceInfo}
      />

      {devicesHalves.first.length === 0 && devicesHalves.second.length === 0 ? (
        <p className="text-gray-200 text-center mt-12">
          Open{" "}
          <a
            className="text-brand font-semibold hover:text-opacity-75"
            href={location.pathname}
          >
            this link
          </a>{" "}
          on other devices to start sharing
        </p>
      ) : null}

      <InfoFooter myDevice={deviceInfo} />
    </>
  );
}
