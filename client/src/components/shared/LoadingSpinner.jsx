import React from "react";
import { cn } from "../../utils/cn";

const sizeMap = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

const LoadingSpinner = ({ size = "md", className = "" }) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-accent-blue/20 border-t-accent-blue",
        sizeMap[size],
        className
      )}
    />
  );
};

export default LoadingSpinner;
