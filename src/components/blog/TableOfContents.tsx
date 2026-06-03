"use client";

import { useState, useEffect } from "react";

export default function TableOfContents() {
  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number }[]
  >([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from article content
    const article = document.querySelector(".prose");
    if (!article) return;

    const elements = article.querySelectorAll("h2, h3");
    const items: { id: string; text: string; level: number }[] = [];
    elements.forEach((el, i) => {
      const id = `heading-${i}`;
      el.id = id;
      items.push({
        id,
        text: el.textContent || "",
        level: parseInt(el.tagName[1]),
      });
    });
    setHeadings(items);

    // Intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block sticky top-24 w-56 shrink-0">
      <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
        目录
      </h4>
      <ul className="space-y-1 border-l border-white/[0.08]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`block py-1 text-sm transition-colors ${
                h.level === 3 ? "pl-4" : "pl-3"
              } ${
                activeId === h.id
                  ? "text-[var(--accent)] border-l-2 border-[var(--accent)] -ml-px font-medium"
                  : "text-white/50 hover:text-white/80 border-l-2 border-transparent -ml-px"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
