"use client";

import { motion } from "framer-motion";
import FadeIn from "@/components/ui/FadeIn";

const techStack = [
  { name: "TypeScript", color: "#3178C6" },
  { name: "React", color: "#61DAFB" },
  { name: "Next.js", color: "#000000" },
  { name: "Node.js", color: "#339933" },
  { name: "Python", color: "#3776AB" },
  { name: "Tailwind CSS", color: "#06B6D4" },
  { name: "PostgreSQL", color: "#4169E1" },
  { name: "Docker", color: "#2496ED" },
];

export default function TechStack() {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16 border-t border-[var(--border)]">
      <FadeIn>
        <h2 className="font-serif text-2xl font-bold mb-8 text-center">
          技术栈
        </h2>
      </FadeIn>
      <div className="flex flex-wrap justify-center gap-3 max-w-xl mx-auto">
        {techStack.map((tech, i) => (
          <FadeIn key={tech.name} delay={i * 0.05}>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--border)] text-sm font-medium cursor-default"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tech.color }}
              />
              {tech.name}
            </motion.span>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
