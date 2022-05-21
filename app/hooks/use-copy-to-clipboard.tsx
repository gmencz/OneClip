import type { Device, Notification } from "~/types";

interface UseCopyToClipboardParams {
  notifications: Notification[];
  setNotifications: React.Dispatch<Notification[]>;
}

export interface ClipboardData {
  from: Device;
  text: string;
}

function useCopyToClipboard({
  notifications,
  setNotifications
}: UseCopyToClipboardParams) {
  return async ({ from, text }: ClipboardData) => {
    if (text.startsWith("data:image/png;base64")) {
      const imageBlob = await fetch(text).then(res => res.blob());

      navigator.clipboard.write([
        new ClipboardItem({
          "image/png": imageBlob
        })
      ]);
    } else {
      await navigator.clipboard.writeText(text);
    }
  };
}

export { useCopyToClipboard };
