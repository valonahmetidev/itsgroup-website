"use client";

import type { AdminProductCategoryPickerGroup } from "@/app/admin/actions";
import { useLocale } from "@/components/LocaleProvider";
import { menuGroupTitle } from "@/lib/i18n/menu";
import type { CatalogSource } from "@/lib/types";

function optionLabel(depth: number, name: string) {
  return `${depth > 0 ? `${"— ".repeat(depth)}` : ""}${name}`;
}

export function catalogCategoryOptionValue(source: CatalogSource, id: number) {
  return `${source}-${id}`;
}

export function parseCatalogCategoryOptionValue(raw: string, productSource: CatalogSource) {
  if (!raw) return "";
  const prefix = `${productSource}-`;
  if (raw.startsWith(prefix)) return raw.slice(prefix.length);
  const match = raw.match(/^(treco|tremark|alevado)-(\d+)$/);
  if (match && match[1] === productSource) return match[2];
  return raw;
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
      <select
        value={value ? catalogCategoryOptionValue(productSource, Number(value)) : ""}
        onChange={(event) =>
          onChange(parseCatalogCategoryOptionValue(event.target.value, productSource))
        }
        className={className}
      >
        {groups.map((group) => (
          <optgroup
            key={`${group.division}-${group.menuKey}`}
            label={`${divisionLabel(group.division, dict)} · ${menuGroupTitle(dict, group.menuKey, group.menuTitle)}`}
          >
            {group.options.map((option) => (
              <option
                key={`${option.source}-${option.id}`}
                value={catalogCategoryOptionValue(option.source, option.id)}
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
