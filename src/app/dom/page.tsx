import type { Metadata } from "next";
import { DivisionPage } from "@/components/DivisionPage";

export const metadata: Metadata = {
  title: "Дом",
  description: "Готвење, кафе, нега, чистење и удобност од каталогот на Tremark.",
};

export default function HomeLivingPage() {
  return <DivisionPage source="tremark" />;
}
