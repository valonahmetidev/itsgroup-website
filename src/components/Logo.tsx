"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";

type LogoProps = {
  href?: string;
  className?: string;
  imageClassName?: string;
  variant?: "header" | "footer";
};

const pngSizes = {
  header: { width: 168, height: 52, className: "h-11 w-auto" },
  footer: { width: 200, height: 62, className: "h-14 w-auto" },
} as const;

export function Logo({ href = "/", className, imageClassName, variant = "header" }: LogoProps) {
  const { dict } = useLocale();
  const size = pngSizes[variant];
  const content = (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt={dict.meta.siteName}
        width={size.width}
        height={size.height}
        priority={variant !== "footer"}
        className={cn("object-contain", size.className, imageClassName)}
      />
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="group shrink-0 transition hover:opacity-90 focus-visible:outline-none"
      aria-label={dict.meta.siteName}
    >
      <span className="inline-block transition duration-300 group-hover:scale-[1.02]">{content}</span>
    </Link>
  );
}
