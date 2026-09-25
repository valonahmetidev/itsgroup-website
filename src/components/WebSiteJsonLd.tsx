import { webSiteJsonLd } from "@/lib/organization-seo";

export function WebSiteJsonLd() {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd()) }} />
  );
}
