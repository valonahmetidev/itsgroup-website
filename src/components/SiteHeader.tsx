import { Header } from "@/components/Header";
import { menuGroups, technologyMenuGroups } from "@/lib/catalog";

export function SiteHeader() {
  return <Header treco={technologyMenuGroups()} tremark={menuGroups("tremark")} />;
}
