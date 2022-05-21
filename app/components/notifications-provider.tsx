import type { ReactNode } from "react";
import useLocalStorageState from "use-local-storage-state";
import { NotificationsContext } from "~/hooks/use-notifications";
import type { Notification } from "~/types";

interface Props {
  children: ReactNode;
}

const localStorageKey = "notifications";
function NotificationsProvider({ children }: Props) {
  const [notifications, setNotifications] = useLocalStorageState<
    Notification[]
  >(localStorageKey, { defaultValue: [] });

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export { NotificationsProvider };
