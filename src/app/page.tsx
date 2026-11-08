import { Hero } from "@/components/Hero";
import { WebSiteJsonLd } from "@/components/WebSiteJsonLd";
import { createStaticPageMetadata } from "@/lib/page-metadata";
import { HomeSections } from "@/components/HomeSections";
import { HomeTicker } from "@/components/HomeTicker";
import { divisionCategories, technologyMenuGroups } from "@/lib/catalog";
import { publicHomeData } from "@/lib/catalog-live";

export const dynamic = "force-static";

/** One cached homepage. Repeat visits do not rebuild the catalog. */
export const revalidate = 120;

export function generateMetadata() {
  return createStaticPageMetadata("home");
}

export default async function HomePage() {
  const { totals, techFeatured, homeFeatured, itsFeatured, alevadoFeatured, shots } = await publicHomeData();
  const techCategories = divisionCategories("treco").slice(0, 8);
  const homeCategories = divisionCategories("tremark");
  const ticker = technologyMenuGroups()
    .flatMap((group) =>
      group.columns.map((column) => ({
        title: column.title,
        href: column.href,
        source: column.source,
        slug: column.slug,
      })),
    )
    .concat(
      homeCategories.map((category) => ({
        title: category.title,
        href: category.href,
        source: category.source,
        slug: category.slug,
      })),
    );

  return (
    <>
      <WebSiteJsonLd />
      <div className="flex flex-col lg:h-[calc(100dvh-4.75rem)] lg:overflow-hidden">
        <Hero techCount={totals.technology} homeCount={totals.home} shots={shots} />
        <HomeTicker items={ticker} />
      </div>

      <HomeSections
        techFeatured={techFeatured}
        homeFeatured={homeFeatured}
        itsFeatured={itsFeatured}
        alevadoFeatured={alevadoFeatured}
        techCategories={techCategories}
        homeCategories={homeCategories}
        totals={totals}
      />
    </>
  );
}
