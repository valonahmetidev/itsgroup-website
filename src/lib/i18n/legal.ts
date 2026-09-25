import type { Locale } from "@/lib/i18n/types";

export type LegalSection = { title: string; paragraphs: string[] };

export type LegalDoc = {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

const company = {
  name: "ITS Group",
  phone: "+389 76 302 228",
  website: "https://itsgroup.mk",
  contactPath: "/kontakt",
  country: "North Macedonia",
};

function contactUrl() {
  return `${company.website}${company.contactPath}`;
}

function rightsContact(locale: Locale): string {
  if (locale === "sq") {
    return `Për të ushtruar të drejtat tuaja, na kontaktoni në ${company.phone} ose përmes formularit në ${contactUrl()}.`;
  }
  if (locale === "en") {
    return `To exercise your rights, contact us by phone at ${company.phone} or via the contact form at ${contactUrl()}.`;
  }
  return `За остварување на правата, контактирајте не на ${company.phone} или преку формуларот на ${contactUrl()}.`;
}

function questionsContact(locale: Locale): string {
  if (locale === "sq") {
    return `Pyetje: ${company.phone}, ${contactUrl()}`;
  }
  if (locale === "en") {
    return `Questions: ${company.phone}, ${contactUrl()}`;
  }
  return `Прашања: ${company.phone}, ${contactUrl()}`;
}

function controllerBlock(locale: Locale): string {
  if (locale === "sq") {
    return `${company.name}, ${company.country}. Telefon: ${company.phone}. Uebfaqe: ${company.website}.`;
  }
  if (locale === "en") {
    return `${company.name}, ${company.country}. Phone: ${company.phone}. Website: ${company.website}.`;
  }
  return `${company.name}, ${company.country}. Телефон: ${company.phone}. Веб-сајт: ${company.website}.`;
}

function privacyDoc(locale: Locale): LegalDoc {
  const controller = controllerBlock(locale);
  if (locale === "en") {
    return {
      title: "Privacy policy",
      intro: "This policy explains how ITS Group processes personal data when you use itsgroup.mk, in line with the laws of North Macedonia.",
      updated: "Last updated: September 2025",
      sections: [
        {
          title: "Who we are",
          paragraphs: [
            `The data controller for this website is ${controller}`,
            "We provide technology, security, and connectivity solutions for businesses and private clients.",
          ],
        },
        {
          title: "What data we collect",
          paragraphs: [
            "Contact and quote details you choose to send us (name, phone, email, message, company name, product list) when you contact us via WhatsApp or prepare a quote on the site.",
            "Customer account data if you sign in (email and password hash stored on our server; we never store plain-text passwords).",
            "Technical data: IP address, browser type, and security logs processed by our host (Cloudflare) to deliver and protect the site.",
            "Preferences stored in your browser or cookies: language, currency, theme, quote list, and optional cookie consent choice.",
            "Analytics data only if you accept analytics cookies (see below).",
          ],
        },
        {
          title: "Why we use your data",
          paragraphs: [
            "To respond to inquiries and prepare offers you request.",
            "To operate customer login and admin functions you or our staff use.",
            "To remember your language, currency, and theme preferences.",
            "To measure site usage when you consent to analytics.",
            "To keep the website secure and prevent abuse.",
          ],
        },
        {
          title: "Legal basis",
          paragraphs: [
            "We rely on your consent for non-essential cookies and analytics.",
            "We process inquiry and account data as necessary to take steps at your request before a contract and to perform services you ask for.",
            "We process security and server logs based on our legitimate interest in operating a safe website.",
          ],
        },
        {
          title: "Cookies and local storage",
          paragraphs: [
            "Essential: session cookies for customer/admin login (httpOnly, server-side), and preference cookies (locale, currency, theme).",
            "Functional: local storage for your quote list and contact messages until you clear them.",
            "Analytics: Google Analytics 4 loads only after you click Accept on the cookie banner.",
            "You can withdraw analytics consent by clearing site data or rejecting cookies when prompted again.",
          ],
        },
        {
          title: "Sharing and processors",
          paragraphs: [
            "We use Cloudflare for hosting, security, and content delivery.",
            "If you use WhatsApp to contact us, Meta/WhatsApp processes your message under their terms.",
            "Google processes analytics data only when you consent, under Google's terms.",
            "We do not sell personal data.",
          ],
        },
        {
          title: "Retention",
          paragraphs: [
            "Quote and contact content in your browser remains until you clear it.",
            "Customer account data is kept while the account is active.",
            "Server and security logs are kept for a limited period appropriate for security and troubleshooting.",
            "Analytics data retention follows Google Analytics settings configured for this site.",
          ],
        },
        {
          title: "Your rights",
          paragraphs: [
            "Under North Macedonian data protection law you may request access, correction, deletion, restriction, or objection regarding your personal data, and withdraw consent where processing is consent-based.",
            `${rightsContact("en")} You may also lodge a complaint with the Personal Data Protection Agency of North Macedonia.`,
          ],
        },
        {
          title: "Children",
          paragraphs: ["Our services are aimed at businesses and adults. We do not knowingly collect data from children."],
        },
        {
          title: "Changes",
          paragraphs: ["We may update this policy. The latest version is always published on this page."],
        },
      ],
    };
  }

  if (locale === "sq") {
    return {
      title: "Politika e privatësisë",
      intro:
        "Kjo politikë shpjegon si ITS Group përpunon të dhënat personale kur përdorni itsgroup.mk, në përputhje me ligjet e Maqedonisë së Veriut.",
      updated: "Përditësuar së fundmi: shtator 2025",
      sections: [
        {
          title: "Kush jemi",
          paragraphs: [
            `Përgjegjësi për përpunimin e të dhënave është ${controller}`,
            "Ofrojmë zgjidhje teknologjike, sigurie dhe lidhshmërie për biznese dhe klientë privatë.",
          ],
        },
        {
          title: "Çfarë të dhënash mbledhim",
          paragraphs: [
            "Të dhënat e kontaktit dhe ofertës që zgjidhni të na dërgoni (emër, telefon, email, mesazh, kompani, listë produktesh) kur na kontaktoni në WhatsApp ose përgatitni një ofertë në faqe.",
            "Të dhënat e llogarisë së klientit nëse hyni (email dhe hash i fjalëkalimit në server; nuk ruajmë fjalëkalime në tekst të qartë).",
            "Të dhëna teknike: adresë IP, lloj shfletuesi dhe log-e sigurie nga hosti (Cloudflare).",
            "Preferencat në shfletues ose cookies: gjuha, monedha, tema, lista e ofertës dhe zgjedhja e cookies.",
            "Të dhëna analitike vetëm nëse pranoni cookies analitike.",
          ],
        },
        {
          title: "Pse i përdorim të dhënat",
          paragraphs: [
            "Për t'iu përgjigjur kërkesave dhe për të përgatitur ofertat që kërkoni.",
            "Për funksionimin e hyrjes së klientit dhe panelit të administrimit.",
            "Për të mbajtur mend gjuhën, monedhën dhe temën.",
            "Për matjen e përdorimit të faqes me pëlqimin tuaj.",
            "Për sigurinë e faqes dhe parandalimin e abuzimit.",
          ],
        },
        {
          title: "Baza ligjore",
          paragraphs: [
            "Pëlqimi juaj për cookies jo-thelbësore dhe analitikë.",
            "Të dhënat e kërkesës dhe llogarisë sipas nevojës për shërbimin që kërkoni.",
            "Log-et e sigurisë bazuar në interesin legjitim për një faqe të sigurt.",
          ],
        },
        {
          title: "Cookies dhe ruajtja lokale",
          paragraphs: [
            "Të domosdoshme: cookies sesioni për hyrje klient/admin dhe cookies preferencash.",
            "Funksionale: ruajtje lokale për listën e ofertës derisa ta pastroni.",
            "Analitikë: Google Analytics 4 ngarkohet vetëm pas Pranoj në bannerin e cookies.",
          ],
        },
        {
          title: "Ndarja dhe përpunuesit",
          paragraphs: [
            "Përdorim Cloudflare për hostim dhe siguri.",
            "WhatsApp/Meta përpunon mesazhet sipas kushteve të tyre.",
            "Google përpunon analitikën vetëm me pëlqimin tuaj.",
            "Nuk shesim të dhëna personale.",
          ],
        },
        {
          title: "Afati i ruajtjes",
          paragraphs: [
            "Përmbajtja në shfletuesin tuaj mbetet derisa ta fshini.",
            "Llogaria e klientit mbetet aktive derisa të jetë në përdorim.",
            "Log-et e serverit ruhen për një periudhë të kufizuar.",
          ],
        },
        {
          title: "Të drejtat tuaja",
          paragraphs: [
            "Sipas ligjit maqedonas mund të kërkoni qasje, korrigjim, fshirje, kufizim ose kundërshtim, dhe të tërhiqni pëlqimin.",
            `${rightsContact("sq")} Mund të ankoheni te Agjencia për Mbrojtjen e të Dhënave Personale të Maqedonisë së Veriut.`,
          ],
        },
        {
          title: "Fëmijët",
          paragraphs: ["Shërbimet tona janë për biznese dhe të rritur. Nuk mbledhim me vetëdije të dhëna nga fëmijët."],
        },
        {
          title: "Ndryshime",
          paragraphs: ["Mund ta përditësojmë këtë politikë. Versioni më i fundit është gjithmonë në këtë faqe."],
        },
      ],
    };
  }

  return {
    title: "Политика за приватност",
    intro:
      "Оваа политика објаснува како ITS Group обработува лични податоци кога користите itsgroup.mk, во согласност со законите на Северна Македонија.",
    updated: "Последно ажурирање: септември 2025",
    sections: [
      {
        title: "Кој сме",
        paragraphs: [
          `Субјектот за обработка на податоци е ${controller}`,
          "Обезбедуваме технолошки, безбедносни и комуникациски решенија за бизниси и приватни клиенти.",
        ],
      },
      {
        title: "Кои податоци собираме",
        paragraphs: [
          "Контакт и понуда што доброволно ни ги испраќате (име, телефон, е-пошта, порака, компанија, листа производи) преку WhatsApp или при подготовка на понуда на сајтот.",
          "Податоци за клиентска сметка при најава (е-пошта и хеш на лозинка на сервер; не чуваме лозинки во чист текст).",
          "Технички податоци: IP адреса, тип на прелистувач и безбедносни логови од хостингот (Cloudflare).",
          "Поставки во прелистувач или колачиња: јазик, валута, тема, листа за понуда и избор за колачиња.",
          "Аналитички податоци само ако прифатите аналитички колачиња.",
        ],
      },
      {
        title: "Зошто ги користиме податоците",
        paragraphs: [
          "За да одговориме на барања и да подготвиме понуди.",
          "За работа на клиентска најава и админ функции.",
          "За јазик, валута и тема.",
          "За мерење на посетеност со ваша согласност.",
          "За безбедност и спречување злоупотреба.",
        ],
      },
      {
        title: "Правна основа",
        paragraphs: [
          "Ваша согласност за неесенцијални колачиња и аналитика.",
          "Податоци за барања и сметки неопходни за услугата што ја барате.",
          "Безбедносни логови врз основа на легитимен интерес.",
        ],
      },
      {
        title: "Колачиња и локално складирање",
        paragraphs: [
          "Неопходни: сесиски колачиња за најава и колачиња за поставки.",
          "Функционални: локално складирање за листа понуда додека не го избришете.",
          "Аналитика: Google Analytics 4 се вчитува само по „Прифати“ на банерот.",
        ],
      },
      {
        title: "Споделување и обработувачи",
        paragraphs: [
          "Користиме Cloudflare за хостинг и безбедност.",
          "WhatsApp/Meta обработува пораки по нивните услови.",
          "Google обработува аналитика само со согласност.",
          "Не продаваме лични податоци.",
        ],
      },
      {
        title: "Чување",
        paragraphs: [
          "Содржина во прелистувачот останува додека не ја избришете.",
          "Клиентска сметка додека е активна.",
          "Серверски логови ограничен период.",
        ],
      },
      {
        title: "Ваши права",
        paragraphs: [
          "По македонскиот закон можете да побарате пристап, исправка, бришење, ограничување или приговор и да повлечете согласност.",
          `${rightsContact("mk")} Може да поднесете приговор до Агенцијата за заштита на личните податоци.`,
        ],
      },
      {
        title: "Деца",
        paragraphs: ["Услугите се наменети за бизниси и возрасни. Свесно не собираме податоци од деца."],
      },
      {
        title: "Промени",
        paragraphs: ["Политиката може да се ажурира. Најновата верзија е на оваа страница."],
      },
    ],
  };
}

function termsDoc(locale: Locale): LegalDoc {
  if (locale === "en") {
    return {
      title: "Terms and conditions",
      intro: "These terms govern use of the itsgroup.mk website operated by ITS Group in North Macedonia.",
      updated: "Last updated: September 2025",
      sections: [
        {
          title: "Use of the website",
          paragraphs: [
            "You may browse the catalog and prepare quote lists for your own business or personal use.",
            "You must not attempt to disrupt the site, scrape it excessively, or access admin areas without authorization.",
          ],
        },
        {
          title: "Catalog and prices",
          paragraphs: [
            "Product information, prices, discounts, and stock come from suppliers and our database and may change without notice.",
            "A quote list or PDF is not a binding offer until we confirm availability and final price in writing (including via WhatsApp).",
          ],
        },
        {
          title: "Customer accounts",
          paragraphs: [
            "If you receive login credentials, keep them confidential. You are responsible for activity under your account.",
            "We may suspend accounts that are misused or compromise security.",
          ],
        },
        {
          title: "Intellectual property",
          paragraphs: [
            "Site design, text, and branding belong to ITS Group or licensors. Product images and names may belong to manufacturers.",
            "You may not copy site content for commercial republication without permission.",
          ],
        },
        {
          title: "WhatsApp and communications",
          paragraphs: [
            "When you contact us via WhatsApp, you also accept WhatsApp's terms and privacy policy.",
            "We aim to respond promptly but do not guarantee a specific response time on the website itself.",
          ],
        },
        {
          title: "Disclaimer",
          paragraphs: [
            "The site is provided as is. To the extent permitted by law, we are not liable for indirect damages from use of the site or reliance on catalog data.",
            "Nothing here limits mandatory consumer rights under North Macedonian law.",
          ],
        },
        {
          title: "Governing law",
          paragraphs: ["These terms are governed by the laws of North Macedonia. Courts in North Macedonia have jurisdiction unless mandatory law provides otherwise."],
        },
        {
          title: "Contact",
          paragraphs: [questionsContact("en")],
        },
      ],
    };
  }

  if (locale === "sq") {
    return {
      title: "Kushtet e përdorimit",
      intro: "Këto kushte rregullojnë përdorimin e faqes itsgroup.mk nga ITS Group në Maqedoninë e Veriut.",
      updated: "Përditësuar së fundmi: shtator 2025",
      sections: [
        {
          title: "Përdorimi i faqes",
          paragraphs: [
            "Mund të shfletoni katalogun dhe të përgatitni lista ofertash për përdorim personal ose biznesi.",
            "Nuk duhet të dëmtoni faqen, të bëni scraping të tepruar ose të hyni në admin pa autorizim.",
          ],
        },
        {
          title: "Katalogu dhe çmimet",
          paragraphs: [
            "Informacioni, çmimet dhe stoku mund të ndryshojnë pa njoftim paraprak.",
            "Lista e ofertës ose PDF nuk është ofertë ligjore derisa të konfirmojmë çmimin dhe disponueshmërinë (edhe në WhatsApp).",
          ],
        },
        {
          title: "Llogaritë e klientëve",
          paragraphs: [
            "Ruani kredencialet konfidenciale. Jeni përgjegjës për aktivitetin në llogarinë tuaj.",
            "Mund të pezullojmë llogaritë e keqpërdorura.",
          ],
        },
        {
          title: "Pronësia intelektuale",
          paragraphs: [
            "Dizajni dhe marka i përkasin ITS Group ose licencuesve. Imazhet e produkteve mund t'i përkasin prodhuesve.",
            "Nuk mund të ripublikoni për qëllime komerciale pa leje.",
          ],
        },
        {
          title: "WhatsApp dhe komunikimi",
          paragraphs: [
            "Kur na kontaktoni në WhatsApp, pranoni edhe kushtet e WhatsApp.",
            "Përpiqemi të përgjigjemi shpejt por nuk garantojmë kohë përgjigjeje në faqe.",
          ],
        },
        {
          title: "Mohim përgjegjësie",
          paragraphs: [
            "Faqja ofrohet „siç është“. Për sa lejon ligji, nuk jemi përgjegjës për dëme indirekte nga përdorimi i faqes.",
            "Kjo nuk kufizon të drejtat e detyrueshme të konsumatorit sipas ligjit maqedonas.",
          ],
        },
        {
          title: "Ligji i zbatueshëm",
          paragraphs: ["Kushtet rregullohen nga ligjet e Maqedonisë së Veriut. Gjykatat kompetente janë në Maqedoninë e Veriut."],
        },
        {
          title: "Kontakt",
          paragraphs: [questionsContact("sq")],
        },
      ],
    };
  }

  return {
    title: "Услови за користење",
    intro: "Овие услови важат за користење на itsgroup.mk кој го управува ITS Group во Северна Македонија.",
    updated: "Последно ажурирање: септември 2025",
    sections: [
      {
        title: "Користење на сајтот",
        paragraphs: [
          "Можете да пребарувате каталог и да подготвувате листи за понуда.",
          "Забрането е оштетување на сајтот, прекомерно автоматизирано собирање податоци или неовластен пристап до админ.",
        ],
      },
      {
        title: "Каталог и цени",
        paragraphs: [
          "Информациите, цените и залихата може да се променат без претходна најава.",
          "Листата или PDF не е обврзувачка понуда додека не потврдиме цена и достапност (вклучително преку WhatsApp).",
        ],
      },
      {
        title: "Клиентски сметки",
        paragraphs: [
          "Чувајте ги податоците за најава доверливи. Одговорни сте за активностите на вашата сметка.",
          "Можеме да суспендираме злоупотребени сметки.",
        ],
      },
      {
        title: "Интелектуална сопственост",
        paragraphs: [
          "Дизајнот и брендот се на ITS Group или лиценцирани. Сликите на производи може да се на производителите.",
          "Не смее да се републикува содржината комерцијално без дозвола.",
        ],
      },
      {
        title: "WhatsApp и комуникација",
        paragraphs: [
          "При контакт преку WhatsApp прифаќате и нивните услови.",
          "Се трудиме брзо да одговориме, но не гарантираме рок на сајтот.",
        ],
      },
      {
        title: "Ограничување на одговорност",
        paragraphs: [
          "Сајтот се обезбедува „како што е“. До мера дозволена со закон, не одговараме за индиректна штета.",
          "Ова не ги ограничува задолжителните права на потрошувачите.",
        ],
      },
      {
        title: "Меродавно право",
        paragraphs: ["Важат законите на Северна Македонија. Надлежни се македонските судови."],
      },
      {
        title: "Контакт",
        paragraphs: [questionsContact("mk")],
      },
    ],
  };
}

export function legalBundle(locale: Locale) {
  const privacy = privacyDoc(locale);
  const terms = termsDoc(locale);
  const nav =
    locale === "en"
      ? { privacy: "Privacy", terms: "Terms" }
      : locale === "sq"
        ? { privacy: "Privatësia", terms: "Kushtet" }
        : { privacy: "Приватност", terms: "Услови" };
  const eyebrow = locale === "en" ? "Legal" : locale === "sq" ? "Ligjore" : "Правно";

  return {
    eyebrow,
    privacyNav: nav.privacy,
    termsNav: nav.terms,
    privacy,
    terms,
  };
}
