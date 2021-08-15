import { Device, useDevice } from "../utils/device";
import { Connecting } from "./connecting";
import { DevicesList } from "./devices-list";
import { Header } from "./header";
import { InfoFooter } from "./info-footer";

type Props = {
  myDevice: ReturnType<typeof useDevice>;
  ip: string;
  devicesHalves: {
    first: Device[];
    second: Device[];
  };
};

export function MainScreen({ myDevice, devicesHalves, ip }: Props) {
  return (
    <div className="flex flex-col h-full bg-gray-900 relative items-center justify-center">
      <div className="p-4 lg:py-6 lg:px-12 ml-auto">
        <Header />
      </div>

      <div className="p-12 flex flex-1 flex-col items-center justify-center relative">
        {myDevice.isConnecting ? (
          <Connecting />
        ) : myDevice.isConnected && !!myDevice.info ? (
          <>
            <DevicesList
              devicesHalves={devicesHalves}
              ip={ip}
              myDevice={myDevice.info}
            />

            {devicesHalves.first.length === 0 &&
            devicesHalves.second.length === 0 ? (
              <p className="text-gray-200 text-center mt-12">
                Open OneClip on other devices to start sharing
              </p>
            ) : null}

            <InfoFooter myDevice={myDevice.info} />
          </>
        ) : null}
      </div>
    </div>
  );
}
