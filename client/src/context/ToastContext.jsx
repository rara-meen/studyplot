import React, { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const ToastContext = createContext(null);

const iconMap = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

const accentMap = {
  success: "text-emerald-700 border-emerald-500/30 dark:text-emerald-400 dark:border-emerald-400/30",
  error: "text-rose-700 border-rose-500/30 dark:text-rose-400 dark:border-rose-400/30",
  info: "text-brand-primary border-brand-primary/30 dark:text-brand-secondary dark:border-brand-secondary/30",
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    info: (message, duration) => showToast(message, "info", duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
        <AnimatePresence>
          {toasts.map(({ id, message, type }) => {
            const Icon = iconMap[type] || FiInfo;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: -16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`surface-card pointer-events-auto flex w-full max-w-sm items-start gap-3 px-4 py-3 ${accentMap[type]}`}
              >
                <Icon size={18} className="mt-0.5 flex-shrink-0" />
                <p className="flex-1 text-sm text-ink dark:text-ink-dark">{message}</p>
                <button
                  onClick={() => removeToast(id)}
                  className="flex-shrink-0 text-ink-faint hover:text-ink dark:text-ink-dark-faint dark:hover:text-ink-dark"
                  aria-label="Dismiss notification"
                >
                  <FiX size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
