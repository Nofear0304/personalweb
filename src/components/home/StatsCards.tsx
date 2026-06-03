"use client";

import CountUp from "@/components/ui/CountUp";
import FadeIn from "@/components/ui/FadeIn";
import type { SiteStats } from "@/types";

interface StatsCardsProps {
  stats: SiteStats;
}

const statDefs = [
  { key: "articleCount" as const, label: "文章", icon: "📝", suffix: " 篇" },
  { key: "imageCount" as const, label: "照片", icon: "📷", suffix: " 张" },
  { key: "journeyCount" as const, label: "成长阶段", icon: "🚀", suffix: " 个" },
  { key: "gardenCount" as const, label: "花园笔记", icon: "🌱", suffix: " 篇" },
];

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <section className="max-w-6xl mx-auto px-5 py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statDefs.map((def, i) => (
          <FadeIn key={def.key} delay={i * 0.1}>
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <span className="text-2xl mb-2 block">{def.icon}</span>
              <div className="font-serif text-3xl font-bold mb-1">
                <CountUp end={stats[def.key]} suffix={def.suffix} />
              </div>
              <p className="text-xs text-[var(--muted)]">{def.label}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
