"use client";

import { FormEvent, useState } from "react";
import { submitContactInquiry } from "@/app/inquiry-actions";
import { useLocale } from "@/components/LocaleProvider";
import { validateEmail, validateMinLength, validateRequired } from "@/lib/form-validation";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp-contact";

export function ContactForm() {
  const { dict } = useLocale();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastPayload, setLastPayload] = useState<{ name: string; phone: string; email: string; message: string } | null>(
    null,
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSuccess(false);
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") ?? "").trim()) {
      setFormError(dict.validation.honeypot);
      return;
    }

    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    const nextErrors: Record<string, string> = {};
    const nameErr = validateRequired(name, dict);
    if (nameErr) nextErrors.name = nameErr;
    const messageErr = validateRequired(message, dict) || validateMinLength(message, 10, dict);
    if (messageErr) nextErrors.message = messageErr;
    const emailErr = validateEmail(email, dict, false);
    if (emailErr) nextErrors.email = emailErr;
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError(dict.validation.fixFields);
      return;
    }
    setErrors({});

    setSubmitting(true);
    const result = await submitContactInquiry({
      website: String(form.get("website") ?? ""),
      name,
      phone,
      email,
      message,
    });
    setSubmitting(false);

    if (!result.ok) {
      if (result.error === "validation" && result.fieldErrors) {
        setErrors(result.fieldErrors);
        setFormError(dict.validation.fixFields);
        return;
      }
      if (result.error === "rate_limited") {
        setFormError(dict.validation.rateLimited);
        return;
      }
      setFormError(dict.validation.databaseUnavailable);
      return;
    }

    setLastPayload({ name, phone, email, message });
    setSuccess(true);
    event.currentTarget.reset();
  }

  function openWhatsApp() {
    if (!lastPayload) return;
    const { name, phone, email, message } = lastPayload;
    const lines = [
      `*${dict.contact.heading}*`,
      "",
      `*${dict.contact.name}:* ${name}`,
      phone ? `*${dict.contact.phone}:* ${phone}` : "",
      email ? `*${dict.contact.email}:* ${email}` : "",
      "",
      message,
    ].filter(Boolean);
    window.open(buildWhatsAppContactUrl(lines.join("\n")), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="rounded-3xl border border-ink/10 bg-card p-6" noValidate>
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        aria-hidden
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label={dict.contact.name} required error={errors.name} />
        <Field name="phone" label={dict.contact.phone} error={errors.phone} />
        <Field name="email" label={dict.contact.email} type="email" className="sm:col-span-2" error={errors.email} />
        <label className="sm:col-span-2 text-sm font-medium">
          {dict.contact.message}
          <textarea
            name="message"
            required
            rows={6}
            aria-invalid={Boolean(errors.message)}
            className="mt-2 w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 outline-none focus:border-tech aria-[invalid=true]:border-home"
          />
          {errors.message && <span className="mt-1 block text-sm text-home">{errors.message}</span>}
        </label>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-tech px-5 py-3 text-sm font-semibold text-cream disabled:opacity-40"
        >
          {submitting ? dict.quote.sendingRequest : dict.contact.save}
        </button>
        {success && lastPayload && (
          <button
            type="button"
            onClick={openWhatsApp}
            className="rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
          >
            {dict.contact.openWhatsApp}
          </button>
        )}
      </div>
      {success && <p className="mt-4 text-sm leading-6 text-tech">{dict.contact.submitSuccess}</p>}
      {formError && <p className="mt-4 text-sm leading-6 text-home">{formError}</p>}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  className = "",
  error,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
  error?: string;
}) {
  return (
    <label className={`text-sm font-medium ${className}`}>
      {label}
      <input
        name={name}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        className="mt-2 w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 outline-none focus:border-tech aria-[invalid=true]:border-home"
      />
      {error && <span className="mt-1 block text-sm text-home">{error}</span>}
    </label>
  );
}
