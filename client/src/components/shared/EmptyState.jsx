import React from "react";
import Button from "./Button";

const EmptyState = ({
  icon: Icon,
  title = "Nothing here yet",
  description = "",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl2 border border-dashed border-border px-8 py-16 text-center dark:border-border-dark">
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary/[0.08] text-brand-primary">
          <Icon size={26} />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="font-display text-lg font-bold text-ink dark:text-ink-dark">
          {title}
        </h3>
        {description && (
          <p className="mx-auto max-w-sm text-sm text-ink-muted dark:text-ink-dark-muted">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
