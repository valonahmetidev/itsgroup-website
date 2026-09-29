"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { fill } from "@/lib/i18n";
import { cn } from "@/lib/cn";

export type QuoteAddedToastPayload = {
  id: number;
  productName: string;
  href: string;
  kind: "quote" | "proforma";
};

export function QuoteAddedToast({
  toast,
  onDismiss,
}: {
  toast: QuoteAddedToastPayload | null;
  onDismiss: () => void;
}) {
  const { dict } = useLocale();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, 5500);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const name =
    toast.productName.length > 56 ? `${toast.productName.slice(0, 53).trimEnd()}…` : toast.productName;
  const message =
    toast.kind === "proforma"
      ? fill(dict.product.addedToProformaToast, { name })
      : fill(dict.product.addedToQuoteToast, { name });
  const actionLabel =
    toast.kind === "proforma" ? dict.customer.backToProformaEditor : dict.product.viewQuoteList;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4 sm:bottom-6"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-ink/10 bg-card p-4 shadow-lift",
          "animate-[search-modal-in_0.28s_cubic-bezier(0.22,1,0.36,1)_both]",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-ink">{message}</p>
          <Link
            href={toast.href}
            onClick={onDismiss}
            className="mt-2 inline-flex rounded-full bg-tech px-4 py-2 text-sm font-semibold text-cream transition hover:opacity-90"
          >
            {actionLabel}
          </Link>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/45 transition hover:bg-surface hover:text-ink"
          aria-label={dict.product.toastDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
