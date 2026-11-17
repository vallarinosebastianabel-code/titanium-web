import { cn } from "@/lib/format";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-600">{eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg leading-relaxed text-navy-600">{description}</p>}
    </div>
  );
}
