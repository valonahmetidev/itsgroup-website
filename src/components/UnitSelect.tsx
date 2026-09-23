"use client";

import { SelectField } from "@/components/ui/SelectField";
import { useLocale } from "@/components/LocaleProvider";
import { PRODUCT_UNITS, unitLabel, type ProductUnit } from "@/lib/units";

export function UnitSelect({
  value,
  onChange,
  label,
  shape = "pill",
  className,
}: {
  value: ProductUnit;
  onChange: (unit: ProductUnit) => void;
  label?: string;
  shape?: "pill" | "rounded";
  className?: string;
}) {
  const { locale } = useLocale();

  return (
    <div className={className}>
      <SelectField
        value={value}
        onChange={onChange}
        label={label}
        shape={shape}
        options={PRODUCT_UNITS.map((unit) => ({
          value: unit,
          label: unitLabel(unit, locale),
        }))}
      />
    </div>
  );
}
