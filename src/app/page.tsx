import { Hero } from "@/components/Hero";
import { HomeSections } from "@/components/HomeSections";
import { HomeTicker } from "@/components/HomeTicker";
import { counts, divisionCategories, featuredProducts, menuGroups, productHref, products } from "@/lib/catalog";
import type { HeroShot } from "@/components/Hero";
import type { Product } from "@/lib/types";

export default function HomePage() {
  const totals = counts();
  const techFeatured = featuredProducts("treco", 8);
  const homeFeatured = featuredProducts("tremark", 8);
  const techCategories = divisionCategories("treco").slice(0, 8);
  const homeCategories = divisionCategories("tremark");
  const ticker = menuGroups("treco")
    .flatMap((group) => group.columns.map((column) => ({ title: column.title, href: column.href })))
    .concat(homeCategories.map((category) => ({ title: category.title, href: category.href })));

  return (
    <>
      <div className="flex min-h-[calc(100dvh-4.75rem)] flex-col overflow-hidden">
        <Hero techCount={totals.treco} homeCount={totals.tremark} shots={heroPool()} />
        <HomeTicker items={ticker} />
      </div>

      <HomeSections
        techFeatured={techFeatured}
        homeFeatured={homeFeatured}
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

