import type { HeroShot } from "@/components/Hero";
import { productHref } from "@/lib/paths";
import type { Product, Source } from "@/lib/types";

const HERO_SOURCE_ORDER: Source[] = ["treco", "tremark", "its", "alevado"];

function shuffle<T>(items: readonly T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap] as T;
    copy[swap] = current as T;
  }
  return copy;
}

function heroEligible(product: Product) {
  if (!product.image) return false;
  if (product.source === "alevado") return true;
  return (product.price ?? 0) > 0;
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

export function buildBalancedHeroShots(pools: Partial<Record<Source, Product[]>>, limit = 24) {
  const queues = new Map<Source, Product[]>();

  for (const source of HERO_SOURCE_ORDER) {
    const eligible = shuffle((pools[source] ?? []).filter(heroEligible));
    if (eligible.length > 0) queues.set(source, eligible);
  }

  const interleaved: Product[] = [];
  while (interleaved.length < limit) {
    let added = false;
    for (const source of HERO_SOURCE_ORDER) {
      const queue = queues.get(source);
      if (!queue?.length) continue;
      interleaved.push(queue.shift() as Product);
      added = true;
      if (interleaved.length >= limit) break;
    }
    if (!added) break;
  }

  return interleaved.map(toShot);
}
