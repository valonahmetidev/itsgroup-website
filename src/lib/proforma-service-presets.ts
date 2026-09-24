import type { Locale } from "@/lib/i18n";

export type ProformaServicePresetKey =
  | "installation"
  | "transport"
  | "commissioning"
  | "cable_pulling"
  | "training"
  | "site_survey";

const presetLabels: Record<ProformaServicePresetKey, Record<Locale, string>> = {
  installation: {
    mk: "Монтажа / инсталација",
    en: "Installation",
    sq: "Instalim",
  },
  transport: {
    mk: "Транспорт",
    en: "Transport",
    sq: "Transport",
  },
  commissioning: {
    mk: "Пуштање во погон",
    en: "Commissioning",
    sq: "Komisionim",
  },
  cable_pulling: {
    mk: "Влечење кабли",
    en: "Cable pulling",
    sq: "Tërheqje kabllosh",
  },
  training: {
    mk: "Обука",
    en: "Training",
    sq: "Trajnim",
  },
  site_survey: {
    mk: "Теренска проценка",
    en: "Site survey",
    sq: "Vlerësim në terren",
  },
};

export const proformaServicePresets: { key: ProformaServicePresetKey; defaultPrice: number | null }[] = [
  { key: "installation", defaultPrice: null },
  { key: "transport", defaultPrice: null },
  { key: "commissioning", defaultPrice: null },
  { key: "cable_pulling", defaultPrice: null },
  { key: "training", defaultPrice: null },
  { key: "site_survey", defaultPrice: null },
];

export function proformaServicePresetLabel(key: ProformaServicePresetKey, locale: Locale) {
  return presetLabels[key][locale];
}

export function proformaServicePresetAdminLabel(key: ProformaServicePresetKey) {
  const labels = presetLabels[key];
  return `${labels.mk} / ${labels.sq} / ${labels.en}`;
}
