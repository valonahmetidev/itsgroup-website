export function parseProductTags(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return [...new Set(parsed.map((entry) => String(entry).trim()).filter(Boolean))];
    }
  } catch {
    // fall through to comma-separated parsing
  }
  return [...new Set(raw.split(/[,;]+/).map((entry) => entry.trim()).filter(Boolean))];
}

export function serializeProductTags(tags: string[]): string | null {
  const cleaned = [...new Set(tags.map((entry) => entry.trim()).filter(Boolean))];
  return cleaned.length > 0 ? JSON.stringify(cleaned) : null;
}

export function parseTagsInput(input: string): string[] {
  return parseProductTags(input.replace(/\n/g, ","));
}

export function formatTagsInput(tags: string[] | null | undefined): string {
  return (tags ?? []).join(", ");
}
