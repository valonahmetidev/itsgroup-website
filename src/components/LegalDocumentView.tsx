"use client";

import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";

export function LegalDocumentView({ kind }: { kind: "privacy" | "terms" }) {
  const { dict } = useLocale();
  const doc = dict.legal[kind];

  return (
    <>
      <PageHeader eyebrow={dict.legal.eyebrow} title={doc.title} text={doc.intro} />
      <div className="shell max-w-3xl space-y-8 pb-14 text-base leading-7 text-ink/80 dark:text-cream/85">
        <p className="text-sm text-ink/60 dark:text-cream/60">{doc.updated}</p>
        {doc.sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-2xl text-ink dark:text-cream">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
