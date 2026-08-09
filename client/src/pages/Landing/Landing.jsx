import React from "react";
import { motion } from "framer-motion";
import {
  FiBookOpen,
  FiMessageSquare,
  FiLayers,
  FiHelpCircle,
  FiEdit3,
  FiTrendingUp,
  FiUploadCloud,
  FiCpu,
  FiZap,
  FiClock,
  FiRepeat,
  FiFolder,
  FiArrowRight,
  FiArrowDown,
} from "react-icons/fi";
import Hero from "../../components/shared/Hero";
import FeatureCard from "../../components/shared/FeatureCard";
import Button from "../../components/shared/Button";

const features = [
  {
    icon: FiBookOpen,
    title: "AI PDF Summaries",
    description:
      "Turn dense chapters into clear, structured summaries you can actually remember.",
  },
  {
    icon: FiLayers,
    title: "AI Flashcards",
    description:
      "Auto-generate spaced-repetition flashcards from any uploaded material.",
  },
  {
    icon: FiHelpCircle,
    title: "AI Quiz Generation",
    description:
      "Test your understanding with quizzes built from what you're actually studying.",
  },
  {
    icon: FiMessageSquare,
    title: "AI Chat with Documents",
    description:
      "Ask your documents questions directly and get answers grounded in the source text.",
  },
  {
    icon: FiEdit3,
    title: "Smart Notes",
    description:
      "Capture your own notes alongside every document, all in one workspace.",
  },
  {
    icon: FiTrendingUp,
    title: "Progress Tracking",
    description:
      "See your study streaks, weekly hours, and mastery at a glance.",
  },
];

const steps = [
  {
    icon: FiUploadCloud,
    title: "Upload your PDF",
    description: "Drop in a textbook chapter, lecture notes, or any document.",
  },
  {
    icon: FiCpu,
    title: "AI analyzes your notes",
    description: "StudyPlot reads and breaks down the material in seconds.",
  },
  {
    icon: FiZap,
    title: "Learn faster",
    description: "Study with summaries, flashcards, quizzes, and AI chat.",
  },
];

const reasons = [
  {
    icon: FiClock,
    title: "Save study time",
    description: "Spend less time re-reading and more time actually learning.",
  },
  {
    icon: FiRepeat,
    title: "Better retention",
    description: "Spaced-repetition flashcards and quizzes help concepts stick.",
  },
  {
    icon: FiFolder,
    title: "Stay organized",
    description: "Every summary, flashcard, and note lives in one workspace.",
  },
  {
    icon: FiCpu,
    title: "AI-powered revision",
    description: "Let AI turn raw material into study-ready content instantly.",
  },
];

const stats = [
  { value: "10,000+", label: "Flashcards Generated" },
  { value: "1,000+", label: "Hours of Study Saved" },
  { value: "100%", label: "AI-Powered Learning" },
  { value: "< 30s", label: "Fast PDF Processing" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const Landing = () => {
  return (
    <div>
      <Hero />

      {/* Features */}
      <section id="features" className="scroll-mt-20 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-14 max-w-xl text-center"
          >
            <h2 className="font-display text-3xl font-semibold text-ink dark:text-ink-dark">
              Everything you need to study
            </h2>
            <p className="mt-3 text-ink-muted dark:text-ink-dark-muted">
              One workspace for every step, from a raw PDF to a mastered
              topic.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} index={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border px-6 py-20 dark:border-border-dark">
        <div className="mx-auto max-w-5xl">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-14 max-w-xl text-center"
          >
            <h2 className="font-display text-3xl font-semibold text-ink dark:text-ink-dark">
              How it works
            </h2>
            <p className="mt-3 text-ink-muted dark:text-ink-dark-muted">
              Three simple steps between you and a mastered topic.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative flex flex-col items-center text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white">
                  <step.icon size={20} />
                </span>
                <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint">
                  Step {index + 1}
                </span>
                <h3 className="mt-1 font-display text-base font-semibold text-ink dark:text-ink-dark">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-[220px] text-sm text-ink-muted dark:text-ink-dark-muted">
                  {step.description}
                </p>

                {index < steps.length - 1 && (
                  <>
                    <FiArrowRight
                      size={20}
                      className="absolute right-[-28px] top-5 hidden text-ink-faint sm:block dark:text-ink-dark-faint"
                    />
                    <FiArrowDown
                      size={20}
                      className="mt-6 text-ink-faint sm:hidden dark:text-ink-dark-faint"
                    />
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why StudyPlot */}
      <section className="border-t border-border bg-surface-subtle px-6 py-20 dark:border-border-dark dark:bg-white/[0.02]">
        <div className="mx-auto max-w-5xl">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-14 max-w-xl text-center"
          >
            <h2 className="font-display text-3xl font-semibold text-ink dark:text-ink-dark">
              Why StudyPlot
            </h2>
            <p className="mt-3 text-ink-muted dark:text-ink-dark-muted">
              Built to help you study efficiently, not just digitally.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {reasons.map((reason, index) => (
              <motion.div
                key={reason.title}
                {...fadeUp}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex items-start gap-4"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
                  <reason.icon size={18} />
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink dark:text-ink-dark">
                    {reason.title}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted dark:text-ink-dark-muted">
                    {reason.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border px-6 py-20 dark:border-border-dark">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                {...fadeUp}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="surface-card p-6 text-center"
              >
                <p className="font-display text-2xl font-semibold text-ink sm:text-3xl dark:text-ink-dark">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-ink-muted sm:text-sm dark:text-ink-dark-muted">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border px-6 py-20 dark:border-border-dark">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="surface-card mx-auto flex max-w-3xl flex-col items-center gap-6 p-10 text-center sm:p-14"
        >
          <h2 className="font-display text-3xl font-semibold text-ink sm:text-4xl dark:text-ink-dark">
            Ready to study smarter?
          </h2>
          <p className="max-w-md text-ink-muted dark:text-ink-dark-muted">
            Upload your first PDF and let StudyPlot build your summaries,
            flashcards, and quizzes for you.
          </p>
          <Button as="a" href="/dashboard" size="lg">
            Get Started
            <FiArrowRight />
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default Landing;
