import { Device, useDevice } from "../utils/device";
import { Connecting } from "./connecting";
import { DevicesList } from "./devices-list";
import { InfoFooter } from "./info-footer";

type Props = {
  myDevice: ReturnType<typeof useDevice>;
  clipboardText: string;
  ip: string;
  devicesHalves: {
    first: Device[];
    second: Device[];
  };
};

export function MainScreen({
  myDevice,
  clipboardText,
  devicesHalves,
  ip
}: Props) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-12 bg-gray-900 relative">
      {myDevice.isConnecting ? (
        <Connecting />
      ) : myDevice.isConnected && !!myDevice.info ? (
        <>
          <DevicesList
            clipboardText={clipboardText}
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
