"use client";

import { FormEvent, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { validateEmail, validateMinLength, validateRequired } from "@/lib/form-validation";
import { buildWhatsAppContactUrl } from "@/lib/whatsapp-contact";

export function ContactForm() {
  const { dict } = useLocale();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
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
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-ink/10 bg-card p-6" noValidate>
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
      <button type="submit" className="mt-5 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white">
        {dict.whatsapp.cta}
      </button>
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
