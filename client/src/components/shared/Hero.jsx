import React from "react";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiGrid,
  FiFileText,
  FiLayers,
  FiHelpCircle,
} from "react-icons/fi";
import Button from "./Button";

const sidebarIcons = [FiGrid, FiFileText, FiLayers, FiHelpCircle];

const Hero = () => {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:pt-32">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Text column */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-ink-muted lg:mx-0 dark:text-ink-dark-muted dark:border-border-dark"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
            AI-powered studying
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl dark:text-ink-dark"
          >
            Your AI-powered
            <br />
            learning workspace.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto mt-5 max-w-lg text-base text-ink-muted sm:text-lg lg:mx-0 dark:text-ink-dark-muted"
          >
            Upload any PDF and StudyPlot turns it into summaries, flashcards,
            and quizzes — then lets you chat with it, so you can study
            smarter, not longer.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start"
          >
            <Button as="a" href="/dashboard" size="lg">
              Get Started
              <FiArrowRight />
            </Button>
            <Button as="a" href="#features" variant="secondary" size="lg">
              Learn More
            </Button>
          </motion.div>
        </div>

        {/* Mockup column */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
        >
          <div className="surface-card overflow-hidden p-0">
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-border px-4 py-3 dark:border-border-dark">
              <span className="h-2.5 w-2.5 rounded-full bg-ink-faint/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-faint/40" />
              <span className="h-2.5 w-2.5 rounded-full bg-ink-faint/40" />
              <span className="ml-3 truncate text-xs text-ink-faint dark:text-ink-dark-faint">
                studyplot.app/dashboard
              </span>
            </div>

            <div className="flex">
              {/* Mini sidebar */}
              <div className="hidden w-14 flex-shrink-0 flex-col items-center gap-3 border-r border-border py-4 sm:flex dark:border-border-dark">
                {sidebarIcons.map((Icon, i) => (
                  <span
                    key={i}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      i === 0
                        ? "bg-brand-primary text-white"
                        : "text-ink-faint dark:text-ink-dark-faint"
                    }`}
                  >
                    <Icon size={15} />
                  </span>
                ))}
              </div>

              {/* Mini content */}
              <div className="flex-1 space-y-4 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink dark:text-ink-dark">
                    Welcome back
                  </span>
                  <span className="rounded-full bg-brand-primary px-3 py-1 text-[10px] font-semibold text-white">
                    Upload PDF
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border p-3 dark:border-border-dark">
                    <div className="h-2 w-10 rounded-full bg-ink-faint/25" />
                    <div className="mt-2 h-3 w-14 rounded-full bg-brand-primary/70" />
                  </div>
                  <div className="rounded-lg border border-border p-3 dark:border-border-dark">
                    <div className="h-2 w-10 rounded-full bg-ink-faint/25" />
                    <div className="mt-2 h-3 w-14 rounded-full bg-ink-faint/40" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {[0, 1, 2].map((row) => (
                    <div
                      key={row}
                      className="flex items-center gap-3 rounded-lg border border-border p-2.5 dark:border-border-dark"
                    >
                      <span className="h-7 w-7 flex-shrink-0 rounded-md bg-brand-primary/10" />
                      <div className="flex-1 space-y-1.5">
                        <div
                          className="h-2 rounded-full bg-ink-faint/30"
                          style={{ width: `${70 - row * 12}%` }}
                        />
                        <div
                          className="h-2 rounded-full bg-ink-faint/15"
                          style={{ width: `${45 - row * 8}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
