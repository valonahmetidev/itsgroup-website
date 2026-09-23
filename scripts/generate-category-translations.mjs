import fs from "node:fs";
import path from "node:path";

const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));

const childrenByParent = new Map();
for (const category of catalog.categories) {
  const key = `${category.source}:${category.parent}`;
  const list = childrenByParent.get(key) ?? [];
  list.push(category);
  childrenByParent.set(key, list);
}

const productCategoryIds = new Set();
for (const product of catalog.products) {
  for (const category of product.categories) {
    productCategoryIds.add(`${product.source}:${category.id}`);
  }
}

function hasProducts(category) {
  return productCategoryIds.has(`${category.source}:${category.id}`);
}

function walk(category, depth) {
  const items = [category];
  if (depth <= 0) return items;
  for (const child of childrenByParent.get(`${category.source}:${category.id}`) ?? []) {
    if (hasProducts(child)) items.push(...walk(child, depth));
  }
  return items;
}

const roots = catalog.categories.filter((category) => category.parent === 0 && hasProducts(category));
const menuCategories = new Map();
for (const root of roots) {
  for (const category of walk(root, 3)) {
    menuCategories.set(`${category.source}:${category.slug}`, category);
  }
}

function slugKey(category) {
  try {
    return `${category.source}:${decodeURIComponent(category.slug)}`;
  } catch {
    return `${category.source}:${category.slug}`;
  }
}

