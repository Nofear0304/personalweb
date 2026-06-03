import type { PhilosophyItem, SocialLink } from "@/types";

export interface SiteConfig {
  name: string;
  avatar: string;
  tagline: string;
  signature: string;
  labels: string[];
  typewriterTexts: string[];
  philosophy: PhilosophyItem[];
  socialLinks: SocialLink[];
}

export const siteConfig: SiteConfig = {
  name: "Liberty",
  avatar: "https://raw.githubusercontent.com/Nofear0304/image/master/photo/1b12cc87460409ae935285d31f92830.jpg",
  tagline: "用代码构建世界，用镜头记录生活，用文字沉淀思考。",
  signature: "以代码记录成长，以文字沉淀思考。",
  labels: ["代码艺术家", "AI探索者", "摄影爱好者"],
  typewriterTexts: ["热爱编程", "热爱创造", "热爱成长", "热爱记录"],
  philosophy: [
    {
      text: "保持热爱",
      description:
        "对技术、对生活始终保持赤子之心。热爱是持续前行的原动力，让每一天都充满期待与可能。",
    },
    {
      text: "长期主义",
      description:
        "相信时间的力量，把有价值的事情做到极致。不急于一时的得失，用十年如一日的坚持，积累复利的力量。",
    },
    {
      text: "终身学习",
      description:
        "在快速变化的世界中，学习能力是最核心的竞争力。保持好奇心，持续拓展认知边界，让成长成为一种习惯。",
    },
    {
      text: "知行合一",
      description:
        "知识只有付诸实践才有价值。想了就去做，在行动中迭代，用结果验证认知——做思想的践行者，而非空想家。",
    },
  ],
  socialLinks: [
    {
      name: "GitHub",
      url: "https://github.com/Nofear0304",
      icon: "github",
      color: "#6e5494",
      description: "开源代码与项目",
    },
    {
      name: "CSDN",
      url: "https://blog.csdn.net/2302_76547996?spm=1000.2115.3001.5343",
      icon: "csdn",
      color: "#FC5531",
      description: "技术博客与分享",
    },
    {
      name: "抖音",
      url: "https://www.douyin.com/user/MS4wLjABAAAAX6KsrRoYFcIwTmhzev0rMnmu1pi-KAKDROnXCYZ9JKE?from_tab_name=main",
      icon: "douyin",
      color: "#FF004F",
      description: "视频创作与记录",
    },
  ],
};
