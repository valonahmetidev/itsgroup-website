"use client";

import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";
import { site } from "@/lib/site";

export function ContactView() {
  const { dict } = useLocale();

  return (
    <>
      <PageHeader eyebrow={dict.contact.eyebrow} title={dict.contact.heading} text={dict.contact.text} />
      <div className="shell grid gap-6 pb-10 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-3xl border border-ink/10 bg-card p-6">
          <h2 className="font-display text-2xl">ITS Group</h2>
          <dl className="mt-4 space-y-3 text-sm leading-6 text-ink/70">
            <div>
              <dt className="font-semibold text-ink">{dict.contact.domain}</dt>
              <dd>{site.domain}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">{dict.contact.email}</dt>
              <dd>{site.email || dict.contact.pending}</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">{dict.contact.phone}</dt>
              <dd>
                {site.phone ? (
                  <a href={site.phoneHref} className="font-medium text-ink hover:text-tech">
                    {site.phone}
                  </a>
                ) : (
                  dict.contact.pending
                )}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">{dict.contact.address}</dt>
              <dd>{site.address || dict.contact.pending}</dd>
            </div>
          </dl>
        </aside>
        <ContactForm />
      </div>
    </>
  );
}
