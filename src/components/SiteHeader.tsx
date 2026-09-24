import { Header } from "@/components/Header";
import { getCustomerProfile } from "@/lib/customer-profile";
import { menuGroups, technologyMenuGroups } from "@/lib/catalog";

export async function SiteHeader() {
  const customer = await getCustomerProfile();

  return (
    <Header
      treco={technologyMenuGroups()}
      tremark={menuGroups("tremark")}
      customer={customer ? { name: customer.name, discountPercent: customer.discountPercent } : null}
    />
  );
}
