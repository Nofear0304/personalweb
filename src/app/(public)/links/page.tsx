import FadeIn from "@/components/ui/FadeIn";
import SectionHeading from "@/components/ui/SectionHeading";
import CosmicWrapper from "@/components/layout/CosmicWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "社交链接",
  description: "在各个平台找到我",
};

const socialLinks = [
  {
    name: "GitHub",
    url: "https://github.com",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    color: "#333",
    description: "开源项目与代码",
  },
  {
    name: "Gitee",
    url: "https://gitee.com",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm-1 4c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-2zm0 2h2v8h-2V8z" />
      </svg>
    ),
    color: "#C71D23",
    description: "国内代码托管平台",
  },
  {
    name: "Bilibili",
    url: "https://space.bilibili.com",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 01-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 01.16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
      </svg>
    ),
    color: "#FB7299",
    description: "技术分享与日常视频",
  },
  {
    name: "知乎",
    url: "https://www.zhihu.com",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13.444 15.316h-2.073v-8.22h2.073v8.22zm0 0" />
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.316H13.44v2.675h2.997v1.09H7.56v-1.09h2.998v-2.675H7.56V7.543h2.998V5.27h2.883v2.273h2.998v8.773h.002z" />
      </svg>
    ),
    color: "#0084FF",
    description: "技术问答与文章",
  },
  {
    name: "小红书",
    url: "https://www.xiaohongshu.com",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.636 14.364a4.966 4.966 0 01-3.636 1.5 4.966 4.966 0 01-3.636-1.5A4.966 4.966 0 016.864 12a4.966 4.966 0 011.5-3.636A4.966 4.966 0 0112 6.864a4.966 4.966 0 013.636 1.5A4.966 4.966 0 0117.136 12a4.966 4.966 0 01-1.5 3.636z" />
      </svg>
    ),
    color: "#FF2442",
    description: "生活碎片与摄影分享",
  },
  {
    name: "微信公众号",
    url: "#",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.268 6.758a.84.84 0 00-.842.857c0 .473.375.857.842.857a.842.842 0 00.842-.857.842.842 0 00-.842-.857zm4.207 0a.84.84 0 00-.842.857c0 .473.375.857.842.857a.842.842 0 00.842-.857.842.842 0 00-.842-.857z" />
      </svg>
    ),
    color: "#07C160",
    description: "扫码关注微信公众号",
    isWechat: true,
  },
  {
    name: "Email",
    url: "mailto:hello@example.com",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    color: "#007AFF",
    description: "hello@example.com",
  },
];

export default function LinksPage() {
  return (
    <CosmicWrapper>
      <div className="max-w-4xl mx-auto px-5 py-16 sm:py-20">
        <SectionHeading
          label="Links"
          title="找到我"
          description="在以下平台可以找到我的踪迹。"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialLinks.map((link, index) => (
            <FadeIn key={link.name} delay={index * 0.06}>
              <a
                href={link.url}
                target={link.url.startsWith("http") ? "_blank" : undefined}
                rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className="block bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_0_30px_rgba(91,156,245,0.1)] hover:-translate-y-1 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: `${link.color}15`, color: link.color }}
                >
                  {link.icon}
                </div>
                <h3 className="font-bold mb-1 text-white group-hover:text-[var(--accent)] transition-colors">
                  {link.name}
                </h3>
                <p className="text-sm text-white/40">{link.description}</p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </CosmicWrapper>
  );
}
