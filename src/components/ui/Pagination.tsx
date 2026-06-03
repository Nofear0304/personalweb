"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-14">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-4 py-2 rounded-xl text-sm font-medium border border-white/[0.08] bg-white/[0.03] backdrop-blur-md text-white/70 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        上一页
      </button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`e-${i}`} className="px-2 text-white/30 text-sm">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
              page === currentPage
                ? "bg-[var(--accent)] text-white shadow-[0_0_15px_rgba(96,165,250,0.3)]"
                : "border border-white/[0.08] bg-white/[0.03] backdrop-blur-md text-white/70 hover:text-white hover:bg-white/[0.06]"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-4 py-2 rounded-xl text-sm font-medium border border-white/[0.08] bg-white/[0.03] backdrop-blur-md text-white/70 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
      >
        下一页
      </button>
    </nav>
  );
}
