import { usePendingFormSubmit } from "remix";
import { Device } from "../utils/device";

type Props = {
  myDevice: Device;
};

export function InfoFooter({ myDevice }: Props) {
  let pendingSubmit = usePendingFormSubmit();

  return (
    <div className="mt-auto flex flex-col items-center text-center">
      <img
        src="/logo.svg"
        alt="OneClip"
        className={`${pendingSubmit ? "animate-spin" : ""} h-14 w-14 mb-3`}
      />
      <p className="text-gray-200">You are known as {myDevice.name}</p>
      <p className="text-brand text-sm mt-1.5">
        You can be discovered by everyone on this network
      </p>
    </div>
  );
}
