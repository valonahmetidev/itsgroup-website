import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { HomeTicker } from "@/components/HomeTicker";
import { counts, divisionCategories, menuGroups, productHref, products } from "@/lib/catalog";
import { liveFeaturedProducts, liveStoreProducts } from "@/lib/catalog-live";
import { getServerI18n } from "@/lib/i18n/server";
import type { HeroShot } from "@/components/Hero";
import type { Product } from "@/lib/types";

export default async function HomePage() {
  const { locale } = await getServerI18n();
  const totals = counts();
  const techFeatured = await liveFeaturedProducts("treco", 8, locale);
  const homeFeatured = await liveFeaturedProducts("tremark", 8, locale);
  const itsFeatured = await liveStoreProducts(locale, 8);
  const techCategories = divisionCategories("treco").slice(0, 8);
  const homeCategories = divisionCategories("tremark");
  const ticker = menuGroups("treco")
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
      <div className="flex h-[calc(100dvh-4rem)] flex-col gap-4 overflow-hidden sm:gap-5">
        <Hero techCount={totals.treco} homeCount={totals.tremark} shots={heroPool()} />
        <HomeTicker items={ticker} />
      </div>

      <HomeSections
        techFeatured={techFeatured}
        homeFeatured={homeFeatured}
        itsFeatured={itsFeatured}
        techCategories={techCategories}
        homeCategories={homeCategories}
        totals={totals}
      />
    </>
  );
}

function heroPool(): HeroShot[] {
  const tech = products.filter((product) => product.source === "treco" && product.image && (product.price ?? 0) > 0);
  const home = products.filter((product) => product.source === "tremark" && product.image && (product.price ?? 0) > 0);
  return [...sample(tech, 36), ...sample(home, 24)].map(toShot);
}

function sample(items: Product[], count: number) {
  if (items.length <= count) return items;
  const step = items.length / count;
  return Array.from({ length: count }, (_, index) => items[Math.floor(index * step)]).filter(
    (item): item is Product => item != null,
  );
}

function toShot(product: Product): HeroShot {
  return {
    src: product.image ?? "",
    alt: product.name,
    href: productHref(product),
    label: product.name,
    price: product.price,
    source: product.source,
  };
}

