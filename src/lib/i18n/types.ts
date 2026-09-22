export type Locale = "mk" | "sq" | "en";

export type MenuGroupKey = "surveillance" | "networks" | "access" | "energy" | "rest" | "home";

export type Dictionary = {
  meta: {
    siteDescription: string;
  };
  nav: {
    technology: string;
    home: string;
    catalog: string;
    about: string;
    contact: string;
    quote: string;
    menu: string;
    themeToDark: string;
    themeToLight: string;
    categories: string;
    allDivisions: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    fromCatalog: string;
    products: string;
  };
  home: {
    trecoTitle: string;
    tremarkTitle: string;
    allCategories: string;
    statTech: string;
    statHome: string;
    statCategories: string;
  };
  catalog: {
    title: string;
    description: string;
    all: string;
    resultsFor: string;
    fromBoth: string;
    sortName: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    noProducts: string;
  };
  product: {
    inStock: string;
    checkStock: string;
    addToQuote: string;
    inQuote: string;
    onRequest: string;
    openOn: string;
    sameCategory: string;
  };
  quote: {
    title: string;
    heading: string;
    text: string;
    empty: string;
    openCatalog: string;
    remove: string;
    clear: string;
    messages: string;
  };
  contact: {
    title: string;
    eyebrow: string;
    heading: string;
    text: string;
    domain: string;
    email: string;
    phone: string;
    address: string;
    pending: string;
    name: string;
    message: string;
    save: string;
    saved: string;
  };
  about: {
    title: string;
    eyebrow: string;
    heading: string;
    text: string;
    inside: string;
    insideBody: string;
    updated: string;
    quoteTitle: string;
    quoteBody: string;
  };
  division: {
    trecoTitle: string;
    trecoText: string;
    tremarkTitle: string;
    tremarkText: string;
  };
  footer: {
    text: string;
    technology: string;
    home: string;
  };
  search: {
    label: string;
    placeholder: string;
    allResults: string;
  };
  pagination: {
    prev: string;
    next: string;
  };
  notFound: {
    title: string;
    catalog: string;
  };
  menuGroups: Record<MenuGroupKey, string>;
  products: {
    one: string;
    many: string;
  };
};
