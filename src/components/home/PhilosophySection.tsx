"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/data/site-config";

export default function PhilosophySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="philosophy"
      className="max-w-4xl mx-auto px-5 py-24 sm:py-32"
    >
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-20"
      >
        <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
          Philosophy
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold">
          人生信条
        </h2>
      </motion.div>

      {/* Philosophy items */}
      <div className="flex flex-col gap-20 sm:gap-24">
        {siteConfig.philosophy.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.2 + index * 0.15,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="relative"
          >
            {/* Decorative accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{
                duration: 0.8,
                delay: 0.4 + index * 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="absolute -left-4 sm:-left-8 top-2 w-1.5 h-12 bg-[var(--accent)] rounded-full origin-top"
              style={{ transformOrigin: "top" }}
            />

            <div className="pl-6 sm:pl-10">
              <motion.h3
                className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5 tracking-tight"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.35 + index * 0.15,
                }}
              >
                {item.text}
              </motion.h3>
              <motion.p
                className="text-base sm:text-lg text-[var(--muted)] leading-relaxed max-w-xl"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{
                  duration: 0.5,
                  delay: 0.5 + index * 0.15,
                }}
              >
                {item.description}
              </motion.p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
