import React from "react";
import { NavLink } from "react-router-dom";
import { FiGrid, FiFileText, FiMessageSquare, FiLayers, FiUser } from "react-icons/fi";
import { cn } from "../../utils/cn";

const items = [
  { label: "Home", to: "/dashboard", icon: FiGrid },
  { label: "Docs", to: "/documents", icon: FiFileText },
  { label: "AI Chat", to: "/chat", icon: FiMessageSquare },
  { label: "Cards", to: "/flashcards", icon: FiLayers },
  { label: "Profile", to: "/profile", icon: FiUser },
];

const MobileBottomNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t border-border bg-surface-card pb-[env(safe-area-inset-bottom)] lg:hidden dark:border-border-dark dark:bg-night-card">
      {items.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex min-w-[48px] flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              isActive
                ? "text-brand-primary"
                : "text-ink-faint dark:text-ink-dark-faint"
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                  isActive && "bg-brand-primary/10"
                )}
              >
                <Icon size={18} />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
