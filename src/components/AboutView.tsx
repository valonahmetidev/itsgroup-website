"use client";

import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/components/LocaleProvider";

export function AboutView() {
  const { dict } = useLocale();
  const { about } = dict;

  return (
    <>
      <PageHeader eyebrow={about.eyebrow} title={about.heading} text={about.intro1} />
      <div className="shell min-w-0 space-y-8 pb-12 sm:space-y-10">
        <div className="max-w-3xl space-y-4 text-base leading-7 text-ink/80 sm:text-lg sm:leading-8">
          <p>{about.intro2}</p>
          <p>{about.intro3}</p>
        </div>

        <section className="max-w-3xl">
          <h2 className="font-display text-3xl text-ink">{about.servicesTitle}</h2>
          <ul className="mt-4 space-y-2.5 text-sm leading-6 text-ink/80 sm:mt-5 sm:space-y-3 sm:text-base sm:leading-7">
            {about.services.map((item) => (
              <li key={item} className="break-words pl-0.5">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="max-w-3xl text-lg leading-8 text-ink/80">{about.partners}</p>

        <section className="rounded-3xl bg-tech-deep p-8 text-cream md:max-w-3xl">
          <h2 className="font-display text-3xl">{about.whyTitle}</h2>
          <p className="mt-4 leading-7 text-cream/85">{about.whyBody}</p>
          <p className="mt-8 font-display text-xl tracking-wide text-cream">{about.tagline}</p>
        </section>
      </div>
    </>
  );
}
