import React, { useEffect, useState } from "react";
import { FiBell, FiCheck, FiTrash2 } from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Button from "../../components/shared/Button";
import EmptyState from "../../components/shared/EmptyState";
import Skeleton from "../../components/shared/Skeleton";
import { useNotifications } from "../../hooks/useNotifications";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/formatDate";

const typeDot = {
  success: "bg-emerald-500 dark:bg-emerald-400",
  error: "bg-rose-500 dark:bg-rose-400",
  info: "bg-brand-primary",
};

const Notifications = () => {
  const toast = useToast();
  const [confirmClear, setConfirmClear] = useState(false);
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    const result = await clearAll();
    setConfirmClear(false);
    if (result.success) {
      toast.success("Notifications cleared.");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
            : "You're all caught up."
        }
        action={
          notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                  <FiCheck size={14} />
                  Mark all read
                </Button>
              )}
              <Button
                variant={confirmClear ? "danger" : "secondary"}
                size="sm"
                onClick={handleClear}
                onBlur={() => setConfirmClear(false)}
              >
                <FiTrash2 size={14} />
                {confirmClear ? "Confirm clear" : "Clear all"}
              </Button>
            </div>
          )
        }
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <EmptyState icon={FiBell} title="Couldn't load notifications" description={error} />
      )}

      {!isLoading && !error && notifications.length === 0 && (
        <EmptyState
          icon={FiBell}
          title="No notifications yet"
          description="You'll see updates here as you upload documents, generate study materials, and save notes."
        />
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <div className="surface-card overflow-hidden p-0">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.isRead && markAsRead(n.id)}
              className="flex w-full items-start gap-3 border-b border-border px-4 py-3.5 text-left last:border-b-0 hover:bg-brand-primary/[0.04] dark:border-border-dark dark:hover:bg-white/[0.04]"
            >
              <span
                className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                  n.isRead ? "bg-transparent" : typeDot[n.type] || typeDot.success
                }`}
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block text-sm ${
                    n.isRead
                      ? "text-ink-muted dark:text-ink-dark-muted"
                      : "font-medium text-ink dark:text-ink-dark"
                  }`}
                >
                  {n.message}
                </span>
                <span className="mt-0.5 block text-xs text-ink-faint dark:text-ink-dark-faint">
                  {formatDate(n.createdAt)}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
