"use client";

import { useLocale } from "@/components/LocaleProvider";
import { PRODUCT_UNITS, unitLabel } from "@/lib/units";

export function UnitSelectField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { dict, locale } = useLocale();

  return (
    <label className="grid gap-1 text-sm">
      <span>{dict.admin.unit}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-ink/10 bg-surface px-4 py-2.5 outline-none focus:border-tech"
      >
        <option value="">{dict.admin.unitDefault}</option>
        {PRODUCT_UNITS.map((unit) => (
          <option key={unit} value={unit}>
            {unitLabel(unit, locale)}
          </option>
        ))}
      </select>
    </label>
  );
}
