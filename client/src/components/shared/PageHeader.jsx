import React from "react";
import { motion } from "framer-motion";

const PageHeader = ({ title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl dark:text-ink-dark">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 text-sm text-ink-muted dark:text-ink-dark-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
};

export default PageHeader;
