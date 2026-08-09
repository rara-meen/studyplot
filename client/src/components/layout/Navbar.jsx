import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import Button from "../shared/Button";

const navLinks = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Summary", to: "/summary" },
  { label: "Flashcards", to: "/flashcards" },
  { label: "Quiz", to: "/quiz" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-base dark:border-border-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-lg font-semibold text-ink dark:text-ink-dark">
          Study<span className="text-brand-primary">Plot</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-ink dark:text-ink-dark" : "text-ink-muted hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button as="a" href="/dashboard" size="sm">
            Get Started
          </Button>
        </div>

        <button
          className="text-ink md:hidden dark:text-ink-dark"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {isOpen && (
        <nav className="flex flex-col gap-1 border-t border-border px-6 py-4 md:hidden dark:border-border-dark">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-brand-primary/[0.06] hover:text-ink dark:text-ink-dark-muted dark:hover:text-ink-dark"
            >
              {link.label}
            </NavLink>
          ))}
          <Button as="a" href="/dashboard" size="sm" className="mt-2 w-full">
            Get Started
          </Button>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
