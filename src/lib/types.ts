export type Source = "treco" | "tremark";

export type Category = {
  id: number;
  source: Source;
  name: string;
  slug: string;
  parent: number;
  count: number;
};

export type Product = {
  id: number;
  source: Source;
  name: string;
  slug: string;
  price: number | null;
  regularPrice: number | null;
  onSale: boolean;
  currency: string;
  image: string | null;
  inStock: boolean;
  categories: { id: number; name: string; slug: string }[];
  excerpt: string;
  permalink: string;
};

export type MenuLink = {
  name: string;
  href: string;
  count: number;
  children: MenuLink[];
};

export type MenuColumn = {
  title: string;
  href: string;
  count: number;
  children: MenuLink[];
};

export type MenuGroup = {
  key: string;
  title: string;
  columns: MenuColumn[];
};

export type CatalogQuery = {
  q?: string;
  source?: "all" | Source;
  sort?: "name" | "price-asc" | "price-desc";
  page?: number;
};