function titleCase(value) {
  return value
    .split(/(\s+|[-/&,])/)
    .map((part) => {
      if (!part || /^[\s\-/&,]+$/.test(part)) return part;
      if (/^[A-Z0-9]{2,}$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function fixName(name) {
  return titleCase(
    name
      .replace(/\bManagment\b/gi, "Management")
      .replace(/\breciver\b/gi, "receiver")
      .replace(/\bSatelite\b/gi, "Satellite")
      .replace(/\bunmistakable\b/gi, "managed")
      .replace(/\bpamenagjueshem\b/gi, "unmanaged")
      .replace(/\s+,/g, ",")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

const hasCyrillic = (value) => /[\u0400-\u04FF]/.test(value);
const hasAlbanian = (value) => /[ëçËÇ]/.test(value);

const enToMk = {
  "Access Control": "Контрола на пристап",
  Accessories: "Додатоци",
  Alarm: "Аларм",
  "Barcode Scanner": "Баркод скенер",
  "Camera IP Bullet": "IP bullet камери",
  "Camera IP Dome": "IP dome камери",
  "Camera IP NVR-s": "IP камери со NVR",
  "Camera PTZ": "PTZ камери",
  "Door entry system": "Систем за влезна врата",
  "Electric Lock": "Електрична брава",
  "Exit Button": "Копче за излез",
  "Fiber Optics": "Оптички кабли",
  "Gaming Monitor": "Гејминг монитор",
  "Home Solution": "Домашно решение",
  Intercoms: "Интеркоми",
  "Invertor & Sisteme Solare": "Инвертори и соларни системи",
  "Invertor Solar": "Соларни инвертори",
  "Kamera Sigurie": "Камери за безбедност",
  "Microphone Wireless System": "Безжичен микрофонски систем",
  Mikrotik: "MikroTik",
  "Network Storage (NAS)": "Мрежно складирање (NAS)",
  "Office Solution": "Офис решение",
  "Router & Switch": "Рутери и комутатори",
  "Satellite receiver": "Сателитски приемник",
  "Smart Home": "Паметен дом",
  "Sound System": "Звучен систем",
  "Time Attendance": "Евиденција на работно време",
  "Ajax Kit": "Ajax комплет",
  "Chargers - Cudy": "Полначи - Cudy",
  "Display & Video Adapters": "Display и видео адаптери",
  "HDMI Cables & Accessories": "HDMI кабли и додатоци",
  "IPTV": "IPTV",
  "RFID card": "RFID картички",
  "RFID Reader": "RFID читач",
  "Unmanaged switch": "Неуправуван комутатор",
  "Managed switch": "Управуван комутатор",
  Tester: "Тестери",
  Wireless: "Безжично",
  "Network accessories": "Мрежни додатоци",
  "Computer and laptop accessories": "Додатоци за компјутер и лаптоп",
};

const enToSq = {
  "Access Control": "Kontroll aksesi",
  Accessories: "Aksesorë",
  Alarm: "Alarm",
  "Barcode Scanner": "Skaner barkodi",
  "Camera IP Bullet": "Kamera IP bullet",
  "Camera IP Dome": "Kamera IP dome",
  "Camera IP NVR-s": "Kamera IP me NVR",
  "Camera PTZ": "Kamera PTZ",
  "Door entry system": "Sistem hyrjeje",
  "Electric Lock": "Bravë elektrike",
  "Exit Button": "Buton daljeje",
  "Fiber Optics": "Fibra optike",
  "Gaming Monitor": "Monitor gaming",
  "Home Solution": "Zgjidhje shtëpiake",
  Intercoms: "Interkom",
  "Invertor & Sisteme Solare": "Invertorë dhe sisteme diellore",
  "Invertor Solar": "Invertorë diellorë",
  "Kamera Sigurie": "Kamera sigurie",
  "Microphone Wireless System": "Sistem mikrofoni pa tela",
  Mikrotik: "MikroTik",
  "Network Storage (NAS)": "Ruajtje në rrjet (NAS)",
  "Office Solution": "Zgjidhje zyre",
  "Router & Switch": "Routerë dhe switch",
  "Satellite receiver": "Marrës satelitor",
  "Smart Home": "Shtëpi inteligjente",
  "Sound System": "Sistem audio",
  "Time Attendance": "Regjistrim i kohës",
  "Ajax Kit": "Komplet Ajax",
  "Chargers - Cudy": "Karikues - Cudy",
  "Display & Video Adapters": "Adapterë display dhe video",
  "HDMI Cables & Accessories": "Kabllot HDMI dhe aksesorë",
  IPTV: "IPTV",
  "RFID card": "Kartela RFID",
  "RFID Reader": "Lexues RFID",
  "Unmanaged switch": "Switch i pamenedzhuar",
  "Managed switch": "Switch i menaxhuar",
  Tester: "Testues",
  Wireless: "Pa tela",
  "Network accessories": "Aksesorë rrjeti",
  "Computer and laptop accessories": "Aksesorë për kompjuter dhe laptop",
};

const mkToEn = {
  "Паметен дом": "Smart home",
  "Интеркоми": "Intercoms",
  "контрола на пристап": "Access control",
  "Аларм за пожар (DMTech Fire Alarm)": "Fire alarm (DMTech)",
  "UPS , Соларни инвертори , Батерии": "UPS, solar inverters, and batteries",
  "Мрежа, алати, кабли": "Network tools and cables",
  "RFID-читач": "RFID reader",
  "Готвење": "Cooking",
  "Додатоци": "Accessories",
  "Дом и удобност": "Home and comfort",
  "Кафе и пијалаци": "Coffee and drinks",
  "Нега и здравје": "Care and health",
  "Пеглање": "Ironing",
  "Подготовка на храна": "Food preparation",
  "Чистење на домот": "Home cleaning",
  "Апарати за вафли": "Waffle makers",
  "Апарати за кафе": "Coffee machines",
  "Апарати за ориз": "Rice cookers",
  "Аудио уреди": "Audio devices",
  "Блендери": "Blenders",
  "Бричење": "Shaving",
  "Вентилатори": "Fans",
  "Додатоци за кафе": "Coffee accessories",
  "Додатоци за лична нега": "Personal care accessories",
  "Експрес лонци": "Pressure cookers",
  "Електрични бокали": "Electric kettles",
  "Електрични печки": "Electric ovens",
  "Класични фритези": "Classic deep fryers",
  "Кујнски ваги": "Kitchen scales",
  "Машинки и тримери": "Trimmers and clippers",
  "Мелници за кафе": "Coffee grinders",
  "Мерачи за крвен притисок": "Blood pressure monitors",
  "Миксери": "Mixers",
  "Мока апарати": "Moka pots",
  "Нега на коса": "Hair care",
  "Парни станици": "Steam stations",
  "Пегли на пареа": "Steam irons",
  "Правосмукалки": "Vacuum cleaners",
  "Рачни блендери": "Hand blenders",
  "Садови за готвење": "Cookware",
  "Сечкачи": "Choppers",
  "Скари и грил плочи": "Grills and grill plates",
  "Соковници": "Juicers",
  "Специјализирани апарати": "Specialty appliances",
  "ТВ додатоци": "TV accessories",
  "Телесни ваги": "Body scales",
  "Тостери": "Toasters",
  "Тостери за сендвичи": "Sandwich makers",
  "Филтри": "Filters",
  "Филтрирање вода": "Water filtration",
  "Фритези на топол воздух": "Air fryers",
  "Цедалки за цитрус": "Citrus juicers",
};

const mkToSq = {
  "Паметен дом": "Shtëpi inteligjente",
  "Интеркоми": "Interkom",
  "контрола на пристап": "Kontroll aksesi",
  "Аларм за пожар (DMTech Fire Alarm)": "Alarm zjarri (DMTech)",
  "UPS , Соларни инвертори , Батерии": "UPS, invertorë diellorë dhe bateri",
  "Мрежа, алати, кабли": "Rrjet, vegla dhe kabllo",
  "RFID-читач": "Lexues RFID",
  "Готвење": "Gatim",
  "Додатоци": "Aksesorë",
  "Дом и удобност": "Shtëpi dhe rehati",
  "Кафе и пијалаци": "Kafe dhe pije",
  "Нега и здравје": "Kujdes dhe shëndet",
  "Пеглање": "Hekurim",
  "Подготовка на храна": "Përgatitje ushqimi",
  "Чистење на домот": "Pastrim shtëpie",
  "Апарати за вафли": "Aparatë për waffle",
  "Апарати за кафе": "Aparatë kafeje",
  "Апарати за ориз": "Aparatë për oriz",
  "Аудио уреди": "Pajisje audio",
  "Блендери": "Blenderë",
  "Бричење": "Rruajtje",
  "Вентилатори": "Ventilatorë",
  "Додатоци за кафе": "Aksesorë kafeje",
  "Додатоци за лична нега": "Aksesorë për kujdes personal",
  "Експрес лонци": "Tenxhere me presion",
  "Електрични бокали": "Kazanë elektrike",
  "Електрични печки": "Furrë elektrike",
  "Класични фритези": "Friteza klasike",
  "Кујнски ваги": "Peshore kuzhine",
  "Машинки и тримери": "Makina rrojeje dhe trimera",
  "Мелници за кафе": "Mulli kafeje",
  "Мерачи за крвен притисок": "Matës tensioni",
  "Миксери": "Mikserë",
  "Мока апарати": "Aparatë moka",
  "Нега на коса": "Kujdes për flokët",
  "Парни станици": "Stacione avulli",
  "Пегли на пареа": "Hekur avulli",
  "Правосмукалки": "Fshesa me korrent",
  "Рачни блендери": "Blenderë dore",
  "Садови за готвење": "Enë gatimi",
  "Сечкачи": "Grirës",
  "Скари и грил плочи": "Skarë dhe pllaka grill",
  "Соковници": "Shtrydhëse",
  "Специјализирани апарати": "Aparatë të specializuara",
  "ТВ додатоци": "Aksesorë TV",
  "Телесни ваги": "Peshore trupore",
  "Тостери": "Tostiera",
  "Тостери за сендвичи": "Aparatë për sanduiç",
  "Филтри": "Filtra",
  "Филтрирање вода": "Filtrim uji",
  "Фритези на топол воздух": "Friteza me ajër të nxehtë",
  "Цедалки за цитрус": "Shtrydhëse agrumesh",
};

const alToEn = {
  "Aksesorë për Kompjuter dhe Laptop": "Computer and laptop accessories",
  "Pasjisje Rrjeti": "Network devices",
  "Bateri per Invertor": "Inverter batteries",
  "switch i pamenagjueshem": "Unmanaged switch",
};

const alToMk = {
  "Aksesorë për Kompjuter dhe Laptop": "Додатоци за компјутер и лаптоп",
  "Pasjisje Rrjeti": "Мрежни уреди",
  "Bateri per Invertor": "Батерии за инвертор",
  "switch i pamenagjueshem": "Неуправуван комутатор",
};

const alToSq = {
  "Aksesorë për Kompjuter dhe Laptop": "Aksesorë për kompjuter dhe laptop",
  "Pasjisje Rrjeti": "Pajisje rrjeti",
  "Bateri per Invertor": "Bateri për invertor",
  "switch i pamenagjueshem": "Switch i pamenedzhuar",
};

function translateCategory(category) {
  const fixed = fixName(category.name);
  const key = slugKey(category);

  if (hasCyrillic(category.name)) {
    return {
      mk: category.name,
      en: mkToEn[category.name] ?? fixed,
      sq: mkToSq[category.name] ?? mkToEn[category.name] ?? fixed,
    };
  }

  if (hasAlbanian(category.name) || category.name === "Pasjisje Rrjeti") {
    return {
      mk: alToMk[category.name] ?? fixed,
      en: alToEn[category.name] ?? fixed,
      sq: alToSq[category.name] ?? category.name,
    };
  }

  const en = enToMk[fixed] ? fixed : fixed;
  return {
    mk: enToMk[fixed] ?? enToMk[category.name] ?? fixed,
    en,
    sq: enToSq[fixed] ?? enToSq[category.name] ?? fixed,
  };
}

const translations = {};
for (const category of menuCategories.values()) {
  translations[slugKey(category)] = translateCategory(category);
}

const output = `import type { Locale } from "@/lib/i18n/types";
import type { Source } from "@/lib/types";

export type CategoryLabel = {
  mk: string;
  en: string;
  sq: string;
};

export const categoryTranslations: Record<string, CategoryLabel> = ${JSON.stringify(translations, null, 2)};

export function categorySlugKey(source: Source, slug: string) {
  try {
    return \`\${source}:\${decodeURIComponent(slug)}\`;
  } catch {
    return \`\${source}:\${slug}\`;
  }
}
`;

fs.writeFileSync(path.join("src/lib/i18n/category-names.ts"), output);
console.log(`Wrote ${Object.keys(translations).length} category translations`);
