import { revalidateTag } from "next/cache";

export function revalidateCatalogCache() {
  revalidateTag("catalog");
}
