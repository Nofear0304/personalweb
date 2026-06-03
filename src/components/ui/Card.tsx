import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  hover = true,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden ${
        hover
          ? "transition-all duration-300 hover:bg-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_0_30px_rgba(91,156,245,0.1)] hover:-translate-y-1 cursor-pointer"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
