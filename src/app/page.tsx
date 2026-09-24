import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { HomeTicker } from "@/components/HomeTicker";
import { divisionCategories, products, technologyMenuGroups } from "@/lib/catalog";
import { liveCatalogTotals, liveFeaturedProducts, liveStoreProducts } from "@/lib/catalog-live";
import { buildBalancedHeroShots } from "@/lib/hero-shots";
import { getServerI18n } from "@/lib/i18n/server";

export default async function HomePage() {
  const { locale } = await getServerI18n();
  const totals = await liveCatalogTotals(locale);
  const techFeatured = await liveFeaturedProducts("treco", 8, locale);
  const homeFeatured = await liveFeaturedProducts("tremark", 8, locale);
  const itsFeatured = await liveStoreProducts(locale, 8);
  const alevadoFeatured = await liveFeaturedProducts("alevado", 8, locale);
  const storeProducts = await liveStoreProducts(locale, 24);
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

  const heroShots = buildBalancedHeroShots({
    treco: products.filter((product) => product.source === "treco"),
    tremark: products.filter((product) => product.source === "tremark"),
    its: storeProducts,
    alevado: products.filter((product) => product.source === "alevado"),
  });

  return (
    <>
      <div className="flex flex-col lg:h-[calc(100dvh-4rem)] lg:overflow-hidden">
        <Hero techCount={totals.technology} homeCount={totals.home} shots={heroShots} />
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
