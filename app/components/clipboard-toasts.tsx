import { useTransition } from "@remix-run/react";
import { useEffect } from "react";
import toast from "react-hot-toast";

interface ClipboardToastsProps {
  clipboardError?: string;
  lastDeviceName?: string;
}

function ClipboardToasts({
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

export { ClipboardToasts };
