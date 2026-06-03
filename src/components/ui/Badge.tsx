interface BadgeProps {
  children: string;
  className?: string;
}

export default function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-[rgba(120,160,255,0.15)] text-[#8cb4f0] border border-[rgba(120,160,255,0.2)] ${className}`}
    >
      {children}
    </span>
  );
}
