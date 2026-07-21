import { api } from "../client";

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  mine: () => api.get<AppNotification[]>("/notifications/my"),

  unreadCount: () => api.get<number>("/notifications/unread-count"),

  markAsRead: (id: number) => api.patch<void>(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch<void>("/notifications/read-all"),
};
