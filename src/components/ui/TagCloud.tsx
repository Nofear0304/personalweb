import Link from "next/link";

interface TagCloudProps {
  tags: string[];
  basePath?: string; // e.g. "/blog/tag"
  activeTag?: string;
  className?: string;
}

export default function TagCloud({
  tags,
  basePath,
  activeTag,
  className = "",
}: TagCloudProps) {
  // Count tag frequency
  const tagCounts: Record<string, number> = {};
  tags.forEach((tag) => {
    tagCounts[tag] = (tagCounts[tag] || 0) + 1;
  });

  const uniqueTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {uniqueTags.map(([tag, count]) => {
        const isActive = activeTag === tag;
        const classes = isActive
          ? "bg-[var(--accent)] text-white"
          : "bg-white/[0.04] text-white/60 hover:text-white/90 hover:bg-white/[0.08]";

        const content = (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${classes}`}
          >
            {tag}
            <span className="text-xs opacity-60">{count}</span>
          </span>
        );

        if (basePath) {
          return (
            <Link key={tag} href={`${basePath}/${encodeURIComponent(tag)}`}>
              {content}
            </Link>
          );
        }

        return <span key={tag}>{content}</span>;
      })}
    </div>
  );
}
