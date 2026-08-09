import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingSpinner from "./LoadingSpinner";

const DEFAULT_STAGES = [
  "Analyzing document...",
  "Reading pages...",
  "Generating summary...",
  "Formatting notes...",
];

const AiLoadingStages = ({ stages = DEFAULT_STAGES, intervalMs = 2200 }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % stages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [stages, intervalMs]);

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <LoadingSpinner size="lg" />
      <AnimatePresence mode="wait">
        <motion.p
          key={stages[index]}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-medium text-ink-muted dark:text-ink-dark-muted"
        >
          {stages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};

export default AiLoadingStages;
