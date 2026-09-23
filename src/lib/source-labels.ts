import type { Source } from "@/lib/types";

export type SourceLabels = {
  brand: string;
  mk: string;
  sq: string;
};

const labels: Record<Source, SourceLabels> = {
  treco: {
    brand: "ITS Group",
    mk: "Технологија",
    sq: "Teknologji",
  },
  tremark: {
    brand: "ITS Group",
    mk: "Дом",
    sq: "Shtëpi",
  },
  its: {
    brand: "ITS Group",
    mk: "ITS Group",
    sq: "ITS Group",
  },
  alevado: {
    brand: "Cables",
    mk: "Кабли",
    sq: "Kabllo",
  },
};

export function sourceLabels(source: Source): SourceLabels {
  return labels[source];
}

/** Catalog feed name shown in admin (Treco, Tremark, ITS). */
export function catalogSourceName(source: Source): string {
  if (source === "treco") return "Treco";
  if (source === "tremark") return "Tremark";
  if (source === "alevado") return "Alevado";
  return "ITS";
}
