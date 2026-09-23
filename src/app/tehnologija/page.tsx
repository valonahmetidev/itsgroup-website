import type { Metadata } from "next";
import { DivisionPage } from "@/components/DivisionPage";

export const metadata: Metadata = {
  title: "Технологија",
  description: "Камери, мрежи, оптика, паметен дом и енергија од каталогот на ITS Group.",
};

export const dynamic = "force-dynamic";

export default function TechnologyPage() {
  return <DivisionPage source="treco" />;
}
