import type { ReactNode } from "react";
import { useState } from "react";
import { NotificationsContext } from "~/hooks/use-notifications";
import type { Notification } from "~/types";

interface Props {
  children: ReactNode;
}

function NotificationsProvider({ children }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export { NotificationsProvider };
