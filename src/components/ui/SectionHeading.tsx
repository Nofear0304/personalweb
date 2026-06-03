import FadeIn from "@/components/ui/FadeIn";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SectionHeading({
  label,
  title,
  description,
  className = "",
}: SectionHeadingProps) {
  return (
    <FadeIn className={`mb-12 ${className}`}>
      {label && (
        <p className="text-xs font-semibold text-[var(--accent)] mb-3 tracking-[0.2em] uppercase">
          {label}
        </p>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-[var(--muted)] max-w-lg text-lg leading-relaxed">
          {description}
        </p>
      )}
    </FadeIn>
  );
}
