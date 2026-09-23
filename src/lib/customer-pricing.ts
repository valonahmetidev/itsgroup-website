import type { CustomerPricing } from "@/lib/customers";
import type { Product } from "@/lib/types";

function discountPercentForProduct(product: Product, pricing: CustomerPricing) {
  const specific = pricing.productDiscounts.get(`${product.source}:${String(product.id)}`);
  if (specific != null && specific > 0) return Math.min(100, specific);
  if (pricing.generalDiscountPercent != null && pricing.generalDiscountPercent > 0) {
    return Math.min(100, pricing.generalDiscountPercent);
  }
  return null;
}

function applyPercent(price: number | null, percent: number) {
  if (price == null || price <= 0) return price;
  return Math.max(0, Math.round(price * (100 - percent) / 100));
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
