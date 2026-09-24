import type { Source } from "@/lib/types";

/** Public catalog division slugs — never expose supplier names in URLs. */
export type CatalogDivision = "technology" | "home" | "cables" | "its";

export const catalogDivisions: CatalogDivision[] = ["technology", "home", "cables", "its"];

export function isCatalogDivision(value: string): value is CatalogDivision {
  return catalogDivisions.includes(value as CatalogDivision);
}

export function divisionToSource(division: CatalogDivision): Source {
  switch (division) {
    case "technology":
      return "treco";
    case "home":
      return "tremark";
    case "cables":
      return "alevado";
    case "its":
      return "its";
  }
}

export function sourceToCatalogDivision(source: Source): CatalogDivision {
  switch (source) {
    case "treco":
      return "technology";
    case "tremark":
      return "home";
    case "alevado":
      return "cables";
    case "its":
      return "its";
  }
}

/** Accept legacy `source` query values and map them to public divisions. */
export function parseCatalogDivisionParam(value?: string): CatalogDivision | "all" {
  if (!value || value === "all") return "all";
  if (isCatalogDivision(value)) return value;
  if (value === "treco") return "technology";
  if (value === "tremark") return "home";
  if (value === "alevado") return "cables";
  if (value === "its") return "its";
  return "all";
}

export function catalogDivisionToSource(division: CatalogDivision | "all"): Source | "all" {
  if (division === "all") return "all";
  return divisionToSource(division);
}
