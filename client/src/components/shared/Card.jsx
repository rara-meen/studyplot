import React from "react";
import { cn } from "../../utils/cn";

const Card = ({ children, className = "", hoverable = false, as: Component = "div", ...props }) => {
  return (
    <Component
      className={cn(
        "surface-card p-6",
        hoverable &&
          "transition-all duration-250 hover:-translate-y-1 hover:shadow-card-hover dark:hover:border-border-dark-hover",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
