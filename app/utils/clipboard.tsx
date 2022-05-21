import { useTransition } from "@remix-run/react";
import { nanoid } from "nanoid";
import { useEffect } from "react";
import toast from "react-hot-toast";
import type { Notification } from "~/components/notifications";
import { MAX_NOTIFICATIONS } from "~/components/notifications";
import type { Device } from "./device";

interface ClipboardToastsProps {
  clipboardError?: string;
  lastDeviceName?: string;
}

export function ClipboardToasts({
  clipboardError,
  lastDeviceName
}: ClipboardToastsProps) {
  const transition = useTransition();

  useEffect(() => {
    if (transition.submission) {
      return;
    }

    if (clipboardError) {
      console.error(clipboardError);
      toast.error(<span className="text-sm">Failed to share clipboard</span>, {
        style: {
          paddingLeft: "15px",
          paddingRight: 0
        },
        duration: 4000
      });
      return;
    }

    if (lastDeviceName) {
      toast.success(
        <span className="text-sm">Clipboard shared with {lastDeviceName}</span>,
        {
          style: {
            paddingLeft: "15px",
            paddingRight: 0
          },
          duration: 4000
        }
      );
    }
  }, [clipboardError, lastDeviceName, transition.submission]);

  return null;
}

export interface ClipboardData {
  from: Device;
  text: string;
}

interface UseCopyToClipboardParams {
  notifications: Notification[];
  setNotifications: React.Dispatch<Notification[]>;
}

export async function copyDataToClipboard(data: string) {
  if (data.startsWith("data:image/png;base64")) {
    const imageBlob = await fetch(data).then(res => res.blob());

    navigator.clipboard.write([
      new ClipboardItem({
        "image/png": imageBlob
      })
    ]);
  } else {
    await navigator.clipboard.writeText(data);
  }
}

export function useCopyToClipboard({
  notifications,
  setNotifications
}: UseCopyToClipboardParams) {
  return async ({ from, text }: ClipboardData) => {
    try {
      await copyDataToClipboard(text);
      toast.success(
        <span className="text-sm">
          Check your clipboard, {from.name} just shared their clipboard with
          you!
        </span>,
        {
          style: {
            paddingLeft: "15px",
            paddingRight: 0
          },
          duration: 4000
        }
      );
    } catch (error) {
      if (notifications.length < MAX_NOTIFICATIONS) {
        setNotifications([
          ...notifications,
          {
            id: nanoid(),
            from: {
              name: from.name,
              type: from.type
            },
            text,
            timestamp: new Date().toISOString()
          }
        ]);

        return;
      }

      console.error(error);
      toast.error(
        <span className="text-sm">
          {from.name} shared their clipboard with you but your notifications
          folder is full so it couldn't be saved
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
}
