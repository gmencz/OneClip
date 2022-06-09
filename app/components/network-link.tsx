import { ClipboardCopyIcon, ShareIcon } from "@heroicons/react/solid";
import { useLocation } from "@remix-run/react";
import toast from "react-hot-toast";

export function NetworkLink() {
  const location = useLocation();
  const networkLink = `https://oneclip.io${location.pathname}`;

  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(networkLink);
      toast.success(<span className="text-sm">Copied to clipboard</span>, {
        style: {
          paddingLeft: "15px",
          paddingRight: 0
        },
        duration: 4000
      });
    } catch (error) {
      toast.error(
        <span className="text-sm">Failed to copy link to clipboard</span>,
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

  const shareLink = async () => {
    try {
      await navigator.share({ url: networkLink });
    } catch (error) {
      toast.error(<span className="text-sm">Failed to share link</span>, {
        style: {
          paddingLeft: "15px",
          paddingRight: 0
        },
        duration: 4000
      });
    }
  };

  return (
    <div className="bg-gray-800 sm:pl-3 rounded sm:flex items-center">
      <span className="text-sm sm:mr-3 font-medium text-gray-200 block p-2 sm:p-0">
        {networkLink}
      </span>

      <div className="flex divide-x divide-gray-500">
        <button
          onClick={copyLinkToClipboard}
          className="flex items-center justify-center py-2 px-3 bg-gray-700 hover:bg-opacity-75 flex-1 rounded-bl sm:rounded-bl-none"
        >
          <ClipboardCopyIcon
            className="h-[1.15rem] w-[1.15rem] text-gray-200"
            aria-hidden="true"
          />
          <span className="sr-only">Copy link to clipboard</span>
        </button>

        <button
          onClick={shareLink}
          className="flex items-center justify-center py-2 px-3 bg-gray-700 sm:rounded-tr rounded-br hover:bg-opacity-75 flex-1"
        >
          <ShareIcon
            className="h-[1.15rem] w-[1.15rem] text-gray-200"
            aria-hidden="true"
          />
          <span className="sr-only">Share link</span>
        </button>
      </div>
    </div>
  );
}
