import { Form } from "remix";
import { Device, useDeviceIcon } from "../utils/device";

type Props = {
  device: Device;
  channel: string;
  clipboardText: string;
  myDeviceName: string;
};

export function DiscoveredDevice({
  device,
  channel,
  myDeviceName,
  clipboardText
}: Props) {
  let icon = useDeviceIcon(device.type);

  return (
    <Form replace method="post">
      <button
        type="submit"
        className="w-[5.35rem] h-[5.35rem] rounded-full bg-brand flex items-center justify-center text-white relative"
      >
        {icon}
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-25" />
        <span className="bg-white text-gray-800 text-sm absolute top-[88%] whitespace-nowrap rounded-full py-1 px-2 font-bold">
          {device.name}
        </span>
      </button>

      <input id="channel" name="channel" type="hidden" value={channel} />
      <input id="from" name="from" type="hidden" value={myDeviceName} />
      <input id="text" name="text" type="hidden" value={clipboardText} />
    </Form>
  );
}
