import type { Metadata } from "next";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export type PageMetaKey = keyof Dictionary["meta"]["pages"];

export async function createPageMetadata(page: PageMetaKey): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const { title, description } = dict.meta.pages[page];
  const fullTitle = `${title} · ITS Group`;

  return {
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: site.url,
      siteName: site.name,
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}
