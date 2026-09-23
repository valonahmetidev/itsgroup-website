"use client";

import { SelectField } from "@/components/ui/SelectField";
import { useLocale } from "@/components/LocaleProvider";
import { PRODUCT_UNITS, unitLabel, type ProductUnit } from "@/lib/units";

export function UnitSelect({
  value,
  onChange,
  label,
  shape = "pill",
  size = "default",
  placement = "bottom",
  fullWidth = true,
  hideLabel = false,
  className,
}: {
  value: ProductUnit;
  onChange: (unit: ProductUnit) => void;
  label?: string;
  shape?: "pill" | "rounded";
  size?: "default" | "compact";
  placement?: "top" | "bottom";
  fullWidth?: boolean;
  hideLabel?: boolean;
  className?: string;
}) {
  const { locale } = useLocale();

  return (
    <div className={className}>
      <SelectField
        value={value}
        onChange={onChange}
        label={label}
        ariaLabel={label}
        hideLabel={hideLabel}
        shape={shape}
        size={size}
        placement={placement}
        fullWidth={fullWidth}
        options={PRODUCT_UNITS.map((unit) => ({
          value: unit,
          label: unitLabel(unit, locale),
        }))}
      />
    </div>
  );
}
