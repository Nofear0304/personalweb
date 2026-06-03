"use client";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Copy Link",
      href: "#",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        navigator.clipboard.writeText(url);
        alert("链接已复制到剪贴板");
      },
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/40 mr-1">分享</span>
      {shareLinks.map((link) =>
        link.onClick ? (
          <button
            key={link.name}
            onClick={link.onClick}
            className="p-2 rounded-lg text-white/40 hover:text-[var(--accent)] hover:bg-white/[0.08] transition-colors"
            title={link.name}
          >
            {link.icon}
          </button>
        ) : (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-white/40 hover:text-[var(--accent)] hover:bg-white/[0.08] transition-colors"
            title={link.name}
          >
            {link.icon}
          </a>
        )
      )}
    </div>
  );
}
