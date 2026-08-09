import React, { useState } from "react";
import {
  FiSun,
  FiMoon,
  FiBell,
  FiGlobe,
  FiInfo,
  FiChevronDown,
  FiShield,
  FiFileText,
  FiGithub,
  FiTag,
} from "react-icons/fi";
import PageHeader from "../../components/shared/PageHeader";
import Card from "../../components/shared/Card";
import { useAppContext } from "../../context/AppContext";
import packageJson from "../../../package.json";

const LANGUAGES = [
  { code: "en", label: "English", available: true },
  { code: "es", label: "Español", available: false },
  { code: "fr", label: "Français", available: false },
  { code: "hi", label: "हिन्दी", available: false },
];

const getInitialNotifications = () => {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem("studyplot-notifications");
  return stored === null ? true : stored === "true";
};

const getInitialLanguage = () => {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem("studyplot-language") || "en";
};

const Toggle = ({ checked, onChange, label }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
      checked ? "bg-brand-primary" : "bg-black/10 dark:bg-white/15"
    }`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform ${
        checked ? "translate-x-[22px]" : "translate-x-0.5"
      }`}
    />
  </button>
);

const AccordionSection = ({ icon: Icon, title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0 dark:border-border-dark">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="flex items-center gap-3">
          <Icon size={16} className="text-ink-muted dark:text-ink-dark-muted" />
          <span className="text-sm font-medium text-ink dark:text-ink-dark">{title}</span>
        </span>
        <FiChevronDown
          size={16}
          className={`text-ink-faint transition-transform dark:text-ink-dark-faint ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="pb-4 pl-7 pr-2 text-sm leading-relaxed text-ink-muted dark:text-ink-dark-muted">
          {children}
        </div>
      )}
    </div>
  );
};

const Settings = () => {
  const { theme, toggleTheme } = useAppContext();
  const [notifications, setNotifications] = useState(getInitialNotifications);
  const [language, setLanguage] = useState(getInitialLanguage);

  const handleNotificationsChange = (value) => {
    setNotifications(value);
    window.localStorage.setItem("studyplot-notifications", String(value));
  };

  const handleLanguageChange = (code) => {
    setLanguage(code);
    window.localStorage.setItem("studyplot-language", code);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" description="Manage your workspace preferences." />

      {/* Preferences */}
      <Card className="mb-6 divide-y divide-border p-0 dark:divide-border-dark">
        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              {theme === "dark" ? <FiMoon size={15} /> : <FiSun size={15} />}
            </span>
            <div>
              <p className="text-sm font-medium text-ink dark:text-ink-dark">Theme</p>
              <p className="text-xs text-ink-faint dark:text-ink-dark-faint">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </p>
            </div>
          </div>
          <Toggle checked={theme === "dark"} onChange={toggleTheme} label="Toggle dark mode" />
        </div>

        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <FiBell size={15} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink dark:text-ink-dark">Notifications</p>
              <p className="text-xs text-ink-faint dark:text-ink-dark-faint">
                Get notified about study activity
              </p>
            </div>
          </div>
          <Toggle
            checked={notifications}
            onChange={handleNotificationsChange}
            label="Toggle notifications"
          />
        </div>

        <div className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
              <FiGlobe size={15} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink dark:text-ink-dark">Language</p>
              <p className="text-xs text-ink-faint dark:text-ink-dark-faint">
                Choose your interface language
              </p>
            </div>
          </div>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            aria-label="Language"
            className="rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-ink transition-colors focus:border-brand-primary/40 focus:outline-none focus:ring-4 focus:ring-brand-primary/10 dark:border-border-dark dark:bg-night-raised dark:text-ink-dark"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} disabled={!lang.available}>
                {lang.label}
                {!lang.available ? " (coming soon)" : ""}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* About */}
      <Card className="p-0">
        <div className="p-5">
          <h2 className="font-display text-sm font-semibold text-ink dark:text-ink-dark">
            About
          </h2>
        </div>
        <div className="px-5">
          <AccordionSection icon={FiInfo} title="About StudyPlot">
            StudyPlot is an AI-powered study workspace. Upload a PDF and generate
            summaries, flashcards, and quizzes, or chat directly with your document —
            all powered by Google&rsquo;s Gemini API.
          </AccordionSection>

          <AccordionSection icon={FiTag} title="Version">
            StudyPlot v{packageJson.version}
          </AccordionSection>

          <AccordionSection icon={FiShield} title="Privacy Policy">
            <p className="mb-2">
              StudyPlot does not require an account. Documents you upload are
              processed to generate summaries, flashcards, quizzes, and chat
              responses using Google&rsquo;s Gemini API.
            </p>
            <p className="mb-2">
              Preferences such as your theme, profile name, and study-time tracking
              are stored locally in your browser and are never sent to a server.
            </p>
            <p>
              Uploaded documents and AI-generated content are stored to power the
              app&rsquo;s features and can be deleted at any time from the Documents page.
            </p>
          </AccordionSection>

          <AccordionSection icon={FiFileText} title="Terms of Service">
            <p className="mb-2">
              StudyPlot is provided as-is for study and productivity purposes. AI
              responses are generated automatically and may occasionally be
              inaccurate — always verify important information.
            </p>
            <p>
              You&rsquo;re responsible for the content you upload. Don&rsquo;t upload
              material you don&rsquo;t have the right to use.
            </p>
          </AccordionSection>

          <AccordionSection icon={FiGithub} title="GitHub Repository">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-primary hover:underline"
            >
              View source on GitHub
            </a>
          </AccordionSection>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
