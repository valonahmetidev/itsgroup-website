"use client";

import { useState } from "react";
import { catalogImageSrc } from "@/lib/catalog-image";

type CatalogImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

export function CatalogImage({ src, alt, className }: CatalogImageProps) {
  const trimmed = src?.trim() ?? "";
  const proxied = catalogImageSrc(trimmed);
  const [useDirect, setUseDirect] = useState(false);
  const resolved = useDirect ? trimmed : proxied;

  if (!resolved) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (!useDirect && trimmed && proxied?.includes("/api/catalog-image")) {
          setUseDirect(true);
        }
      }}
    />
  );
}
