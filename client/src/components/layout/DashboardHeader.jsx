import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiSearch, FiUpload, FiSun, FiMoon, FiLogOut, FiUser } from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../shared/NotificationBell";

const getInitials = (username = "") => username.slice(0, 2).toUpperCase() || "?";

const DashboardHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppContext();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface px-4 py-3.5 sm:px-6 dark:border-border-dark dark:bg-night">
      <button
        onClick={onMenuClick}
        className="text-ink-muted hover:text-ink lg:hidden dark:text-ink-dark-muted dark:hover:text-ink-dark"
        aria-label="Open sidebar"
      >
        <FiMenu size={22} />
      </button>

      <div className="relative hidden max-w-sm flex-1 lg:block">
        <FiSearch
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint dark:text-ink-dark-faint"
        />
        <input
          type="search"
          placeholder="Search documents, notes, flashcards…"
          aria-label="Search"
          className="w-full rounded-full border border-border bg-surface-card py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-brand-primary/40 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 dark:border-border-dark dark:bg-night-raised dark:text-ink-dark dark:placeholder:text-ink-dark-faint"
        />
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        <button
          onClick={() => navigate("/upload")}
          className="btn-ripple hidden items-center gap-2 rounded-full bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-brand-primary-hover sm:inline-flex"
        >
          <FiUpload size={15} />
          Upload PDF
        </button>

        <button
          onClick={() => navigate("/upload")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-white sm:hidden"
          aria-label="Upload PDF"
        >
          <FiUpload size={16} />
        </button>

        <button
          onClick={toggleTheme}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:text-ink dark:border-border-dark dark:text-ink-dark-muted dark:hover:text-ink-dark"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
        </button>

        <NotificationBell />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-brand-primary/[0.06] sm:pr-3 dark:hover:bg-white/[0.05]"
            aria-label="Account menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary text-xs font-bold text-white">
              {getInitials(user?.username)}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight text-ink dark:text-ink-dark">
                @{user?.username}
              </span>
              <span className="block text-xs leading-tight text-ink-faint dark:text-ink-dark-faint">
                {user?.email}
              </span>
            </span>
          </button>

          {isMenuOpen && (
            <div className="surface-card absolute right-0 top-12 z-40 w-44 overflow-hidden p-1">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-brand-primary/[0.06] dark:text-ink-dark dark:hover:bg-white/[0.06]"
              >
                <FiUser size={14} />
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-500/[0.06] dark:text-rose-400 dark:hover:bg-rose-400/[0.08]"
              >
                <FiLogOut size={14} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
