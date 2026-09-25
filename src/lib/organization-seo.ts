import { site } from "@/lib/site";

const logoUrl = `${site.url}/its_logo.svg`;

export function organizationJsonLd() {
  const payload: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${site.url}/#organization`,
    name: site.name,
    alternateName: ["ITS Group Kumanovo", "ITS Group North Macedonia", "ITS Group MK"],
    url: site.url,
    logo: logoUrl,
    image: logoUrl,
    email: site.email,
    telephone: site.phone.replace(/\s/g, ""),
    description: site.seoDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.streetAddress,
      addressLocality: site.addressLocality,
      postalCode: site.postalCode,
      addressCountry: site.addressCountry,
    },
    areaServed: {
      "@type": "Country",
      name: "North Macedonia",
    },
  };

  if (site.sameAs.length > 0) {
    payload.sameAs = site.sameAs;
  }

  return payload;
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    name: site.name,
    alternateName: "ITS Group",
    url: site.url,
    publisher: { "@id": `${site.url}/#organization` },
    inLanguage: ["mk", "sq", "en"],
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${site.url}/katalog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
