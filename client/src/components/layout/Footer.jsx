import React from "react";
import { Link } from "react-router-dom";
import { FiGithub, FiLinkedin, FiMail } from "react-icons/fi";

const quickLinks = [
  { label: "Features", href: "/#features" },
  { label: "Get Started", href: "/dashboard" },
];

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/maryam-rahmeen-1ba9133ab",
    icon: FiLinkedin,
  },
  {
    label: "Email",
    href: "mailto:maryamrahmeen@gmail.com",
    icon: FiMail,
  },
  {
    label: "GitHub",
    href: "https://github.com/rara-meen",
    icon: FiGithub,
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-border px-6 py-10 dark:border-border-dark">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
        <Link to="/" className="font-display text-base font-semibold text-ink dark:text-ink-dark">
          Study<span className="text-brand-primary">Plot</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm text-ink-muted dark:text-ink-dark-muted">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-ink dark:hover:text-ink-dark dark:text-ink-dark"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-ink-muted dark:text-ink-dark-muted">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={label === "Email" ? undefined : "_blank"}
              rel={label === "Email" ? undefined : "noreferrer"}
              aria-label={label}
              className="transition-colors hover:text-ink dark:hover:text-ink-dark dark:text-ink-dark"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-ink-faint dark:text-ink-dark-faint">
        &copy; {new Date().getFullYear()} StudyPlot. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
