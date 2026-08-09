import React from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import Card from "./Card";

const SummarySectionCard = ({ icon: Icon, title, content, variant = "list", index = 0 }) => {
  const isEmpty =
    variant === "list" ? !content || content.length === 0 : !content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Card className="h-full">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-primary text-white">
            <Icon size={16} />
          </div>
          <h3 className="font-display text-base font-semibold text-ink dark:text-ink-dark">
            {title}
          </h3>
        </div>

        {isEmpty && (
          <p className="text-sm text-ink-faint dark:text-ink-dark-faint">Nothing to show here yet.</p>
        )}

        {!isEmpty && variant === "prose" && (
          <div className="prose-summary text-sm leading-relaxed text-ink-muted dark:text-ink-dark-muted">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

        {!isEmpty && variant === "list" && (
          <ul className="space-y-2.5">
            {content.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-ink-muted dark:text-ink-dark-muted">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-cyan" />
                <span className="leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <span>{children}</span>,
                    }}
                  >
                    {item}
                  </ReactMarkdown>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </motion.div>
  );
};

export default SummarySectionCard;
