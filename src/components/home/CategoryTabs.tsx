"use client";

import { motion } from "framer-motion";

export interface Category {
  key: string;
  label: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export default function CategoryTabs({
  categories,
  activeKey,
  onChange,
  className = "",
}: CategoryTabsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
            activeKey === cat.key
              ? "text-white"
              : "text-white/50 hover:text-white/80 bg-white/[0.04] hover:bg-white/[0.08]"
          }`}
        >
          {activeKey === cat.key && (
            <motion.div
              layoutId="category-tab-indicator"
              className="absolute inset-0 bg-[var(--accent)] rounded-full -z-10"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
