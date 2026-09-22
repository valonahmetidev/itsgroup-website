import { Header } from "@/components/Header";
import { menuGroups } from "@/lib/catalog";

export function SiteHeader() {
  return <Header treco={menuGroups("treco")} tremark={menuGroups("tremark")} />;
}
