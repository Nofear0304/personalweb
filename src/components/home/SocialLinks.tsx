"use client";

import { siteConfig } from "@/data/site-config";
import SocialCard from "./SocialCard";

export default function SocialLinks() {
  return (
    <section id="social" className="max-w-6xl mx-auto px-5 py-24 sm:py-32">
      <div className="text-center mb-14">
        <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
          Connect
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
          找到我
        </h2>
        <p className="text-[var(--muted)] max-w-md mx-auto text-lg leading-relaxed">
          在以下平台可以找到我的身影，欢迎交流与分享
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-3xl mx-auto">
        {siteConfig.socialLinks.map((link, index) => (
          <SocialCard key={link.name} link={link} index={index} />
        ))}
      </div>
    </section>
  );
}
