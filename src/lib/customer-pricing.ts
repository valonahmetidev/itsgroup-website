import { getCategory, isCatalogSource, productInCategorySubtree } from "@/lib/catalog";
import type { CustomerPricing } from "@/lib/customers";
import type { CatalogSource, Product } from "@/lib/types";

function splitDiscountKey(key: string) {
  const index = key.indexOf(":");
  if (index <= 0) return null;
  return { source: key.slice(0, index), id: key.slice(index + 1) };
}

function catalogCategoryDistance(product: Product, source: CatalogSource, categoryId: number) {
  let best: number | null = null;
  for (const category of product.categories) {
    let currentId = category.id;
    let depth = 0;
    const seen = new Set<number>();
    while (currentId && !seen.has(currentId)) {
      if (currentId === categoryId) {
        if (best == null || depth < best) best = depth;
        break;
      }
      seen.add(currentId);
      currentId = getCategory(source, currentId)?.parent ?? 0;
      depth += 1;
    }
  }
  return best;
}

function categoryDiscountForProduct(product: Product, pricing: CustomerPricing) {
  const categoryDiscounts = pricing.categoryDiscounts;
  if (!categoryDiscounts || categoryDiscounts.size === 0) return null;

  if (product.source === "its") {
    const storeId = product.storeCategory?.id;
    if (!storeId) return null;
    const percent = categoryDiscounts.get(`its:${storeId}`);
    return percent != null && percent > 0 ? Math.min(100, percent) : null;
  }

  let bestDistance = Infinity;
  let bestPercent: number | null = null;
  for (const [key, percent] of categoryDiscounts) {
    if (percent <= 0) continue;
    const parsed = splitDiscountKey(key);
    if (!parsed || parsed.source !== product.source || !isCatalogSource(parsed.source)) continue;
    const categoryId = Number(parsed.id);
    if (!Number.isFinite(categoryId)) continue;
    if (!productInCategorySubtree(product, parsed.source, categoryId)) continue;
    const distance = catalogCategoryDistance(product, parsed.source, categoryId);
    if (distance == null) continue;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestPercent = percent;
    }
  }
  return bestPercent != null ? Math.min(100, bestPercent) : null;
}

function discountPercentForProduct(product: Product, pricing: CustomerPricing) {
  const specific = pricing.productDiscounts.get(`${product.source}:${String(product.id)}`);
  if (specific != null && specific > 0) return Math.min(100, specific);
  const category = categoryDiscountForProduct(product, pricing);
  if (category != null) return category;
  if (pricing.generalDiscountPercent != null && pricing.generalDiscountPercent > 0) {
    return Math.min(100, pricing.generalDiscountPercent);
  }
  return null;
}

function applyPercent(price: number | null, percent: number) {
  if (price == null || price <= 0) return price;
  return Math.max(0, Math.round((price * (100 - percent)) / 100));
}

export function applyCustomerPricing(product: Product, pricing: CustomerPricing | null): Product {
  if (!pricing) return product;
  const percent = discountPercentForProduct(product, pricing);
  if (percent == null) return product;

  const listPrice = product.price;
  const discounted = applyPercent(listPrice, percent);
  if (discounted == null || listPrice == null || discounted >= listPrice) return product;

  const regularPrice = product.regularPrice != null && product.regularPrice > listPrice ? product.regularPrice : listPrice;

  return {
    ...product,
    price: discounted,
    regularPrice,
    onSale: true,
    customerDiscountPercent: percent,
  };
}

export function applyCustomerPricingList(products: Product[], pricing: CustomerPricing | null) {
  if (!pricing) return products;
  return products.map((product) => applyCustomerPricing(product, pricing));
}
