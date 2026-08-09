import React from "react";
import { cn } from "../../utils/cn";

const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={cn(
        "skeleton-shimmer animate-shimmer rounded-lg bg-brand-primary/[0.06] dark:bg-white/[0.06]",
        className
      )}
    />
  );
};

export default Skeleton;
