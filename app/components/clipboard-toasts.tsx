import { useActionData } from "@remix-run/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import type { ActionData } from "~/routes/$network";

function ClipboardToasts() {
  const actionData = useActionData<ActionData>();

  useEffect(() => {
    if (actionData?.clipboardError) {
      console.error(actionData?.clipboardError);
      toast.error(<span className="text-sm">Failed to share clipboard</span>, {
        style: {
          paddingLeft: "15px",
          paddingRight: 0
        },
        duration: 4000
      });
      return;
    }

    if (actionData?.lastDeviceName) {
      toast.success(
        <span className="text-sm">
          Clipboard shared with {actionData.lastDeviceName}
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
  }, [actionData?.clipboardError, actionData?.lastDeviceName]);

  return null;
}

export { ClipboardToasts };
