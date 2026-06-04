import type { Metadata } from "next";
import { siteConfig } from "@/data/site-config";
import { getSiteStats, getWeeklyVisits } from "@/lib/stats";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import SectionHeading from "@/components/ui/SectionHeading";
import FadeIn from "@/components/ui/FadeIn";
import CountUp from "@/components/ui/CountUp";
import VisitTrendChart from "@/components/about/VisitTrendChart";

export const metadata: Metadata = {
  title: "关于",
  description: "了解更多关于我的信息",
};

const skills = [
  { category: "前端", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue"] },
  { category: "后端", items: ["Node.js", "Python", "PostgreSQL", "Redis"] },
  { category: "工具", items: ["Git", "Docker", "VS Code", "Figma"] },
];

const hobbies = ["📷 摄影", "📚 阅读", "🎵 音乐", "🏃 跑步", "✈️ 旅行"];

export default async function AboutPage() {
  const stats = await getSiteStats();
  const weeklyVisits = await getWeeklyVisits();

  return (
    <CosmicWrapper>
      <div className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="About"
          title="关于"
          description="了解更多关于我和这个网站的故事"
        />

        {/* Avatar + Signature */}
        <FadeIn>
          <section className="mb-20 flex flex-col items-center text-center">
            {/* Avatar with breathing glow */}
            <div
              className="w-32 h-32 rounded-full overflow-hidden mb-6"
              style={{
                animation: "avatar-breathe 4s ease-in-out infinite",
              }}
            >
              <img
                src={siteConfig.avatar}
                alt={siteConfig.name}
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
              {siteConfig.name}
            </h1>
            <p className="text-[var(--accent)] text-lg font-serif italic mb-4">
              {siteConfig.signature}
            </p>
            <p className="text-[var(--muted)] max-w-lg leading-relaxed">
              {siteConfig.tagline}
            </p>
          </section>
        </FadeIn>

        {/* Bio */}
        <FadeIn>
          <section className="mb-20">
            <h2 className="font-serif text-2xl font-bold mb-6 text-white">个人简介</h2>
            <div className="prose max-w-none">
              <p>
                04程序员，正在驯服AI，爱好摄影，梦想是环游世界。
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Stats Cards */}
        <FadeIn>
          <section className="mb-20">
            <h2 className="font-serif text-2xl font-bold mb-6 text-white">网站统计</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "博客", value: stats.articleCount },
                { label: "随笔", value: stats.noteCount },
                { label: "照片", value: stats.imageCount },
                { label: "访问量", value: stats.totalVisits ?? 0, suffix: "" },
                { label: "已运行", value: stats.daysSinceLaunch ?? 0, suffix: "天" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 sm:p-5 rounded-2xl text-center"
                  style={{
                    background: "rgba(17,24,39,0.7)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                    <CountUp end={stat.value} duration={1.5} />
                    {stat.suffix}
                  </div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Visit Trend Chart */}
        <FadeIn>
          <section className="mb-20">
            <VisitTrendChart data={weeklyVisits} />
          </section>
        </FadeIn>

        {/* Skills */}
        <FadeIn>
          <section className="mb-20">
            <h2 className="font-serif text-2xl font-bold mb-6 text-white">技术栈</h2>
            <div className="space-y-4">
              {skills.map((group) => (
                <div key={group.category} className="flex items-start gap-4">
                  <span className="text-sm font-medium text-[var(--accent)] min-w-[3rem] pt-1">
                    {group.category}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span
                        key={item}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-sm text-white/80"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Hobbies */}
        <FadeIn>
          <section className="mb-20">
            <h2 className="font-serif text-2xl font-bold mb-6 text-white">兴趣爱好</h2>
            <div className="flex flex-wrap gap-3">
              {hobbies.map((hobby) => (
                <span
                  key={hobby}
                  className="px-4 py-2 rounded-full bg-white/[0.04] backdrop-blur-md border border-white/[0.08] text-sm text-white/80 hover:border-[var(--accent)] transition-colors"
                >
                  {hobby}
                </span>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Contact */}
        <FadeIn>
          <section>
            <h2 className="font-serif text-2xl font-bold mb-6 text-white">找到我</h2>
            <div className="flex flex-wrap gap-4">
              {siteConfig.socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-[var(--accent)] transition-colors text-white/80 group"
                >
                  <span
                    className="w-5 h-5 transition-colors"
                    style={{ color: link.color }}
                  >
                    {/* Simple icon placeholder using first letter */}
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </span>
                  {link.name}
                </a>
              ))}
            </div>
          </section>
        </FadeIn>
      </div>
    </CosmicWrapper>
  );
}
