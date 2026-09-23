"use client";

import { useRef, useState } from "react";
import { adminUploadImage } from "@/app/admin/actions";
import { CatalogImage } from "@/components/CatalogImage";
import { useLocale } from "@/components/LocaleProvider";

export function ImageUploadField({
  value,
  onChange,
  alt,
}: {
  value: string;
  onChange: (url: string) => void;
  alt: string;
}) {
  const { dict } = useLocale();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.set("file", file);
    const result = await adminUploadImage(formData);
    setUploading(false);
    if (!result.ok) {
      setError(dict.admin.uploadError);
      return;
    }
    onChange(result.url);
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-white">
          <CatalogImage src={value} alt={alt} className="h-full w-full object-contain p-2" />
        </div>
      ) : (
        <div className="flex h-32 w-32 items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-surface text-xs text-ink/45">
          {dict.admin.noImage}
        </div>
      )}
      <label className="grid gap-1 text-sm">
        <span>{dict.admin.imageUrl}</span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://... or /api/media/..."
          className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFileChange} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-full border border-ink/10 px-4 py-2 text-sm font-medium hover:border-tech disabled:opacity-50"
        >
          {uploading ? dict.admin.uploadingImage : dict.admin.uploadImage}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-home hover:underline"
          >
            {dict.admin.removeImage}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-home">{error}</p>}
    </div>
  );
}
