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
  header: { width: 92, height: 46, className: "h-11 w-[5.75rem]" },
  footer: { width: 120, height: 60, className: "h-14 w-[7.5rem]" },
} as const;

export function Logo({ href = "/", className, imageClassName, variant = "header" }: LogoProps) {
  const { dict } = useLocale();
  const size = sizes[variant];
  const face = (
    <Image
      src="/its_logo.svg"
      alt=""
      width={size.width}
      height={size.height}
      priority={variant === "header"}
      className={cn("h-full w-full object-contain", imageClassName)}
    />
  );

  const mark = (
    <span className={cn("logo-stage inline-flex items-center", size.className, className)} aria-hidden>
      <span className="logo-spin">
        <span className="logo-face">{face}</span>
        <span className="logo-face logo-face-back" aria-hidden>
          {face}
        </span>
      </span>
    </span>
  );

  if (!href) return mark;

  return (
    <Link
      href={href}
      className="group shrink-0 rounded-md focus-visible:outline-none"
      aria-label={dict.meta.siteName}
    >
      {mark}
    </Link>
  );
}
