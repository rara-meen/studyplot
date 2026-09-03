import React from "react";
import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiFileText,
  FiBookOpen,
  FiMessageSquare,
  FiLayers,
  FiHelpCircle,
  FiEdit3,
  FiSettings,
  FiUploadCloud,
  FiX,
  FiChevronsLeft,
  FiBarChart2,
} from "react-icons/fi";
import { cn } from "../../utils/cn";
import { useAppContext } from "../../context/AppContext";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: FiGrid },
  { label: "Documents", to: "/documents", icon: FiFileText },
  { label: "Upload", to: "/upload", icon: FiUploadCloud },
  { label: "Summary", to: "/summary", icon: FiBookOpen },
  { label: "AI Chat", to: "/chat", icon: FiMessageSquare },
  { label: "Flashcards", to: "/flashcards", icon: FiLayers },
  { label: "Quiz Generator", to: "/quiz", icon: FiHelpCircle },
  { label: "Notes", to: "/notes", icon: FiEdit3 },
  { label: "Analytics", to: "/analytics", icon: FiBarChart2 },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useAppContext();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface-card px-3 py-6 transition-all duration-250 ease-out dark:border-border-dark dark:bg-night-card",
          "lg:fixed lg:translate-x-0",
          isSidebarCollapsed ? "lg:w-[76px]" : "lg:w-64",
          "w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div
          className={cn(
            "mb-8 flex items-center px-2",
            isSidebarCollapsed ? "lg:justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] bg-brand-primary text-sm font-extrabold text-white">
              S
            </span>
            <span
              className={cn(
                "font-display text-lg font-extrabold text-ink transition-all duration-200 dark:text-ink-dark",
                isSidebarCollapsed && "lg:w-0 lg:opacity-0"
              )}
            >
              Study<span className="text-brand-primary">Plot</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink lg:hidden dark:text-ink-dark-muted dark:hover:text-ink-dark"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isSidebarCollapsed && "lg:justify-center lg:px-0",
                  isActive
                    ? "bg-brand-primary text-white"
                    : "text-ink-muted hover:bg-brand-primary/[0.06] hover:text-ink dark:text-ink-dark-muted dark:hover:bg-white/[0.05] dark:hover:text-ink-dark"
                )
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className={cn(isSidebarCollapsed && "lg:hidden")}>
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-2 flex flex-col gap-1 border-t border-border pt-3 dark:border-border-dark">
          <NavLink
            to="/settings"
            title="Settings"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isSidebarCollapsed && "lg:justify-center lg:px-0",
                isActive
                  ? "bg-brand-primary text-white"
                  : "text-ink-muted hover:bg-brand-primary/[0.06] hover:text-ink dark:text-ink-dark-muted dark:hover:bg-white/[0.05] dark:hover:text-ink-dark"
              )
            }
          >
            <FiSettings size={18} className="flex-shrink-0" />
            <span className={cn(isSidebarCollapsed && "lg:hidden")}>
              Settings
            </span>
          </NavLink>

          <button
            onClick={toggleSidebarCollapsed}
            className={cn(
              "hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-brand-primary/[0.06] hover:text-ink lg:flex dark:text-ink-dark-muted dark:hover:bg-white/[0.05] dark:hover:text-ink-dark",
              isSidebarCollapsed && "justify-center px-0"
            )}
            aria-label="Toggle sidebar width"
          >
            <FiChevronsLeft
              size={18}
              className={cn(
                "flex-shrink-0 transition-transform duration-250",
                isSidebarCollapsed && "rotate-180"
              )}
            />
            <span className={cn(isSidebarCollapsed && "hidden")}>
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
