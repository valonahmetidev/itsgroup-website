"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { formatTagsInput, parseTagsInput } from "@/lib/product-tags";

function splitDraft(value: string) {
  return value
    .split(/[,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function TagsInputField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { dict } = useLocale();
  const tags = useMemo(() => parseTagsInput(value), [value]);
  const [draft, setDraft] = useState("");

  function commitTags(nextTags: string[]) {
    onChange(formatTagsInput(nextTags));
  }

  function addFromDraft(raw: string) {
    const additions = splitDraft(raw);
    if (additions.length === 0) return;
    const merged = [...tags];
    for (const entry of additions) {
      if (!merged.some((tag) => tag.toLowerCase() === entry.toLowerCase())) {
        merged.push(entry);
      }
    }
    commitTags(merged);
    setDraft("");
  }

  function removeTag(tag: string) {
    commitTags(tags.filter((entry) => entry !== tag));
  }

  return (
    <label className={cn("grid gap-1 text-sm", className)}>
      <span>{dict.admin.tags}</span>
      <div className="rounded-2xl border border-ink/10 bg-surface px-3 py-2.5 outline-none transition focus-within:border-tech">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-tech/10 px-2.5 py-1 text-xs font-semibold text-tech"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="flex h-4 w-4 items-center justify-center rounded-full text-tech/70 transition hover:bg-tech/15 hover:text-tech"
                aria-label={`${dict.admin.removeTag} ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addFromDraft(draft);
              } else if (event.key === "Backspace" && !draft && tags.length > 0) {
                removeTag(tags[tags.length - 1]);
              }
            }}
            onBlur={() => addFromDraft(draft)}
            placeholder={tags.length === 0 ? dict.admin.tagsPlaceholder : dict.admin.tagsAddMore}
            className="min-w-[8rem] flex-1 border-0 bg-transparent py-1 text-sm outline-none placeholder:text-ink/40"
          />
        </div>
      </div>
      <span className="text-xs text-ink/50">{dict.admin.tagsHint}</span>
    </label>
  );
}
