import { ClipboardCopyIcon, TrashIcon } from "@heroicons/react/solid";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { useCopyToClipboard } from "~/hooks/use-copy-to-clipboard";
import { useDeviceIcon } from "~/hooks/use-device-icon";
import { useNotifications } from "~/hooks/use-notifications";
import type { Notification } from "~/types";

interface NotificationItemProps {
  notification: Notification;
}

const formatNotificationTimestamp = (timestamp: string) => {
  const date = parseISO(timestamp);

  if (isToday(date)) {
    return format(date, "'Today at 'h:mm' 'aa");
  } else if (isYesterday(date)) {
    return format(date, "'Yesterday at 'h:mm' 'aa");
  } else {
    return format(date, "dd/MM/yyyy' at 'h:mm' 'aa");
  }
};

function NotificationItem({ notification }: NotificationItemProps) {
  const icon = useDeviceIcon(notification.from.type, "sm");
  const { notifications, setNotifications } = useNotifications();
  const copyToClipboard = useCopyToClipboard();

  const onClickCopy = async () => {
    try {
      await copyToClipboard(notification.text);
      toast.success(
        <span className="text-sm">
          Copied {notification.from.name}'s clipboard
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
      console.error(error);
      toast.error(
        <span className="text-sm">
          Something went wrong copying {notification.from.name}'s clipboard
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

  const dismiss = () => {
    setNotifications(notifications.filter(n => n.id !== notification.id));
  };

  return (
    <li className="py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-200 truncate">
            {notification.from.name} -{" "}
            {formatNotificationTimestamp(notification.timestamp)}
          </p>
          <p className="text-sm text-gray-300 truncate">
            Shared their clipboard
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onClickCopy}
            className="bg-gray-700 flex items-center justify-center rounded-full p-2 text-green-500 hover:text-green-400 hover:bg-gray-800"
          >
            <ClipboardCopyIcon
              className="h-[1.15rem] w-[1.15rem]"
              aria-hidden="true"
            />
            <span className="sr-only">
              Copy {notification.from.name}'s clipboard
            </span>
          </button>
          <button
            onClick={dismiss}
            className="bg-gray-700 flex items-center justify-center rounded-full p-2 text-red-500 hover:text-red-400 hover:bg-gray-800"
          >
            <TrashIcon className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            <span className="sr-only">Delete</span>
          </button>
        </div>
      </div>
    </li>
  );
}

export { NotificationItem };
