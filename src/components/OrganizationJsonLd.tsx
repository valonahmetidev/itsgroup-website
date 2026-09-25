import { organizationJsonLd, webSiteJsonLd } from "@/lib/organization-seo";

export function OrganizationJsonLd({ includeWebSite = false }: { includeWebSite?: boolean }) {
  const graphs = [organizationJsonLd(), ...(includeWebSite ? [webSiteJsonLd()] : [])];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphs.length === 1 ? graphs[0] : graphs) }}
    />
  );
}
