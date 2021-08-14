import toast from "react-hot-toast";
import { Form, useSubmit } from "remix";
import { Device, useDeviceIcon } from "../utils/device";

type Props = {
  device: Device;
  channel: string;
  myDeviceName: string;
};

export function DiscoveredDevice({ device, channel, myDeviceName }: Props) {
  let icon = useDeviceIcon(device.type);
  let submit = useSubmit();

  return (
    <button
      onClick={async () => {
        try {
          let text = await navigator.clipboard.readText();
          let formData = new FormData();
          formData.append("deviceName", device.name);
          formData.append("channel", channel);
          formData.append("from", myDeviceName);
          formData.append("text", text);

          submit(formData, {
            method: "post",
            action: "/",
            encType: "application/x-www-form-urlencoded"
          });
        } catch (error) {
          console.error(error);
          toast.error(
            <span className="text-sm">
              Something went wrong reading your clipboard
            </span>,
            {
              style: {
                paddingLeft: "15px",
                paddingRight: 0
              },
              duration: 4000
            }
          );
        }
      }}
      className="w-[5.35rem] h-[5.35rem] rounded-full bg-brand flex items-center justify-center text-white relative hover:bg-opacity-80 focus:outline-none focus:ring focus:ring-white"
    >
      {icon}
      <span className="bg-white text-gray-800 text-sm absolute top-[88%] whitespace-nowrap rounded-full py-1 px-2 font-bold">
        {device.name}
      </span>
    </button>
  );
}
