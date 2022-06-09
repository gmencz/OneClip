import { useSubmit } from "@remix-run/react";
import toast from "react-hot-toast";
import { useDeviceIcon } from "~/hooks/use-device-icon";
import type { Device } from "~/types";

interface DiscoveredDeviceProps {
  device: Device;
  channel: string;
  myDevice: Device;
}

function DiscoveredDevice({
  device,
  channel,
  myDevice
}: DiscoveredDeviceProps) {
  const icon = useDeviceIcon(device.type);
  const submit = useSubmit();

  const shareClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        toast.error(<span className="text-sm">Your clipboard is empty</span>, {
          style: {
            paddingLeft: "15px",
            paddingRight: 0
          },
          duration: 4000
        });
        return;
      }

      const formData = new FormData();
      formData.append("deviceName", device.name);
      formData.append("channel", channel);
      formData.append("fromName", myDevice.name);
      formData.append("fromType", myDevice.type);
      formData.append("text", text);

      submit(formData, {
        method: "post",
        encType: "application/x-www-form-urlencoded"
      });
    } catch (error) {
      console.error(error);
      toast.error(
        <span className="text-sm">
          Something went wrong sharing your clipboard
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
  };

  return (
    <button
      onClick={shareClipboard}
      className="w-[5.35rem] h-[5.35rem] rounded-full bg-brand flex items-center justify-center text-gray-100 relative hover:bg-opacity-80 focus:outline-none focus:ring focus:ring-white"
    >
      {icon}
      <span className="bg-white text-gray-800 text-sm absolute top-[88%] whitespace-nowrap rounded-full py-1 px-2 font-bold">
        {device.name}
      </span>
    </button>
  );
}

export { DiscoveredDevice };
