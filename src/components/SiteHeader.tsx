import { Header } from "@/components/Header";
import { getCustomerProfile } from "@/lib/customer-profile";
import { menuGroups } from "@/lib/catalog";

export async function SiteHeader() {
  const customer = await getCustomerProfile();

  return (
    <Header
      treco={menuGroups("treco")}
      tremark={menuGroups("tremark")}
      customer={customer ? { name: customer.name, discountPercent: customer.discountPercent } : null}
    />
  );
}
