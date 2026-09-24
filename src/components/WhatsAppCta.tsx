"use client";

import { MessageCircle } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { cn } from "@/lib/cn";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp-contact";

type Variant = "primary" | "header" | "footer";

export function WhatsAppCta({
  variant = "primary",
  className,
  message,
}: {
  variant?: Variant;
  className?: string;
  message?: string;
}) {
  const { dict } = useLocale();
  const href = buildWhatsAppContactUrl(message ?? dict.whatsapp.defaultMessage);

  const styles: Record<Variant, string> = {
    primary:
      "inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105",
    header:
      "hidden h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white transition hover:brightness-105 lg:inline-flex",
    footer:
      "inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#25D366]/20 dark:text-cream",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(styles[variant], className)}
      aria-label={variant === "header" ? dict.whatsapp.cta : undefined}
      title={variant === "header" ? dict.whatsapp.cta : undefined}
    >
      <MessageCircle className={variant === "header" ? "h-4 w-4" : "h-[1.125rem] w-[1.125rem]"} aria-hidden />
      {variant !== "header" && dict.whatsapp.cta}
    </a>
  );
}
