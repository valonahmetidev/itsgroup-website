import type { Dictionary } from "@/lib/i18n/types";

const en: Dictionary = {
  meta: {
    siteDescription:
      "ITS Group unified catalog: technology products from Treco and home appliances from Tremark.",
  },
  nav: {
    technology: "Technology",
    home: "Home",
    catalog: "Catalog",
    about: "About",
    contact: "Contact",
    quote: "Quote",
    menu: "Menu",
    themeToDark: "Dark mode",
    themeToLight: "Light mode",
    categories: "Categories",
    allDivisions: "All divisions",
  },
  hero: {
    kicker: "itsgroup.mk",
    title: "Technology and home, in one place.",
    subtitle:
      "A catalog with {tech} products for networking, video surveillance and smart home from Treco, and {home} home appliances from Tremark.",
    fromCatalog: "From the catalog",
    products: "products",
  },
  home: {
    trecoTitle: "From the network to the camera",
    tremarkTitle: "For everyday living",
    allCategories: "All categories",
    statTech: "technology products",
    statHome: "home appliances",
    statCategories: "categories in the menu",
  },
  catalog: {
    title: "Catalog",
    description: "All products from Treco and Tremark.",
    all: "All",
    resultsFor: 'Results for "{query}"',
    fromBoth: "{count} from both catalogs.",
    sortName: "Name",
    sortPriceAsc: "Price ↑",
    sortPriceDesc: "Price ↓",
    noProducts: "No products match this selection.",
  },
  product: {
    inStock: "In stock",
    checkStock: "Check availability",
    addToQuote: "Add to quote",
    inQuote: "In quote",
    onRequest: "On request",
    openOn: "Open on {site}",
    sameCategory: "From the same category",
  },
  quote: {
    title: "Quote",
    heading: "Your list",
    text: "Products stay on this device. Open the original product page if you want to continue to the store.",
    empty: "Your list is empty.",
    openCatalog: "Open catalog",
    remove: "Remove",
    clear: "Clear list",
    messages: "Messages",
  },
  contact: {
    title: "Contact",
    eyebrow: "Contact",
    heading: "Tell us what you need.",
    text: "Leave your name and message. Once we confirm email and address, the form will send directly to us.",
    domain: "Domain",
    email: "Email",
    phone: "Phone",
    address: "Address",
    pending: "To be added",
    name: "Name",
    message: "Message",
    save: "Save message",
    saved: "The message is saved in the quote list on this browser.",
  },
  about: {
    title: "About",
    eyebrow: "ITS Group",
    heading: "Two catalogs, one modern storefront.",
    text: "The site brings together technology from Treco and home appliances from Tremark, with the same categories in the menus.",
    inside: "What is inside",
    insideBody:
      "Technology has {tech} products: cameras, NVR, MikroTik, Ubiquiti, Cudy, fiber optics, racks, access control, smart home and solar systems. Home has {home} products for cooking, coffee, cleaning, ironing and care.",
    updated:
      "The catalog was captured on {date}. Prices, discounts and stock come from the original stores. Every product also links to its page on treco.mk or tremark.mk.",
    quoteTitle: "Quote",
    quoteBody:
      "You can add products to a quote list. The list stays in your browser. Checkout remains on the original stores until we connect it here.",
  },
  division: {
    trecoTitle: "Technology for business, network and home",
    trecoText:
      "All categories from treco.mk: video surveillance, MikroTik, Ubiquiti, Cudy, fiber optics, access control, smart home and solar systems.",
    tremarkTitle: "Appliances for better living",
    tremarkText:
      "All categories from tremark.mk: cooking, coffee, food prep, cleaning, ironing and personal care.",
  },
  footer: {
    text:
      "One storefront for technology from Treco and home appliances from Tremark. Prices and stock come from their catalogs.",
    technology: "Technology",
    home: "Home",
  },
  search: {
    label: "Search products",
    placeholder: "Search all products",
    allResults: "All results",
  },
  pagination: {
    prev: "Previous",
    next: "Next",
  },
  notFound: {
    title: "This page does not exist.",
    catalog: "Go to catalog",
  },
  menuGroups: {
    surveillance: "Video surveillance",
    networks: "Networks",
    access: "Access & alarm",
    energy: "Home, energy & accessories",
    rest: "Other",
    home: "Home",
  },
  products: {
    one: "1 product",
    many: "{count} products",
  },
};

export default en;
