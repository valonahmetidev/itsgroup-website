import type { Locale } from "@/lib/i18n/types";
import type { Source } from "@/lib/types";

export type CategoryLabel = {
  mk: string;
  en: string;
  sq: string;
};

export const categoryTranslations: Record<string, CategoryLabel> = {
  "treco:alarm": {
    "mk": "Alarme Dhe Zbulim Zjarri",
    "en": "Alarme Dhe Zbulim Zjarri",
    "sq": "Alarme Dhe Zbulim Zjarri"
  },
  "treco:security-alarm": {
    "mk": "Alarme Kundër Vjedhjes",
    "en": "Alarme Kundër Vjedhjes",
    "sq": "Alarme kundër vjedhjes"
  },
  "treco:fire": {
    "mk": "Sisteme Kundër Zjarrit",
    "en": "Sisteme Kundër Zjarrit",
    "sq": "Sisteme kundër zjarrit"
  },
  "treco:power": {
    "mk": "Energji Dhe UPS",
    "en": "Energji Dhe UPS",
    "sq": "Energji Dhe UPS"
  },
  "treco:batteries": {
    "mk": "Bateri",
    "en": "Bateri",
    "sq": "Bateri"
  },
  "treco:solar-power": {
    "mk": "Invertorë Dhe Pajisje Solare",
    "en": "Invertorë Dhe Pajisje Solare",
    "sq": "Invertorë dhe pajisje solare"
  },
  "treco:ups": {
    "mk": "Pajisje UPS",
    "en": "Pajisje UPS",
    "sq": "Pajisje UPS"
  },
  "treco:infrastructure": {
    "mk": "Kabllo, Rack Dhe Optikë",
    "en": "Kabllo, Rack Dhe Optikë",
    "sq": "Kabllo, rack dhe optikë"
  },
  "treco:optical-cables": {
    "mk": "Kabllo Dhe Aksesorë Optikë",
    "en": "Kabllo Dhe Aksesorë Optikë",
    "sq": "Kabllo dhe aksesorë optikë"
  },
  "treco:copper-cables": {
    "mk": "Kabllo Rrjeti Dhe Konektorë",
    "en": "Kabllo Rrjeti Dhe Konektorë",
    "sq": "Kabllo rrjeti dhe konektorë"
  },
  "treco:optical-network": {
    "mk": "Module Dhe Konvertues",
    "en": "Module Dhe Konvertues",
    "sq": "Module Dhe Konvertues"
  },
  "treco:racks": {
    "mk": "Rack Dhe Aksesorë",
    "en": "Rack Dhe Aksesorë",
    "sq": "Rack dhe aksesorë"
  },
  "treco:optical-tools": {
    "mk": "Vegla Dhe Pajisje Matëse",
    "en": "Vegla Dhe Pajisje Matëse",
    "sq": "Vegla dhe pajisje matëse"
  },
  "treco:installation-tools": {
    "mk": "Vegla Instalimi",
    "en": "Vegla Instalimi",
    "sq": "Vegla Instalimi"
  },
  "treco:video": {
    "mk": "Kamera Dhe Video-Mbikëqyrje",
    "en": "Kamera Dhe Video-Mbikëqyrje",
    "sq": "Kamera dhe video-mbikëqyrje"
  },
  "treco:video-accessories": {
    "mk": "Aksesorë Për Mbikëqyrje",
    "en": "Aksesorë Për Mbikëqyrje",
    "sq": "Aksesorë për mbikëqyrje"
  },
  "treco:ip-cameras": {
    "mk": "Kamera IP",
    "en": "Kamera IP",
    "sq": "Kamera IP"
  },
  "treco:ptz-cameras": {
    "mk": "Kamera PTZ",
    "en": "Kamera PTZ",
    "sq": "Kamera PTZ"
  },
  "treco:wifi-cameras": {
    "mk": "Kamera Wi-Fi Dhe 4G",
    "en": "Kamera Wi-Fi Dhe 4G",
    "sq": "Kamera Wi-Fi Dhe 4G"
  },
  "treco:camera-kits": {
    "mk": "Komplete Me Kamera",
    "en": "Komplete Me Kamera",
    "sq": "Komplete Me Kamera"
  },
  "treco:video-storage": {
    "mk": "Memorie Për Mbikëqyrje",
    "en": "Memorie Për Mbikëqyrje",
    "sq": "Memorie për mbikëqyrje"
  },
  "treco:recorders": {
    "mk": "Regjistrues NVR",
    "en": "Regjistrues NVR",
    "sq": "Regjistrues NVR"
  },
  "treco:access": {
    "mk": "Kontroll Qasjeje Dhe Interfonë",
    "en": "Kontroll Qasjeje Dhe Interfonë",
    "sq": "Kontroll qasjeje dhe interfonë"
  },
  "treco:locks": {
    "mk": "Brava Dhe Aksesorë",
    "en": "Brava Dhe Aksesorë",
    "sq": "Brava dhe aksesorë"
  },
  "treco:attendance": {
    "mk": "Evidencë E Orarit Të Punës",
    "en": "Evidencë E Orarit Të Punës",
    "sq": "Evidencë e orarit të punës"
  },
  "treco:intercoms": {
    "mk": "Interfonë Dhe Video-Interfonë",
    "en": "Interfonë Dhe Video-Interfonë",
    "sq": "Interfonë dhe video-interfonë"
  },
  "treco:readers": {
    "mk": "RFID Dhe Kontroll Qasjeje",
    "en": "RFID Dhe Kontroll Qasjeje",
    "sq": "RFID Dhe Kontroll Qasjeje"
  },
  "treco:network": {
    "mk": "Rrjete Dhe Wi-Fi",
    "en": "Rrjete Dhe Wi-Fi",
    "sq": "Rrjete Dhe Wi-Fi"
  },
  "treco:mobile-network": {
    "mk": "Internet 4G / LTE",
    "en": "Internet 4G / LTE",
    "sq": "Internet 4G / LTE"
  },
  "treco:poe": {
    "mk": "Pajisje Poe",
    "en": "Pajisje Poe",
    "sq": "Pajisje Poe"
  },
  "treco:network-other": {
    "mk": "Pajisje Të Tjera Rrjeti",
    "en": "Pajisje Të Tjera Rrjeti",
    "sq": "Pajisje të tjera rrjeti"
  },
  "treco:access-points": {
    "mk": "Pika Qasjeje",
    "en": "Pika Qasjeje",
    "sq": "Pika Qasjeje"
  },
  "treco:routers": {
    "mk": "Rutera Dhe Pajisje Rrjeti",
    "en": "Rutera Dhe Pajisje Rrjeti",
    "sq": "Rutera Dhe Pajisje Rrjeti"
  },
  "treco:mesh": {
    "mk": "Sisteme Mesh Wi-Fi",
    "en": "Sisteme Mesh Wi-Fi",
    "sq": "Sisteme Mesh Wi-Fi"
  },
  "treco:network-switches": {
    "mk": "Switch Rrjeti",
    "en": "Switch Rrjeti",
    "sq": "Switch Rrjeti"
  },
  "treco:range-extenders": {
    "mk": "Zgjerues Dhe Lidhje Pa Tel",
    "en": "Zgjerues Dhe Lidhje Pa Tel",
    "sq": "Zgjerues Dhe Lidhje Pa Tel"
  },
  "treco:smart": {
    "mk": "Shtëpi E Mençur",
    "en": "Shtëpi E Mençur",
    "sq": "Shtëpi e mençur"
  },
  "treco:smart-switches": {
    "mk": "Çelësa Dhe Ndriçim",
    "en": "Çelësa Dhe Ndriçim",
    "sq": "Çelësa dhe ndriçim"
  },
  "treco:controllers": {
    "mk": "Kontrollues Dhe Telekomanda",
    "en": "Kontrollues Dhe Telekomanda",
    "sq": "Kontrollues Dhe Telekomanda"
  },
  "treco:sockets": {
    "mk": "Priza Të Mençura",
    "en": "Priza Të Mençura",
    "sq": "Priza të mençura"
  },
  "treco:sensors": {
    "mk": "Sensorë Të Mençur",
    "en": "Sensorë Të Mençur",
    "sq": "Sensorë të mençur"
  },
  "treco:it": {
    "mk": "Telefoni, Audio-Video Dhe IT",
    "en": "Telefoni, Audio-Video Dhe IT",
    "sq": "Telefoni, Audio-Video Dhe IT"
  },
  "treco:it-other": {
    "mk": "Aksesorë Të Tjerë",
    "en": "Aksesorë Të Tjerë",
    "sq": "Aksesorë të tjerë"
  },
  "treco:audio-video": {
    "mk": "Audio Dhe Video",
    "en": "Audio Dhe Video",
    "sq": "Audio Dhe Video"
  },
  "treco:storage": {
    "mk": "Ruajtje Dhe NAS",
    "en": "Ruajtje Dhe NAS",
    "sq": "Ruajtje Dhe NAS"
  },
  "treco:business-equipment": {
    "mk": "Skanerë Dhe Pajisje Biznesi",
    "en": "Skanerë Dhe Pajisje Biznesi",
    "sq": "Skanerë dhe pajisje biznesi"
  },
  "treco:ip-telephony": {
    "mk": "Telefoni IP",
    "en": "Telefoni IP",
    "sq": "Telefoni IP"
  },
  "treco:usb-adapters": {
    "mk": "USB Dhe Aksesorë Kompjuteri",
    "en": "USB Dhe Aksesorë Kompjuteri",
    "sq": "USB dhe aksesorë kompjuteri"
  },
  "tremark:готвење": {
    "mk": "Готвење",
    "en": "Cooking",
    "sq": "Gatim"
  },
  "tremark:апарати-за-вафли": {
    "mk": "Апарати за вафли",
    "en": "Waffle makers",
    "sq": "Aparatë për waffle"
  },
  "tremark:апарати-за-ориз": {
    "mk": "Апарати за ориз",
    "en": "Rice cookers",
    "sq": "Aparatë për oriz"
  },
  "tremark:гасни-решоа": {
    "mk": "Гасни решоа",
    "en": "Гасни Решоа",
    "sq": "Гасни Решоа"
  },
  "tremark:експрес-лонци": {
    "mk": "Експрес лонци",
    "en": "Pressure cookers",
    "sq": "Tenxhere me presion"
  },
  "tremark:електрични-печки": {
    "mk": "Електрични печки",
    "en": "Electric ovens",
    "sq": "Furrë elektrike"
  },
  "tremark:електрични-решоа": {
    "mk": "Електрични решоа",
    "en": "Електрични Решоа",
    "sq": "Електрични Решоа"
  },
  "tremark:електрични-тави": {
    "mk": "Електрични тави",
    "en": "Електрични Тави",
    "sq": "Електрични Тави"
  },
  "tremark:класични-фритези": {
    "mk": "Класични фритези",
    "en": "Classic deep fryers",
    "sq": "Friteza klasike"
  },
  "tremark:садови-за-готвење": {
    "mk": "Садови за готвење",
    "en": "Cookware",
    "sq": "Enë gatimi"
  },
  "tremark:скари-и-грил-плочи": {
    "mk": "Скари и грил плочи",
    "en": "Grills and grill plates",
    "sq": "Skarë dhe pllaka grill"
  },
  "tremark:специјализирани-апарати": {
    "mk": "Специјализирани апарати",
    "en": "Specialty appliances",
    "sq": "Aparatë të specializuara"
  },
  "tremark:тостери": {
    "mk": "Тостери",
    "en": "Toasters",
    "sq": "Tostiera"
  },
  "tremark:тостери-за-сендвичи": {
    "mk": "Тостери за сендвичи",
    "en": "Sandwich makers",
    "sq": "Aparatë për sanduiç"
  },
  "tremark:фритези-на-топол-воздух": {
    "mk": "Фритези на топол воздух",
    "en": "Air fryers",
    "sq": "Friteza me ajër të nxehtë"
  },
  "tremark:додатоци": {
    "mk": "Додатоци",
    "en": "Accessories",
    "sq": "Aksesorë"
  },
  "tremark:додатоци-за-лична-нега": {
    "mk": "Додатоци за лична нега",
    "en": "Personal care accessories",
    "sq": "Aksesorë për kujdes personal"
  },
  "tremark:кујнски-додатоци": {
    "mk": "Кујнски додатоци",
    "en": "Кујнски Додатоци",
    "sq": "Кујнски Додатоци"
  },
  "tremark:тв-додатоци": {
    "mk": "ТВ додатоци",
    "en": "TV accessories",
    "sq": "Aksesorë TV"
  },
  "tremark:филтри": {
    "mk": "Филтри",
    "en": "Filters",
    "sq": "Filtra"
  },
  "tremark:дом-и-удобност": {
    "mk": "Дом и удобност",
    "en": "Home and comfort",
    "sq": "Shtëpi dhe rehati"
  },
  "tremark:аудио-уреди": {
    "mk": "Аудио уреди",
    "en": "Audio devices",
    "sq": "Pajisje audio"
  },
  "tremark:вентилатори": {
    "mk": "Вентилатори",
    "en": "Fans",
    "sq": "Ventilatorë"
  },
  "tremark:греалки": {
    "mk": "Греалки",
    "en": "Греалки",
    "sq": "Греалки"
  },
  "tremark:греалки-и-радијатори": {
    "mk": "Греалки и радијатори",
    "en": "Греалки И Радијатори",
    "sq": "Греалки И Радијатори"
  },
  "tremark:електрични-ќебиња": {
    "mk": "Електрични ќебиња",
    "en": "Електрични Ќебиња",
    "sq": "Електрични Ќебиња"
  },
  "tremark:кујнски-ваги": {
    "mk": "Кујнски ваги",
    "en": "Kitchen scales",
    "sq": "Peshore kuzhine"
  },
  "tremark:мини-фрижидери": {
    "mk": "Мини фрижидери",
    "en": "Мини Фрижидери",
    "sq": "Мини Фрижидери"
  },
  "tremark:кафе-и-пијалаци": {
    "mk": "Кафе и пијалаци",
    "en": "Coffee and drinks",
    "sq": "Kafe dhe pije"
  },
  "tremark:апарати-за-кафе": {
    "mk": "Апарати за кафе",
    "en": "Coffee machines",
    "sq": "Aparatë kafeje"
  },
  "tremark:додатоци-за-кафе": {
    "mk": "Додатоци за кафе",
    "en": "Coffee accessories",
    "sq": "Aksesorë kafeje"
  },
  "tremark:електрични-бокали": {
    "mk": "Електрични бокали",
    "en": "Electric kettles",
    "sq": "Kazanë elektrike"
  },
  "tremark:мелници-за-кафе": {
    "mk": "Мелници за кафе",
    "en": "Coffee grinders",
    "sq": "Mulli kafeje"
  },
  "tremark:мока-апарати": {
    "mk": "Мока апарати",
    "en": "Moka pots",
    "sq": "Aparatë moka"
  },
  "tremark:филтрирање-вода": {
    "mk": "Филтрирање вода",
    "en": "Water filtration",
    "sq": "Filtrim uji"
  },
  "tremark:нега-и-здравје": {
    "mk": "Нега и здравје",
    "en": "Care and health",
    "sq": "Kujdes dhe shëndet"
  },
  "tremark:бричење": {
    "mk": "Бричење",
    "en": "Shaving",
    "sq": "Rruajtje"
  },
  "tremark:масажери": {
    "mk": "Масажери",
    "en": "Масажери",
    "sq": "Масажери"
  },
  "tremark:машинки-и-тримери": {
    "mk": "Машинки и тримери",
    "en": "Trimmers and clippers",
    "sq": "Makina rrojeje dhe trimera"
  },
  "tremark:нега-на-коса": {
    "mk": "Нега на коса",
    "en": "Hair care",
    "sq": "Kujdes për flokët"
  },
  "tremark:нега-на-лице-и-нокти": {
    "mk": "Нега на лице и нокти",
    "en": "Нега На Лице И Нокти",
    "sq": "Нега На Лице И Нокти"
  },
  "tremark:телесни-ваги": {
    "mk": "Телесни ваги",
    "en": "Body scales",
    "sq": "Peshore trupore"
  },
  "tremark:пеглање": {
    "mk": "Пеглање",
    "en": "Ironing",
    "sq": "Hekurim"
  },
  "tremark:отстранувачи-на-влакненца": {
    "mk": "Отстранувачи на влакненца",
    "en": "Отстранувачи На Влакненца",
    "sq": "Отстранувачи На Влакненца"
  },
  "tremark:парни-станици": {
    "mk": "Парни станици",
    "en": "Steam stations",
    "sq": "Stacione avulli"
  },
  "tremark:пегли-на-пареа": {
    "mk": "Пегли на пареа",
    "en": "Steam irons",
    "sq": "Hekur avulli"
  },
  "tremark:подготовка-на-храна": {
    "mk": "Подготовка на храна",
    "en": "Food preparation",
    "sq": "Përgatitje ushqimi"
  },
  "tremark:блендери": {
    "mk": "Блендери",
    "en": "Blenders",
    "sq": "Blenderë"
  },
  "tremark:мелници-за-зачини": {
    "mk": "Мелници за зачини",
    "en": "Мелници За Зачини",
    "sq": "Мелници За Зачини"
  },
  "tremark:миксери": {
    "mk": "Миксери",
    "en": "Mixers",
    "sq": "Mikserë"
  },
  "tremark:рачни-блендери": {
    "mk": "Рачни блендери",
    "en": "Hand blenders",
    "sq": "Blenderë dore"
  },
  "tremark:сечкачи": {
    "mk": "Сечкачи",
    "en": "Choppers",
    "sq": "Grirës"
  },
  "tremark:соковници": {
    "mk": "Соковници",
    "en": "Juicers",
    "sq": "Shtrydhëse"
  },
  "tremark:цедалки-за-цитрус": {
    "mk": "Цедалки за цитрус",
    "en": "Citrus juicers",
    "sq": "Shtrydhëse agrumesh"
  },
  "tremark:чистење-на-домот": {
    "mk": "Чистење на домот",
    "en": "Home cleaning",
    "sq": "Pastrim shtëpie"
  },
  "tremark:машини-за-длабинско-чистење": {
    "mk": "Машини за длабинско чистење",
    "en": "Машини За Длабинско Чистење",
    "sq": "Машини За Длабинско Чистење"
  },
  "tremark:правосмукалки": {
    "mk": "Правосмукалки",
    "en": "Vacuum cleaners",
    "sq": "Fshesa me korrent"
  },
  "tremark:чистачи-за-прозорци": {
    "mk": "Чистачи за прозорци",
    "en": "Чистачи За Прозорци",
    "sq": "Чистачи За Прозорци"
  },
  "alevado:lan-cables": {
    "mk": "LAN Кабли",
    "en": "LAN cables",
    "sq": "Kabllot LAN"
  },
  "alevado:data-transmission-cables": {
    "mk": "Кабли за Пренос на Податоци",
    "en": "Data transmission cables",
    "sq": "Kabllot për transmetim të dhënash"
  },
  "alevado:profinet-cables": {
    "mk": "Profinet Кабли",
    "en": "Profinet cables",
    "sq": "Kabllot Profinet"
  },
  "alevado:control-cables": {
    "mk": "Контролни Кабли",
    "en": "Control cables",
    "sq": "Kabllot kontrolli"
  },
  "alevado:alarm-cables": {
    "mk": "Алармни Кабли",
    "en": "Alarm cables",
    "sq": "Kabllot alarmi"
  },
  "alevado:fire-alarm-cables": {
    "mk": "Пожарно дојавни Кабли",
    "en": "Fire alarm cables",
    "sq": "Kabllot alarmi zjarri"
  },
  "alevado:communication-cables": {
    "mk": "Телекомуникациски Кабли",
    "en": "Telecommunication cables",
    "sq": "Kabllot telekomunikacioni"
  },
  "alevado:video-signal-cables": {
    "mk": "Видео Сигнални Кабли",
    "en": "Video signal cables",
    "sq": "Kabllot sinjali video"
  },
  "alevado:power-chain-cables": {
    "mk": "Високо Флексибилни Контролни Кабли (Drag chain cable)",
    "en": "High-flex control cables (drag chain)",
    "sq": "Kabllot kontrolli me fleksibilitet të lartë (drag chain)"
  },
  "alevado:signal-cables": {
    "mk": "Сигнално / Контролни Кабли",
    "en": "Signal / control cables",
    "sq": "Kabllot sinjali / kontrolli"
  },
  "alevado:telephone-cables": {
    "mk": "Телефонски Кабли",
    "en": "Telephone cables",
    "sq": "Kabllot telefonike"
  },
  "alevado:audio-speaker-cables": {
    "mk": "Аудио Кабли",
    "en": "Audio cables",
    "sq": "Kabllot audio"
  },
  "alevado:servomotor-cables": {
    "mk": "Сервомотор Кабли",
    "en": "Servomotor cables",
    "sq": "Kabllot servomotori"
  }
};

export function categorySlugKey(source: Source, slug: string) {
  try {
    return `${source}:${decodeURIComponent(slug)}`;
  } catch {
    return `${source}:${slug}`;
  }
}
