import React from "react";
import { motion } from "framer-motion";

const FeatureCard = ({ icon: Icon, title, description, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="surface-card group p-6 transition-all duration-300 hover:border-border-hover hover:-translate-y-1 dark:hover:border-border-dark-hover"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary text-white transition-transform duration-300 group-hover:scale-110">
        <Icon size={20} />
      </div>
      <h3 className="font-display text-base font-semibold text-ink dark:text-ink-dark">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted dark:text-ink-dark-muted">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
