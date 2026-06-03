interface ReadingTimeProps {
  minutes: number;
  className?: string;
}

export default function ReadingTime({ minutes, className = "" }: ReadingTimeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-[var(--muted)] ${className}`}>
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      阅读时间 {minutes} 分钟
    </span>
  );
}
