"use client";

import type { AdminProductCategoryPickerGroup } from "@/app/admin/actions";
import { useLocale } from "@/components/LocaleProvider";
import { menuGroupTitle } from "@/lib/i18n/menu";
import type { CatalogSource } from "@/lib/types";

function optionLabel(depth: number, name: string) {
  return `${depth > 0 ? `${"— ".repeat(depth)}` : ""}${name}`;
}

function divisionLabel(
  division: CatalogSource,
  dict: ReturnType<typeof useLocale>["dict"],
) {
  if (division === "treco") return dict.nav.technology;
  if (division === "tremark") return dict.nav.home;
  return dict.catalog.alevadoProducts;
}

export function ProductCategorySelectField({
  productSource,
  groups,
  value,
  onChange,
  className,
}: {
  productSource: CatalogSource;
  groups: AdminProductCategoryPickerGroup[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { dict } = useLocale();

  return (
    <div className="space-y-2">
      <p className="text-xs text-ink/55">
        {dict.admin.productCategoryDivisionHint.replace(
          "{division}",
          divisionLabel(productSource, dict),
        )}
      </p>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={className}>
        {groups.map((group) => (
          <optgroup
            key={`${group.division}-${group.menuKey}`}
            label={`${divisionLabel(group.division, dict)} · ${menuGroupTitle(dict, group.menuKey, group.menuTitle)}`}
          >
            {group.options.map((option) => (
              <option
                key={`${option.source}-${option.id}`}
                value={String(option.id)}
                disabled={option.source !== productSource}
              >
                {optionLabel(option.depth, option.name)}
                {option.source !== productSource ? ` (${divisionLabel(option.source, dict)})` : ""}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
