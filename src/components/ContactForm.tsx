"use client";

import { FormEvent, useState } from "react";
import { useInquiry } from "@/components/Inquiry";
import { useLocale } from "@/components/LocaleProvider";

export function ContactForm() {
  const { addMessage } = useInquiry();
  const { dict } = useLocale();
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    if (!name || !message) return;
    addMessage({ name, phone, email, message });
    event.currentTarget.reset();
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl border border-ink/10 bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label={dict.contact.name} required />
        <Field name="phone" label={dict.contact.phone} />
        <Field name="email" label={dict.contact.email} type="email" className="sm:col-span-2" />
        <label className="sm:col-span-2 text-sm font-medium">
          {dict.contact.message}
          <textarea name="message" required rows={6} className="mt-2 w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 outline-none focus:border-tech" />
        </label>
      </div>
      <button type="submit" className="mt-5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper">
        {dict.contact.save}
      </button>
      {sent && <p className="mt-4 text-sm leading-6 text-tech">{dict.contact.saved}</p>}
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  className = "",
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`text-sm font-medium ${className}`}>
      {label}
      <input name={name} type={type} required={required} className="mt-2 w-full rounded-2xl border border-ink/10 bg-paper px-4 py-3 outline-none focus:border-tech" />
    </label>
  );
}
