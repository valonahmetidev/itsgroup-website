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

const sizes = {
  header: { width: 148, height: 74, className: "h-[3.35rem] w-[9.25rem] sm:h-14 sm:w-[10.5rem]" },
  footer: { width: 120, height: 60, className: "h-14 w-[7.5rem]" },
} as const;

export function Logo({ href = "/", className, imageClassName, variant = "header" }: LogoProps) {
  const { dict } = useLocale();
  const size = sizes[variant];

  const image = (
    <Image
      src="/its_logo.svg"
      alt=""
      width={size.width}
      height={size.height}
      priority={variant === "header"}
      className={cn("logo-mark-image h-full w-full object-contain", imageClassName)}
    />
  );

  const mark =
    variant === "footer" ? (
      <span className={cn("inline-flex items-center", size.className, className)}>{image}</span>
    ) : (
      <span
        className={cn("logo-stage logo-stage--medallion inline-flex items-center", size.className, className)}
        aria-hidden
      >
        <span className="logo-spin logo-medallion">
          <span className="logo-face logo-face-front">{image}</span>
          <span className="logo-face logo-face-back" aria-hidden>
            <Image
              src="/its_logo.svg"
              alt=""
              width={size.width}
              height={size.height}
              priority
              className={cn("logo-mark-image logo-mark-image--back h-full w-full object-contain", imageClassName)}
            />
          </span>
          <span className="logo-edge logo-edge-t" aria-hidden />
          <span className="logo-edge logo-edge-r" aria-hidden />
          <span className="logo-edge logo-edge-b" aria-hidden />
          <span className="logo-edge logo-edge-l" aria-hidden />
        </span>
      </span>
    );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="shrink-0 rounded-md focus-visible:outline-none"
      aria-label={dict.meta.siteName}
    >
      {mark}
    </Link>
  );
}
