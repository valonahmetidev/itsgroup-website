import type { Locale } from "@/lib/i18n/types";
import type { Source } from "@/lib/types";

export type CategoryLabel = {
  mk: string;
  en: string;
  sq: string;
};

export const categoryTranslations: Record<string, CategoryLabel> = {
  "treco:access-control": {
    "mk": "Контрола на пристап",
    "en": "Access Control",
    "sq": "Kontroll aksesi"
  },
  "treco:ajax-kit": {
    "mk": "Ajax комплет",
    "en": "Ajax Kit",
    "sq": "Komplet Ajax"
  },
  "treco:alarm": {
    "mk": "Аларм",
    "en": "Alarm",
    "sq": "Alarm"
  },
  "treco:barcode-scanner": {
    "mk": "Баркод скенер",
    "en": "Barcode Scanner",
    "sq": "Skaner barkodi"
  },
  "treco:camera-ip-bullet": {
    "mk": "IP bullet камери",
    "en": "Camera IP Bullet",
    "sq": "Kamera IP bullet"
  },
  "treco:bullet-2mp": {
    "mk": "Bullet 2MP",
    "en": "Bullet 2MP",
    "sq": "Bullet 2MP"
  },
  "treco:bullet-4mp": {
    "mk": "Bullet 4MP",
    "en": "Bullet 4MP",
    "sq": "Bullet 4MP"
  },
  "treco:bullet-5mp": {
    "mk": "Bullet 5MP",
    "en": "Bullet 5MP",
    "sq": "Bullet 5MP"
  },
  "treco:bullet-8mp": {
    "mk": "Bullet 8MP",
    "en": "Bullet 8MP",
    "sq": "Bullet 8MP"
  },
  "treco:camera-ip-dome": {
    "mk": "IP dome камери",
    "en": "Camera IP Dome",
    "sq": "Kamera IP dome"
  },
  "treco:dome-2mp": {
    "mk": "Dome 2MP",
    "en": "Dome 2MP",
    "sq": "Dome 2MP"
  },
  "treco:dome-4mp": {
    "mk": "Dome 4MP",
    "en": "Dome 4MP",
    "sq": "Dome 4MP"
  },
  "treco:dome-5mp": {
    "mk": "Dome 5MP",
    "en": "Dome 5MP",
    "sq": "Dome 5MP"
  },
  "treco:dome-8mp": {
    "mk": "Dome 8MP",
    "en": "Dome 8MP",
    "sq": "Dome 8MP"
  },
  "treco:camera-ip-nvr-s": {
    "mk": "IP камери со NVR",
    "en": "Camera IP NVR-S",
    "sq": "Kamera IP me NVR"
  },
  "treco:nvr-5ch-10ch": {
    "mk": "NVR ( 5ch-10ch)",
    "en": "NVR ( 5ch-10ch)",
    "sq": "NVR ( 5ch-10ch)"
  },
  "treco:nvr-20ch": {
    "mk": "NVR 20ch+",
    "en": "NVR 20ch+",
    "sq": "NVR 20ch+"
  },
  "treco:nvr-40ch": {
    "mk": "NVR 40ch+",
    "en": "NVR 40ch+",
    "sq": "NVR 40ch+"
  },
  "treco:nvr-80ch": {
    "mk": "NVR 80ch+",
    "en": "NVR 80ch+",
    "sq": "NVR 80ch+"
  },
  "treco:camera-ptz": {
    "mk": "PTZ камери",
    "en": "Camera PTZ",
    "sq": "Kamera PTZ"
  },
  "treco:speed-dome-pro-aew": {
    "mk": "Speed Dome Pro AEW",
    "en": "Speed Dome Pro AEW",
    "sq": "Speed Dome Pro AEW"
  },
  "treco:speed-dome-pro-panorama": {
    "mk": "Speed Dome Pro Panorama",
    "en": "Speed Dome Pro Panorama",
    "sq": "Speed Dome Pro Panorama"
  },
  "treco:speed-dome-pro-smd": {
    "mk": "Speed Dome Pro SMD",
    "en": "Speed Dome Pro SMD",
    "sq": "Speed Dome Pro SMD"
  },
  "treco:speed-dome-pro-thermal": {
    "mk": "Speed Dome Pro Thermal",
    "en": "Speed Dome Pro Thermal",
    "sq": "Speed Dome Pro Thermal"
  },
  "treco:speed-dome-pro-turbo-ai": {
    "mk": "Speed Dome Pro Turbo AI",
    "en": "Speed Dome Pro Turbo AI",
    "sq": "Speed Dome Pro Turbo AI"
  },
  "treco:chargers-cudy": {
    "mk": "Полначи - Cudy",
    "en": "Chargers - Cudy",
    "sq": "Karikues - Cudy"
  },
  "treco:cudy": {
    "mk": "Cudy",
    "en": "Cudy",
    "sq": "Cudy"
  },
  "treco:docks-hub-cudy": {
    "mk": "Docks & Hub - Cudy",
    "en": "Docks & Hub - Cudy",
    "sq": "Docks & Hub - Cudy"
  },
  "treco:industrial-switch-cudy": {
    "mk": "Industrial Switch - Cudy",
    "en": "Industrial Switch - Cudy",
    "sq": "Industrial Switch - Cudy"
  },
  "treco:lte-products-cudy": {
    "mk": "LTE Products - Cudy",
    "en": "LTE Products - Cudy",
    "sq": "LTE Products - Cudy"
  },
  "treco:managed-switches-cudy": {
    "mk": "Managed Switches - Cudy",
    "en": "Managed Switches - Cudy",
    "sq": "Managed Switches - Cudy"
  },
  "treco:mesh-system": {
    "mk": "MESH System",
    "en": "MESH System",
    "sq": "MESH System"
  },
  "treco:poe-accessories-cudy": {
    "mk": "Poe Accessories - Cudy",
    "en": "Poe Accessories - Cudy",
    "sq": "Poe Accessories - Cudy"
  },
  "treco:poe-switch-cudy": {
    "mk": "POE SWITCH - Cudy",
    "en": "POE SWITCH - Cudy",
    "sq": "POE SWITCH - Cudy"
  },
  "treco:range-extenders-cudy": {
    "mk": "Range Extenders - Cudy",
    "en": "Range Extenders - Cudy",
    "sq": "Range Extenders - Cudy"
  },
  "treco:sfp-modules-cudy": {
    "mk": "SFP Modules",
    "en": "SFP Modules",
    "sq": "SFP Modules"
  },
  "treco:switches-cudy": {
    "mk": "Switches - Cudy",
    "en": "Switches - Cudy",
    "sq": "Switches - Cudy"
  },
  "treco:usb-wireless-cudy": {
    "mk": "Usb Wireless - Cudy",
    "en": "Usb Wireless - Cudy",
    "sq": "Usb Wireless - Cudy"
  },
  "treco:wireless-routers-cudy": {
    "mk": "Wireless Routers - CUDY",
    "en": "Wireless Routers - CUDY",
    "sq": "Wireless Routers - CUDY"
  },
  "treco:display-video-adapters": {
    "mk": "Display и видео адаптери",
    "en": "Display & Video Adapters",
    "sq": "Adapterë display dhe video"
  },
  "treco:door-entry-system": {
    "mk": "Систем за влезна врата",
    "en": "Door Entry System",
    "sq": "Sistem hyrjeje"
  },
  "treco:electric-lock": {
    "mk": "Електрична брава",
    "en": "Electric Lock",
    "sq": "Bravë elektrike"
  },
  "treco:exit-button": {
    "mk": "Копче за излез",
    "en": "Exit Button",
    "sq": "Buton daljeje"
  },
  "treco:fanvil": {
    "mk": "Fanvil",
    "en": "Fanvil",
    "sq": "Fanvil"
  },
  "treco:audio-and-video-intercom": {
    "mk": "Audio And Video Intercom",
    "en": "Audio And Video Intercom",
    "sq": "Audio And Video Intercom"
  },
  "treco:audio-intercom": {
    "mk": "Audio Intercom",
    "en": "Audio Intercom",
    "sq": "Audio Intercom"
  },
  "treco:door-phone": {
    "mk": "Door Phone",
    "en": "Door Phone",
    "sq": "Door Phone"
  },
  "treco:intercom": {
    "mk": "Intercom",
    "en": "Intercom",
    "sq": "Intercom"
  },
  "treco:ip-phones": {
    "mk": "IP Phones",
    "en": "IP Phones",
    "sq": "IP Phones"
  },
  "treco:outdoor-sip-video-intercom": {
    "mk": "Outdoor SIP Video Intercom",
    "en": "Outdoor SIP Video Intercom",
    "sq": "Outdoor SIP Video Intercom"
  },
  "treco:sip-indoor-stations": {
    "mk": "SIP Indoor Stations",
    "en": "SIP Indoor Stations",
    "sq": "SIP Indoor Stations"
  },
  "treco:video-intercom-paging-gateway": {
    "mk": "Video Intercom & Paging Gateway",
    "en": "Video Intercom & Paging Gateway",
    "sq": "Video Intercom & Paging Gateway"
  },
  "treco:fiber-optics": {
    "mk": "Оптички кабли",
    "en": "Fiber Optics",
    "sq": "Fibra optike"
  },
  "treco:clamps": {
    "mk": "Clamps",
    "en": "Clamps",
    "sq": "Clamps"
  },
  "treco:fiber-media-converter": {
    "mk": "Fiber Media Converter",
    "en": "Fiber Media Converter",
    "sq": "Fiber Media Converter"
  },
  "treco:fiber-optic-adapters": {
    "mk": "Fiber Optic Adapters",
    "en": "Fiber Optic Adapters",
    "sq": "Fiber Optic Adapters"
  },
  "treco:fiber-optic-cables": {
    "mk": "Fiber Optic Cables",
    "en": "Fiber Optic Cables",
    "sq": "Fiber Optic Cables"
  },
  "treco:fiber-optic-drop-cable": {
    "mk": "Fiber Optic Drop Cable",
    "en": "Fiber Optic Drop Cable",
    "sq": "Fiber Optic Drop Cable"
  },
  "treco:fiber-optics-cable": {
    "mk": "Fiber Optics Cable",
    "en": "Fiber Optics Cable",
    "sq": "Fiber Optics Cable"
  },
  "treco:fiber-optic-cleaners": {
    "mk": "Fiber Optic Cleaners",
    "en": "Fiber Optic Cleaners",
    "sq": "Fiber Optic Cleaners"
  },
  "treco:fiber-cleaner-kit": {
    "mk": "Fiber Cleaner Kit",
    "en": "Fiber Cleaner Kit",
    "sq": "Fiber Cleaner Kit"
  },
  "treco:pen-cleaners": {
    "mk": "Pen Cleaners",
    "en": "Pen Cleaners",
    "sq": "Pen Cleaners"
  },
  "treco:fiber-optic-connector": {
    "mk": "Fiber Optic Connector",
    "en": "Fiber Optic Connector",
    "sq": "Fiber Optic Connector"
  },
  "treco:fiber-optic-distribution-box": {
    "mk": "Fiber Optic Distribution Box",
    "en": "Fiber Optic Distribution Box",
    "sq": "Fiber Optic Distribution Box"
  },
  "treco:fiber-optic-drop-cable-fiber-optics": {
    "mk": "Fiber Optic Drop Cable",
    "en": "Fiber Optic Drop Cable",
    "sq": "Fiber Optic Drop Cable"
  },
  "treco:fiber-optic-tool-kit-splicer": {
    "mk": "Fiber Optic Tool Kit & Splicer",
    "en": "Fiber Optic Tool Kit & Splicer",
    "sq": "Fiber Optic Tool Kit & Splicer"
  },
  "treco:fiber-cleavers": {
    "mk": "Fiber Cleavers",
    "en": "Fiber Cleavers",
    "sq": "Fiber Cleavers"
  },
  "treco:fiber-slitters": {
    "mk": "Fiber Slitters",
    "en": "Fiber Slitters",
    "sq": "Fiber Slitters"
  },
  "treco:fiber-splicer": {
    "mk": "Fiber Splicer",
    "en": "Fiber Splicer",
    "sq": "Fiber Splicer"
  },
  "treco:fiber-stripper": {
    "mk": "Fiber Stripper",
    "en": "Fiber Stripper",
    "sq": "Fiber Stripper"
  },
  "treco:fiber-tool-kits": {
    "mk": "Fiber Tool Kits",
    "en": "Fiber Tool Kits",
    "sq": "Fiber Tool Kits"
  },
  "treco:fiber-optics-cable-fiber-optics": {
    "mk": "Fiber Optics Cable",
    "en": "Fiber Optics Cable",
    "sq": "Fiber Optics Cable"
  },
  "treco:fiber-patch-cord": {
    "mk": "Fiber Patch Cord",
    "en": "Fiber Patch Cord",
    "sq": "Fiber Patch Cord"
  },
  "treco:om3-multimode-patch-cord": {
    "mk": "OM3 Multimode Patch Cord",
    "en": "OM3 Multimode Patch Cord",
    "sq": "OM3 Multimode Patch Cord"
  },
  "treco:single-mode-patch-cord": {
    "mk": "Single Mode Patch Cord",
    "en": "Single Mode Patch Cord",
    "sq": "Single Mode Patch Cord"
  },
  "treco:fiber-patch-panel-fiber-optics": {
    "mk": "Fiber Patch Panel",
    "en": "Fiber Patch Panel",
    "sq": "Fiber Patch Panel"
  },
  "treco:fiber-testers": {
    "mk": "Fiber Testers",
    "en": "Fiber Testers",
    "sq": "Fiber Testers"
  },
  "treco:fault-locators": {
    "mk": "Fault Locators",
    "en": "Fault Locators",
    "sq": "Fault Locators"
  },
  "treco:otdr": {
    "mk": "OTDR",
    "en": "OTDR",
    "sq": "OTDR"
  },
  "treco:powermeters": {
    "mk": "Powermeters",
    "en": "Powermeters",
    "sq": "Powermeters"
  },
  "treco:media-converter": {
    "mk": "Media Converter",
    "en": "Media Converter",
    "sq": "Media Converter"
  },
  "treco:olt": {
    "mk": "OLT",
    "en": "OLT",
    "sq": "OLT"
  },
  "treco:pigtails": {
    "mk": "Pigtails",
    "en": "Pigtails",
    "sq": "Pigtails"
  },
  "treco:sfp-modules": {
    "mk": "SFP Modules",
    "en": "SFP Modules",
    "sq": "SFP Modules"
  },
  "treco:splice-closures-trays-and-modules": {
    "mk": "Splice Closures, Trays And Modules",
    "en": "Splice Closures, Trays And Modules",
    "sq": "Splice Closures, Trays And Modules"
  },
  "treco:splitters": {
    "mk": "Splitters",
    "en": "Splitters",
    "sq": "Splitters"
  },
  "treco:gaming-monitor": {
    "mk": "Гејминг монитор",
    "en": "Gaming Monitor",
    "sq": "Monitor gaming"
  },
  "treco:hdmi-cables-accessories": {
    "mk": "HDMI кабли и додатоци",
    "en": "HDMI Cables & Accessories",
    "sq": "Kabllot HDMI dhe aksesorë"
  },
  "treco:display-port-cables": {
    "mk": "Display Port Cables",
    "en": "Display Port Cables",
    "sq": "Display Port Cables"
  },
  "treco:fiberhdmi": {
    "mk": "Fiberhdmi",
    "en": "Fiberhdmi",
    "sq": "Fiberhdmi"
  },
  "treco:hdmi-adapters": {
    "mk": "HDMI Adapters",
    "en": "HDMI Adapters",
    "sq": "HDMI Adapters"
  },
  "treco:hdmi-cables": {
    "mk": "HDMI Cables",
    "en": "HDMI Cables",
    "sq": "HDMI Cables"
  },
  "treco:hdmi-extender": {
    "mk": "HDMI Extender",
    "en": "HDMI Extender",
    "sq": "HDMI Extender"
  },
  "treco:hdmi-splitter-switch": {
    "mk": "HDMI Splitter & Switch",
    "en": "HDMI Splitter & Switch",
    "sq": "HDMI Splitter & Switch"
  },
  "treco:hdmi-wireless-extender": {
    "mk": "HDMI Wireless Extender",
    "en": "HDMI Wireless Extender",
    "sq": "HDMI Wireless Extender"
  },
  "treco:video-converters": {
    "mk": "Video Converters",
    "en": "Video Converters",
    "sq": "Video Converters"
  },
  "treco:home-solution": {
    "mk": "Домашно решение",
    "en": "Home Solution",
    "sq": "Zgjidhje shtëpiake"
  },
  "treco:invertor-sisteme-solare": {
    "mk": "Инвертори и соларни системи",
    "en": "Invertor & Sisteme Solare",
    "sq": "Invertorë dhe sisteme diellore"
  },
  "treco:bateri-per-invertor": {
    "mk": "Bateri Per Invertor",
    "en": "Bateri Per Invertor",
    "sq": "Bateri Per Invertor"
  },
  "treco:invertor-solar": {
    "mk": "Соларни инвертори",
    "en": "Invertor Solar",
    "sq": "Invertorë diellorë"
  },
  "treco:kamera-sigurie": {
    "mk": "Камери за безбедност",
    "en": "Kamera Sigurie",
    "sq": "Kamera sigurie"
  },
  "treco:microsd": {
    "mk": "Microsd",
    "en": "Microsd",
    "sq": "Microsd"
  },
  "treco:ptz-camera": {
    "mk": "PTZ Camera",
    "en": "PTZ Camera",
    "sq": "PTZ Camera"
  },
  "treco:tiandy-monitors": {
    "mk": "Tiandy Monitors",
    "en": "Tiandy Monitors",
    "sq": "Tiandy Monitors"
  },
  "treco:tiandy-poe-switch-kamera-sigurie": {
    "mk": "Tiandy POE Switch",
    "en": "Tiandy POE Switch",
    "sq": "Tiandy POE Switch"
  },
  "treco:microphone-wireless-system": {
    "mk": "Безжичен микрофонски систем",
    "en": "Microphone Wireless System",
    "sq": "Sistem mikrofoni pa tela"
  },
  "treco:mikrotik": {
    "mk": "MikroTik",
    "en": "Mikrotik",
    "sq": "MikroTik"
  },
  "treco:accessories-mikrotik": {
    "mk": "Accessories - Mikrotik",
    "en": "Accessories - Mikrotik",
    "sq": "Accessories - Mikrotik"
  },
  "treco:ethernet-routers-mikrotik": {
    "mk": "Ethernet Routers - Mikrotik",
    "en": "Ethernet Routers - Mikrotik",
    "sq": "Ethernet Routers - Mikrotik"
  },
  "treco:sfp-qsfp-mikrotik": {
    "mk": "SFP/QSFP - Mikrotik",
    "en": "SFP/QSFP - Mikrotik",
    "sq": "SFP/QSFP - Mikrotik"
  },
  "treco:switches-mikrotik": {
    "mk": "Switches - Mikrotik",
    "en": "Switches - Mikrotik",
    "sq": "Switches - Mikrotik"
  },
  "treco:wireless-for-home-and-office-mikrotik": {
    "mk": "Wireless For Home And Office - Mikrotik",
    "en": "Wireless For Home And Office - Mikrotik",
    "sq": "Wireless For Home And Office - Mikrotik"
  },
  "treco:wireless-systems-mikrotik": {
    "mk": "Wireless Systems - Mikrotik",
    "en": "Wireless Systems - Mikrotik",
    "sq": "Wireless Systems - Mikrotik"
  },
  "treco:network-storage-nas": {
    "mk": "Мрежно складирање (NAS)",
    "en": "Network Storage (nas)",
    "sq": "Ruajtje në rrjet (NAS)"
  },
  "treco:office-solution": {
    "mk": "Офис решение",
    "en": "Office Solution",
    "sq": "Zgjidhje zyre"
  },
  "treco:rfid-card": {
    "mk": "RFID картички",
    "en": "RFID Card",
    "sq": "Kartela RFID"
  },
  "treco:rfid-reader": {
    "mk": "RFID читач",
    "en": "RFID Reader",
    "sq": "Lexues RFID"
  },
  "treco:satelite-reciver": {
    "mk": "Satellite Receiver",
    "en": "Satellite Receiver",
    "sq": "Satellite Receiver"
  },
  "treco:sound-system": {
    "mk": "Звучен систем",
    "en": "Sound System",
    "sq": "Sistem audio"
  },
  "treco:switch-poe": {
    "mk": "SWITCH POE",
    "en": "SWITCH POE",
    "sq": "SWITCH POE"
  },
  "treco:tiandy": {
    "mk": "Tiandy",
    "en": "Tiandy",
    "sq": "Tiandy"
  },
  "treco:ak-series-2mp": {
    "mk": "AK Series (2mp)",
    "en": "AK Series (2mp)",
    "sq": "AK Series (2mp)"
  },
  "treco:camera-mounts-tiandy": {
    "mk": "Camera Mounts - Tiandy",
    "en": "Camera Mounts - Tiandy",
    "sq": "Camera Mounts - Tiandy"
  },
  "treco:cms-decoder": {
    "mk": "CMS Decoder",
    "en": "CMS Decoder",
    "sq": "CMS Decoder"
  },
  "treco:cms-server": {
    "mk": "CMS Server",
    "en": "CMS Server",
    "sq": "CMS Server"
  },
  "treco:coaxial-ip-camera-tester": {
    "mk": "Coaxial & IP Camera Tester",
    "en": "Coaxial & IP Camera Tester",
    "sq": "Coaxial & IP Camera Tester"
  },
  "treco:hdds": {
    "mk": "Hdds",
    "en": "Hdds",
    "sq": "Hdds"
  },
  "treco:lite": {
    "mk": "Lite",
    "en": "Lite",
    "sq": "Lite"
  },
  "treco:lite-2mp": {
    "mk": "Lite 2MP",
    "en": "Lite 2MP",
    "sq": "Lite 2MP"
  },
  "treco:lite-4mp": {
    "mk": "Lite 4MP",
    "en": "Lite 4MP",
    "sq": "Lite 4MP"
  },
  "treco:lite-5mp": {
    "mk": "Lite 5MP",
    "en": "Lite 5MP",
    "sq": "Lite 5MP"
  },
  "treco:lite-8mp": {
    "mk": "Lite 8MP",
    "en": "Lite 8MP",
    "sq": "Lite 8MP"
  },
  "treco:nvr-ai": {
    "mk": "NVR AI",
    "en": "NVR AI",
    "sq": "NVR AI"
  },
  "treco:nvr-lite": {
    "mk": "NVR Lite",
    "en": "NVR Lite",
    "sq": "NVR Lite"
  },
  "treco:nvr-pro": {
    "mk": "NVR PRO",
    "en": "NVR PRO",
    "sq": "NVR PRO"
  },
  "treco:nvr-pse": {
    "mk": "NVR PSE",
    "en": "NVR PSE",
    "sq": "NVR PSE"
  },
  "treco:nvr-spark": {
    "mk": "NVR Spark",
    "en": "NVR Spark",
    "sq": "NVR Spark"
  },
  "treco:pro-series": {
    "mk": "Pro Series",
    "en": "Pro Series",
    "sq": "Pro Series"
  },
  "treco:pro-series-2mp": {
    "mk": "Pro Series 2MP",
    "en": "Pro Series 2MP",
    "sq": "Pro Series 2MP"
  },
  "treco:pro-series-4mp": {
    "mk": "Pro Series 4MP",
    "en": "Pro Series 4MP",
    "sq": "Pro Series 4MP"
  },
  "treco:pro-series-5mp": {
    "mk": "Pro Series 5MP",
    "en": "Pro Series 5MP",
    "sq": "Pro Series 5MP"
  },
  "treco:pro-series-8mp": {
    "mk": "Pro Series 8MP",
    "en": "Pro Series 8MP",
    "sq": "Pro Series 8MP"
  },
  "treco:solar-camera": {
    "mk": "Solar Camera",
    "en": "Solar Camera",
    "sq": "Solar Camera"
  },
  "treco:spark": {
    "mk": "Spark",
    "en": "Spark",
    "sq": "Spark"
  },
  "treco:spark-2mp": {
    "mk": "Spark 2MP",
    "en": "Spark 2MP",
    "sq": "Spark 2MP"
  },
  "treco:spark-4mp": {
    "mk": "Spark 4MP",
    "en": "Spark 4MP",
    "sq": "Spark 4MP"
  },
  "treco:superlite": {
    "mk": "Superlite",
    "en": "Superlite",
    "sq": "Superlite"
  },
  "treco:superlite-2mp": {
    "mk": "Superlite 2MP",
    "en": "Superlite 2MP",
    "sq": "Superlite 2MP"
  },
  "treco:superlite-4mp": {
    "mk": "Superlite 4MP",
    "en": "Superlite 4MP",
    "sq": "Superlite 4MP"
  },
  "treco:tiandy-camera-set": {
    "mk": "Tiandy Camera Set",
    "en": "Tiandy Camera Set",
    "sq": "Tiandy Camera Set"
  },
  "treco:tiandy-nvr": {
    "mk": "Tiandy NVR",
    "en": "Tiandy NVR",
    "sq": "Tiandy NVR"
  },
  "treco:tiandy-poe-switch": {
    "mk": "Tiandy Poe Switch",
    "en": "Tiandy Poe Switch",
    "sq": "Tiandy Poe Switch"
  },
  "treco:tiandy-ptz-camera": {
    "mk": "Tiandy PTZ Camera",
    "en": "Tiandy PTZ Camera",
    "sq": "Tiandy PTZ Camera"
  },
  "treco:tiandy-wifi-camera": {
    "mk": "Tiandy WIFI Camera",
    "en": "Tiandy WIFI Camera",
    "sq": "Tiandy WIFI Camera"
  },
  "treco:time-attendance": {
    "mk": "Евиденција на работно време",
    "en": "Time Attendance",
    "sq": "Regjistrim i kohës"
  },
  "treco:ubiquiti": {
    "mk": "Ubiquiti",
    "en": "Ubiquiti",
    "sq": "Ubiquiti"
  },
  "treco:unifi": {
    "mk": "Unifi",
    "en": "Unifi",
    "sq": "Unifi"
  },
  "treco:access-point-unifi": {
    "mk": "Access Point - Unifi",
    "en": "Access Point - Unifi",
    "sq": "Access Point - Unifi"
  },
  "treco:gateway-unifi": {
    "mk": "Gateway - Unifi",
    "en": "Gateway - Unifi",
    "sq": "Gateway - Unifi"
  },
  "treco:poe-adapters-unifi": {
    "mk": "Poe Adapters - Unifi",
    "en": "Poe Adapters - Unifi",
    "sq": "Poe Adapters - Unifi"
  },
  "treco:sfp-modules-unifi": {
    "mk": "SFP Modules - Unifi",
    "en": "SFP Modules - Unifi",
    "sq": "SFP Modules - Unifi"
  },
  "treco:switches-with-poe-unifi": {
    "mk": "Switches With Poe - Unifi",
    "en": "Switches With Poe - Unifi",
    "sq": "Switches With Poe - Unifi"
  },
  "treco:switches-without-poe-unifi": {
    "mk": "Switches Without Poe - Unifi",
    "en": "Switches Without Poe - Unifi",
    "sq": "Switches Without Poe - Unifi"
  },
  "treco:uncategorized": {
    "mk": "Uncategorized",
    "en": "Uncategorized",
    "sq": "Uncategorized"
  },
  "treco:unmanaged-switch": {
    "mk": "Unmanaged Switch",
    "en": "Unmanaged Switch",
    "sq": "Unmanaged Switch"
  },
  "treco:unmistakable-switch": {
    "mk": "Managed Switch",
    "en": "Managed Switch",
    "sq": "Managed Switch"
  },
  "treco:usb-hubs": {
    "mk": "USB Hubs",
    "en": "USB Hubs",
    "sq": "USB Hubs"
  },
  "treco:wireless": {
    "mk": "Безжично",
    "en": "Wireless",
    "sq": "Pa tela"
  },
  "treco:lte-products": {
    "mk": "LTE Products",
    "en": "LTE Products",
    "sq": "LTE Products"
  },
  "treco:range-extenders": {
    "mk": "Range Extenders",
    "en": "Range Extenders",
    "sq": "Range Extenders"
  },
  "treco:zoneai": {
    "mk": "Zoneai",
    "en": "Zoneai",
    "sq": "Zoneai"
  },
  "treco:dmtech-fire-alarm": {
    "mk": "Аларм за пожар (DMTech Fire Alarm)",
    "en": "Fire alarm (DMTech)",
    "sq": "Alarm zjarri (DMTech)"
  },
  "treco:conventional-fire-panels": {
    "mk": "Conventional Fire Panels",
    "en": "Conventional Fire Panels",
    "sq": "Conventional Fire Panels"
  },
  "treco:network-accessories": {
    "mk": "Мрежа, алати, кабли",
    "en": "Network tools and cables",
    "sq": "Rrjet, vegla dhe kabllo"
  },
  "treco:coaxial-cable-accessories": {
    "mk": "Coaxial Cable & Accessories",
    "en": "Coaxial Cable & Accessories",
    "sq": "Coaxial Cable & Accessories"
  },
  "treco:crimping-tool-coaxial": {
    "mk": "Crimping Tool - Coaxial",
    "en": "Crimping Tool - Coaxial",
    "sq": "Crimping Tool - Coaxial"
  },
  "treco:patch-panel-modular-konektor-rj45": {
    "mk": "Patch Panel, Modular & Konektor RJ45",
    "en": "Patch Panel, Modular & Konektor RJ45",
    "sq": "Patch Panel, Modular & Konektor RJ45"
  },
  "treco:konektor-rj45": {
    "mk": "Konektor RJ45",
    "en": "Konektor RJ45",
    "sq": "Konektor RJ45"
  },
  "treco:modular": {
    "mk": "Modular",
    "en": "Modular",
    "sq": "Modular"
  },
  "treco:outle-and-face-plate": {
    "mk": "Outle And Face Plate",
    "en": "Outle And Face Plate",
    "sq": "Outle And Face Plate"
  },
  "treco:patch-panel": {
    "mk": "Patch Panel",
    "en": "Patch Panel",
    "sq": "Patch Panel"
  },
  "treco:telephonevoice-patch-panel": {
    "mk": "Telephone(voice) Patch Panel",
    "en": "Telephone(voice) Patch Panel",
    "sq": "Telephone(voice) Patch Panel"
  },
  "treco:rack-cabinets": {
    "mk": "Rack Cabinets",
    "en": "Rack Cabinets",
    "sq": "Rack Cabinets"
  },
  "treco:rack-cabinets-accessories": {
    "mk": "Rack Cabinets Accessories",
    "en": "Rack Cabinets Accessories",
    "sq": "Rack Cabinets Accessories"
  },
  "treco:cage-nuts": {
    "mk": "Cage Nuts",
    "en": "Cage Nuts",
    "sq": "Cage Nuts"
  },
  "treco:fan-trays-fan-unit": {
    "mk": "Fan Trays & Fan Unit",
    "en": "Fan Trays & Fan Unit",
    "sq": "Fan Trays & Fan Unit"
  },
  "treco:metal-plastic-cable-managment": {
    "mk": "Metal & Plastic Cable Management",
    "en": "Metal & Plastic Cable Management",
    "sq": "Metal & Plastic Cable Management"
  },
  "treco:pdu-electric-extension-cord-for-rack-cabinet": {
    "mk": "PDU - Electric Extension Cord For Rack-Cabinet",
    "en": "PDU - Electric Extension Cord For Rack-Cabinet",
    "sq": "PDU - Electric Extension Cord For Rack-Cabinet"
  },
  "treco:shelfs": {
    "mk": "Shelfs",
    "en": "Shelfs",
    "sq": "Shelfs"
  },
  "treco:small-rack": {
    "mk": "Small Rack",
    "en": "Small Rack",
    "sq": "Small Rack"
  },
  "treco:floor-standing-network-cabinet": {
    "mk": "Rack сервер кабинет",
    "en": "Rack Сервер Кабинет",
    "sq": "Rack Сервер Кабинет"
  },
  "treco:wall-mounted-cabinet": {
    "mk": "Ѕиден мрежен кабинет",
    "en": "Ѕиден Мрежен Кабинет",
    "sq": "Ѕиден Мрежен Кабинет"
  },
  "treco:ethernet-cable": {
    "mk": "Кабелски етернет",
    "en": "Кабелски Етернет",
    "sq": "Кабелски Етернет"
  },
  "treco:ethernet-patch-cord": {
    "mk": "Кабелски етернет ( Patch Cord)",
    "en": "Кабелски Етернет ( Patch Cord)",
    "sq": "Кабелски Етернет ( Patch Cord)"
  },
  "treco:networking-tools": {
    "mk": "Мрежни алатки",
    "en": "Мрежни Алатки",
    "sq": "Мрежни Алатки"
  },
  "treco:smart-home": {
    "mk": "Паметен дом",
    "en": "Smart home",
    "sq": "Shtëpi inteligjente"
  },
  "treco:control-panel": {
    "mk": "Control Panel",
    "en": "Control Panel",
    "sq": "Control Panel"
  },
  "treco:light-switches": {
    "mk": "Light Switches",
    "en": "Light Switches",
    "sq": "Light Switches"
  },
  "treco:sensors": {
    "mk": "Sensors",
    "en": "Sensors",
    "sq": "Sensors"
  },
  "treco:smart-circuit-breaker": {
    "mk": "Smart Circuit Breaker",
    "en": "Smart Circuit Breaker",
    "sq": "Smart Circuit Breaker"
  },
  "treco:smart-ir-remote": {
    "mk": "Smart IR Remote",
    "en": "Smart IR Remote",
    "sq": "Smart IR Remote"
  },
  "treco:smart-light": {
    "mk": "Smart Light",
    "en": "Smart Light",
    "sq": "Smart Light"
  },
  "treco:smart-plugs": {
    "mk": "Smart Plugs",
    "en": "Smart Plugs",
    "sq": "Smart Plugs"
  },
  "treco:smart-switch": {
    "mk": "Smart Switch",
    "en": "Smart Switch",
    "sq": "Smart Switch"
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
  "tremark:кујнски-ваги": {
    "mk": "Кујнски ваги",
    "en": "Kitchen scales",
    "sq": "Peshore kuzhine"
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
  "tremark:машинки-и-тримери": {
    "mk": "Машинки и тримери",
    "en": "Trimmers and clippers",
    "sq": "Makina rrojeje dhe trimera"
  },
  "tremark:мерачи-за-крвен-притисок": {
    "mk": "Мерачи за крвен притисок",
    "en": "Blood pressure monitors",
    "sq": "Matës tensioni"
  },
  "tremark:нега-на-коса": {
    "mk": "Нега на коса",
    "en": "Hair care",
    "sq": "Kujdes për flokët"
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
  "tremark:правосмукалки": {
    "mk": "Правосмукалки",
    "en": "Vacuum cleaners",
    "sq": "Fshesa me korrent"
  },
  "alevado:lan-cables": {
    "mk": "Lan Cables",
    "en": "Lan Cables",
    "sq": "Lan Cables"
  },
  "alevado:data-transmission-cables": {
    "mk": "Data Transmission Cables",
    "en": "Data Transmission Cables",
    "sq": "Data Transmission Cables"
  },
  "alevado:profinet-cables": {
    "mk": "Profinet Cables",
    "en": "Profinet Cables",
    "sq": "Profinet Cables"
  },
  "alevado:control-cables": {
    "mk": "Control Cables",
    "en": "Control Cables",
    "sq": "Control Cables"
  },
  "alevado:alarm-cables": {
    "mk": "Alarm Cables",
    "en": "Alarm Cables",
    "sq": "Alarm Cables"
  },
  "alevado:fire-alarm-cables": {
    "mk": "Fire Alarm Cables",
    "en": "Fire Alarm Cables",
    "sq": "Fire Alarm Cables"
  },
  "alevado:communication-cables": {
    "mk": "Communication Cables",
    "en": "Communication Cables",
    "sq": "Communication Cables"
  },
  "alevado:video-signal-cables": {
    "mk": "Video Signal Cables",
    "en": "Video Signal Cables",
    "sq": "Video Signal Cables"
  },
  "alevado:power-chain-cables": {
    "mk": "Power Chain Cables",
    "en": "Power Chain Cables",
    "sq": "Power Chain Cables"
  },
  "alevado:signal-cables": {
    "mk": "Signal Cables",
    "en": "Signal Cables",
    "sq": "Signal Cables"
  },
  "alevado:telephone-cables": {
    "mk": "Telephone Cables",
    "en": "Telephone Cables",
    "sq": "Telephone Cables"
  },
  "alevado:audio-speaker-cables": {
    "mk": "Audio Speaker Cables",
    "en": "Audio Speaker Cables",
    "sq": "Audio Speaker Cables"
  },
  "alevado:servomotor-cables": {
    "mk": "Servomotor Cables",
    "en": "Servomotor Cables",
    "sq": "Servomotor Cables"
  }
};

export function categorySlugKey(source: Source, slug: string) {
  try {
    return `${source}:${decodeURIComponent(slug)}`;
  } catch {
    return `${source}:${slug}`;
  }
}
