import type { Locale } from "@/lib/i18n/types";

export type MetaPages = {
  home: { title: string; description: string };
  technology: { title: string; description: string };
  homeDivision: { title: string; description: string };
  catalog: { title: string; description: string };
  about: { title: string; description: string };
  contact: { title: string; description: string };
  quote: { title: string; description: string };
  login: { title: string; description: string };
  profile: { title: string; description: string };
  privacy: { title: string; description: string };
  terms: { title: string; description: string };
  notFound: { title: string; description: string };
};

const pages: Record<Locale, MetaPages> = {
  mk: {
    home: {
      title: "Почетна",
      description:
        "ITS Group Куманово — технологија, безбедност и поврзување. Официјален каталог itsgroup.mk: видеонадзор, мрежи, паметен дом и апарати за дом.",
    },
    technology: {
      title: "Технологија",
      description: "Видеонадзор, MikroTik, Ubiquiti, Cudy, оптика, контрола на пристап, KNX и паметен дом.",
    },
    homeDivision: {
      title: "Дом",
      description: "Апарати за готвење, кафе, чистење и нега — избор од каталогот на ITS Group.",
    },
    catalog: {
      title: "Каталог",
      description: "Пребарувајте производи, цени и достапност. Подгответе листа за понуда и контактирајте нè на WhatsApp.",
    },
    about: {
      title: "За нас",
      description:
        "ITS Group — над 10 години искуство во инсталации, CCTV, мрежи, аларми и IT услуги во Северна Македонија.",
    },
    contact: {
      title: "Контакт",
      description: "Контактирајте ITS Group на WhatsApp или телефон. Продавница во Куманово.",
    },
    quote: {
      title: "Понуда",
      description: "Листа за понуда со производи, PDF профактура и испраќање преку WhatsApp.",
    },
    login: {
      title: "Најава",
      description: "Најава за регистрирани клиенти на ITS Group.",
    },
    profile: {
      title: "Мој профил",
      description: "Ваши податоци, попусти и профактури од ITS Group.",
    },
    privacy: {
      title: "Политика за приватност",
      description: "Како ITS Group обработува лични податоци на itsgroup.mk.",
    },
    terms: {
      title: "Услови за користење",
      description: "Услови за користење на веб-сајтот itsgroup.mk.",
    },
    notFound: {
      title: "Страницата не е пронајдена",
      description: "Бараната страница не постои.",
    },
  },
  sq: {
    home: {
      title: "Kryefaqja",
      description:
        "ITS Group Kumanovë — teknologji, siguri dhe lidhshmëri. Katalogu zyrtar itsgroup.mk: CCTV, rrjete, smart home dhe pajisje shtëpiake.",
    },
    technology: {
      title: "Teknologji",
      description: "Videombikëqyrje, MikroTik, Ubiquiti, Cudy, fibra optike, kontroll aksesi, KNX dhe smart home.",
    },
    homeDivision: {
      title: "Shtëpi",
      description: "Pajisje për gatim, kafe, pastrim dhe kujdes personal nga katalogu ITS Group.",
    },
    catalog: {
      title: "Katalog",
      description: "Kërko produkte, çmime dhe disponueshmëri. Përgatit listë oferte dhe na kontakto në WhatsApp.",
    },
    about: {
      title: "Rreth nesh",
      description:
        "ITS Group — mbi 10 vite eksperiencë në instalime, CCTV, rrjete, alarme dhe shërbime IT në Maqedoninë e Veriut.",
    },
    contact: {
      title: "Kontakt",
      description: "Kontaktoni ITS Group në WhatsApp ose telefon. Dyqan në Kumanovë.",
    },
    quote: {
      title: "Ofertë",
      description: "Lista e ofertës me produkte, profaturë (PDF) dhe dërgim përmes WhatsApp.",
    },
    login: {
      title: "Hyrje",
      description: "Hyrje për klientët e regjistruar të ITS Group.",
    },
    profile: {
      title: "Profili im",
      description: "Të dhënat, zbritjet dhe profaturat nga ITS Group.",
    },
    privacy: {
      title: "Politika e privatësisë",
      description: "Si ITS Group përpunon të dhënat personale në itsgroup.mk.",
    },
    terms: {
      title: "Kushtet e përdorimit",
      description: "Kushtet për përdorimin e faqes itsgroup.mk.",
    },
    notFound: {
      title: "Faqja nuk u gjet",
      description: "Faqja e kërkuar nuk ekziston.",
    },
  },
  en: {
    home: {
      title: "Home",
      description:
        "ITS Group Kumanovo, North Macedonia — technology, security, and connectivity. Official catalog at itsgroup.mk: CCTV, networks, smart home, and appliances.",
    },
    technology: {
      title: "Technology",
      description: "Video surveillance, MikroTik, Ubiquiti, Cudy, fiber, access control, KNX, and smart home.",
    },
    homeDivision: {
      title: "Home appliances",
      description: "Cooking, coffee, cleaning, and personal care from the ITS Group catalog.",
    },
    catalog: {
      title: "Catalog",
      description: "Browse products, prices, and stock. Build a quote list and contact us on WhatsApp.",
    },
    about: {
      title: "About us",
      description:
        "ITS Group — 10+ years installing CCTV, networks, alarms, and IT services in North Macedonia.",
    },
    contact: {
      title: "Contact",
      description: "Reach ITS Group on WhatsApp or phone. Store in Kumanovo, North Macedonia.",
    },
    quote: {
      title: "Quote",
      description: "Quote list with products, proforma invoice PDF, and WhatsApp sharing.",
    },
    login: {
      title: "Sign in",
      description: "Sign in for registered ITS Group customers.",
    },
    profile: {
      title: "My profile",
      description: "Your details, discounts, and proforma invoices from ITS Group.",
    },
    privacy: {
      title: "Privacy policy",
      description: "How ITS Group processes personal data on itsgroup.mk.",
    },
    terms: {
      title: "Terms and conditions",
      description: "Terms for using the itsgroup.mk website.",
    },
    notFound: {
      title: "Page not found",
      description: "The page you requested does not exist.",
    },
  },
};

export function metaPagesFor(locale: Locale): MetaPages {
  return pages[locale];
}
