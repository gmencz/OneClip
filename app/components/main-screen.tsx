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
    <div className="flex flex-col h-full p-12 bg-gray-900 relative items-center justify-center">
      <Header />

      {myDevice.isConnecting ? (
        <Connecting />
      ) : myDevice.isConnected && !!myDevice.info ? (
        <>
          <DevicesList
            devicesHalves={devicesHalves}
            ip={ip}
            myDevice={myDevice.info}
          />

          <InfoFooter myDevice={myDevice.info} />
        </>
      ) : null}
    </div>
  );
}
