import { useCallback, useState } from "react";
import { notificationService } from "../services/notificationService";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.list();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err, "Couldn't load notifications.");
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Non-critical — leave as unread, user can retry.
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Non-critical
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await notificationService.clear();
      setNotifications([]);
      setUnreadCount(0);
      return { success: true };
    } catch (err) {
      return { success: false, error: getErrorMessage(err, "Couldn't clear notifications.") };
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};
