"use client";

import { SelectField } from "@/components/ui/SelectField";
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
    <SelectField
      value={value}
      onChange={onChange}
      label={dict.admin.unit}
      placeholder={dict.admin.unitDefault}
      shape="rounded"
      options={[
        { value: "", label: dict.admin.unitDefault },
        ...PRODUCT_UNITS.map((unit) => ({
          value: unit,
          label: unitLabel(unit, locale),
        })),
      ]}
    />
  );
}
