import React from "react";
import { motion } from "framer-motion";

/**
 * Animated radial progress ring — used for daily/weekly study goals.
 * Signature visual element of the StudyPlot dashboard.
 */
const ProgressRing = ({
  progress = 0,
  size = 96,
  strokeWidth = 9,
  label,
  sublabel,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, progress) / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-brand-primary/10 dark:stroke-white/10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#4F46E5"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-display text-lg font-extrabold text-ink dark:text-ink-dark">
          {label}
        </span>
        {sublabel && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
