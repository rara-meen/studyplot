import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const variantStyles = {
  primary: "bg-brand-primary text-white hover:bg-brand-primary-hover",
  secondary:
    "border border-border bg-surface-card text-ink hover:border-brand-primary/30 hover:bg-brand-primary/[0.04] dark:border-border-dark dark:bg-night-raised dark:text-ink-dark dark:hover:bg-white/[0.06]",
  ghost:
    "text-ink-muted hover:bg-brand-primary/[0.06] hover:text-ink dark:text-ink-dark-muted dark:hover:bg-white/[0.06] dark:hover:text-ink-dark",
  danger: "bg-danger text-white hover:brightness-95",
};

const sizeStyles = {
  sm: "px-4 py-2 text-sm rounded-xl",
  md: "px-6 py-3 text-sm rounded-xl",
  lg: "px-8 py-4 text-base rounded-2xl",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  as: Component = "button",
  disabled = false,
  ...props
}) => {
  const MotionComponent =
    typeof Component === "string"
      ? motion[Component] || motion.button
      : motion(Component);

  return (
    <MotionComponent
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      disabled={disabled}
      className={cn(
        "btn-ripple inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </MotionComponent>
  );
};

export default Button;
