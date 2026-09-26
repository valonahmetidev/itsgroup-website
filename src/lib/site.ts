export const site = {
  name: "ITS Group",
  domain: "itsgroup.mk",
  url: "https://itsgroup.mk",
  description: "Заеднички каталог на ITS Group: технологија и апарати за дом.",
  /** Default meta description for crawlers (English brand + location helps “ITS Group” queries). */
  seoDescription:
    "ITS Group — technology, CCTV, networks, smart home, and appliances in Kumanovo, North Macedonia. Official catalog at itsgroup.mk.",
  whatsapp: "38976302228",
  /** Hidden from public UI for now; restore when you want mailto / forms again. */
  email: "info@itsgroup.mk",
  showPublicEmail: false,
  phone: "+389 76 302 228",
  phoneHref: "tel:+38976302228",
  address: "11 November 68d, Kumanovo, North Macedonia, 1300",
  streetAddress: "11 November 68d",
  addressLocality: "Kumanovo",
  postalCode: "1300",
  addressCountry: "MK",
  googleMapsUrl: "https://maps.app.goo.gl/hXhGAhDucfucx6HeA",
  /** Social profiles — strengthens Google entity match (Organization sameAs). */
  sameAs: ["https://www.facebook.com/Itsgroup24/"],
  /**
   * Defaults for Product `offers` (Merchant listings). Adjust to match your real policies.
   * @see https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
   */
  merchantListing: {
    applicableCountry: "MK",
    returnPolicyDays: 14,
    returnPolicyUrl: "https://itsgroup.mk/terms",
    shippingHandlingDaysMin: 1,
    shippingHandlingDaysMax: 3,
    shippingTransitDaysMin: 1,
    shippingTransitDaysMax: 7,
  },
};

export const sourceMeta = {
  treco: {
    label: "Технологија",
    brand: "ITS Group",
    href: "/tehnologija",
    origin: "https://itsgroup.mk",
    tone: "tech" as const,
  },
  tremark: {
    label: "Дом",
    brand: "ITS Group",
    href: "/dom",
    origin: "https://itsgroup.mk",
    tone: "home" as const,
  },
  its: {
    label: "ITS Group",
    brand: "ITS",
    href: "/katalog?division=its",
    origin: "https://itsgroup.mk",
    tone: "tech" as const,
  },
  alevado: {
    label: "Cables",
    brand: "Cables",
    href: "/katalog?division=cables",
    origin: "https://alevadoenergy.com",
    tone: "tech" as const,
  },
};
