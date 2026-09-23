import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/i18n";
import { formatCount } from "@/lib/format";
type StockDisplay = {
  inStock: boolean;
  stockQuantity?: number | null;
};

export function stockAvailabilityLabel(product: StockDisplay, dict: Dictionary) {
  if (product.stockQuantity != null) {
    if (product.stockQuantity <= 0) return dict.product.checkStock;
    return fill(dict.product.inStockCount, { count: formatCount(product.stockQuantity) });
  }
  return product.inStock ? dict.product.inStock : dict.product.checkStock;
}
