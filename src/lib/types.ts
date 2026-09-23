import type { ProductNames } from "@/lib/product-names";
import type { ProductUnit } from "@/lib/units";

export type Source = "treco" | "tremark" | "its" | "alevado";
export type CatalogSource = "treco" | "tremark" | "alevado";

export type Category = {
  id: number;
  source: CatalogSource;
  name: string;
  slug: string;
  parent: number;
  count: number;
};

export type Product = {
  id: number | string;
  source: Source;
  name: string;
  names?: ProductNames;
  slug: string;
  price: number | null;
  regularPrice: number | null;
  onSale: boolean;
  currency: string;
  image: string | null;
  inStock: boolean;
  stockQuantity?: number | null;
  categories: { id: number; name: string; slug: string }[];
  excerpt: string;
  excerpts?: ProductNames;
  permalink: string;
  customerDiscountPercent?: number;
  unit?: ProductUnit;
  tags?: string[];
};

export type MenuLink = {
  name: string;
  href: string;
  count: number;
  source: Source;
  slug: string;
  children: MenuLink[];
};

export type MenuColumn = {
  title: string;
  href: string;
  count: number;
  source: Source;
  slug: string;
  children: MenuLink[];
};

export type MenuGroup = {
  key: string;
  title: string;
  columns: MenuColumn[];
};

export type StockFilter = "all" | "in" | "out";
export type SaleFilter = "all" | "yes" | "no";
export type PriceTypeFilter = "all" | "priced" | "on-request";

export type CatalogQuery = {
  q?: string;
  source?: "all" | Source;
  sort?: "name" | "price-asc" | "price-desc";
  page?: number;
  min?: number;
  max?: number;
  stock?: StockFilter;
  sale?: SaleFilter;
  priceType?: PriceTypeFilter;
};
