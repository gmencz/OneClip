import { createContext, useContext } from "react";
import type { Notification } from "~/types";

interface NotificationsStore {
  notifications: Notification[];
  setNotifications: React.Dispatch<Notification[]>;
}

const NotificationsContext = createContext<NotificationsStore | null>(null);

function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications can only be used within a NotificationsProvider"
    );
  }

  return context;
}

export { useNotifications, NotificationsContext };
