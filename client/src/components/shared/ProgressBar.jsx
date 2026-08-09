import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const ProgressBar = ({ progress = 0, className = "", trackClassName = "" }) => {
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-brand-primary/10 dark:bg-white/[0.06]",
        trackClassName
      )}
    >
      <motion.div
        className={cn("h-full rounded-full bg-brand-primary", className)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
    </div>
  );
};

export default ProgressBar;
