import { catalogImageSrc } from "@/lib/catalog-image";

type CatalogImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
};

export function CatalogImage({ src, alt, className }: CatalogImageProps) {
  const proxied = catalogImageSrc(src);
  if (!proxied) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={proxied} alt={alt} className={className} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
  );
}
