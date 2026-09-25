import type { Metadata } from "next";
import { getDictionary, type Dictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import { site } from "@/lib/site";

export type PageMetaKey = keyof Dictionary["meta"]["pages"];

const pagePaths: Record<PageMetaKey, string> = {
  home: "/",
  technology: "/tehnologija",
  homeDivision: "/dom",
  catalog: "/katalog",
  about: "/za-nas",
  contact: "/kontakt",
  quote: "/ponuda",
  login: "/najava",
  profile: "/profil",
  privacy: "/privacy",
  terms: "/terms",
  notFound: "/",
};

export async function createPageMetadata(page: PageMetaKey): Promise<Metadata> {
  const locale = await getServerLocale();
  const dict = getDictionary(locale);
  const { title, description } = dict.meta.pages[page];
  const path = pagePaths[page];
  const fullTitle = `${title} · ITS Group`;
  const pageUrl = `${site.url}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: pageUrl,
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
