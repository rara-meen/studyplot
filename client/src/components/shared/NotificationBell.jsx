import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiCheck } from "react-icons/fi";
import { useNotifications } from "../../hooks/useNotifications";
import { formatDate } from "../../utils/formatDate";

const typeDot = {
  success: "bg-emerald-500 dark:bg-emerald-400",
  error: "bg-rose-500 dark:bg-rose-400",
  info: "bg-brand-primary",
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const recent = notifications.slice(0, 6);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:text-ink dark:border-border-dark dark:text-ink-dark-muted dark:hover:text-ink-dark"
        aria-label="Notifications"
      >
        <FiBell size={17} />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-accent ring-2 ring-surface-card dark:ring-night-card" />
        )}
      </button>

      {isOpen && (
        <div className="surface-card absolute right-0 top-12 z-40 w-80 max-w-[calc(100vw-2rem)] overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 dark:border-border-dark">
            <span className="text-sm font-semibold text-ink dark:text-ink-dark">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline"
              >
                <FiCheck size={12} />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && (
              <p className="px-4 py-6 text-center text-sm text-ink-muted dark:text-ink-dark-muted">
                Loading…
              </p>
            )}

            {!isLoading && recent.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-ink-muted dark:text-ink-dark-muted">
                No notifications yet.
              </p>
            )}

            {!isLoading &&
              recent.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className="flex w-full items-start gap-2.5 border-b border-border px-4 py-3 text-left last:border-b-0 hover:bg-brand-primary/[0.04] dark:border-border-dark dark:hover:bg-white/[0.04]"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                      n.isRead ? "bg-transparent" : typeDot[n.type] || typeDot.success
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-ink dark:text-ink-dark">
                      {n.message}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-faint dark:text-ink-dark-faint">
                      {formatDate(n.createdAt)}
                    </span>
                  </span>
                </button>
              ))}
          </div>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/notifications");
            }}
            className="block w-full border-t border-border px-4 py-2.5 text-center text-xs font-medium text-brand-primary hover:underline dark:border-border-dark"
          >
            View all
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
