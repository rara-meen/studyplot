import React from "react";
import { motion } from "framer-motion";

const difficultyStyles = {
  Easy: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-400 dark:border-emerald-400/25",
  Medium:
    "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400/25",
  Hard: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-400/10 dark:text-rose-400 dark:border-rose-400/25",
};

const FlipCard = ({ question, answer, difficulty, isFlipped, onFlip }) => {
  return (
    <div className="mx-auto w-full max-w-xl" style={{ perspective: 1200, WebkitPerspective: 1200 }}>
      <motion.div
        role="button"
        tabIndex={0}
        onClick={onFlip}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onFlip()}
        className="relative h-72 w-full cursor-pointer outline-none sm:h-80"
        style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <div
          className="surface-card absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              difficultyStyles[difficulty] || difficultyStyles.Medium
            }`}
          >
            {difficulty}
          </span>
          <p className="font-display text-lg font-semibold leading-snug text-ink dark:text-ink-dark sm:text-xl">
            {question}
          </p>
          <p className="absolute bottom-6 text-xs text-ink-faint dark:text-ink-dark-faint">
            Click to reveal answer
          </p>
        </div>

        <div
          className="surface-card absolute inset-0 flex flex-col items-center justify-center gap-4 border-brand-primary/20 p-8 text-center dark:border-brand-primary/30"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            WebkitTransform: "rotateY(180deg)",
          }}
        >
          <span className="text-xs font-medium uppercase tracking-wide text-brand-primary dark:text-brand-secondary">
            Answer
          </span>
          <p className="text-sm leading-relaxed text-ink dark:text-ink-dark sm:text-base">
            {answer}
          </p>
          <p className="absolute bottom-6 text-xs text-ink-faint dark:text-ink-dark-faint">
            Click to flip back
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
