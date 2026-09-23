import { cn } from "@/lib/cn";

export function ProductTags({
  tags,
  limit,
  className,
  size = "md",
}: {
  tags: string[];
  limit?: number;
  className?: string;
  size?: "sm" | "md";
}) {
  if (tags.length === 0) return null;

  const visible = limit ? tags.slice(0, limit) : tags;
  const overflow = limit && tags.length > limit ? tags.length - limit : 0;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((tag) => (
        <span
          key={tag}
          className={cn(
            "rounded-full border border-ink/10 bg-surface font-medium text-ink/70",
            size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-sm",
          )}
        >
          {tag}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "rounded-full border border-ink/10 bg-surface font-semibold text-ink/45",
            size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-sm",
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
