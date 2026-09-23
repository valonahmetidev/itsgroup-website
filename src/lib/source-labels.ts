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
};

export function sourceLabels(source: Source): SourceLabels {
  return labels[source];
}
