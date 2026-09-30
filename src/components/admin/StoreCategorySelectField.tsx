"use client";

import type { AdminStoreCategoryPickerOption } from "@/app/admin/actions";
import { useLocale } from "@/components/LocaleProvider";

function optionLabel(depth: number, name: string) {
  return `${depth > 0 ? `${"— ".repeat(depth)}` : ""}${name}`;
}

export function StoreCategorySelectField({
  options,
  value,
  onChange,
  className,
}: {
  options: AdminStoreCategoryPickerOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { dict } = useLocale();

  return (
    <label className="grid gap-1 text-sm">
      <span>{dict.admin.productCategory}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={className}>
        <option value="">{dict.admin.storeCategoryNone}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {optionLabel(option.depth, option.name)}
          </option>
        ))}
      </select>
    </label>
  );
}
