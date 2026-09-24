import { site } from "@/lib/site";

/** Office location — Kumanovo (refine coordinates in maps provider if needed). */
export const officeLocation = {
  lat: 42.132,
  lng: 21.7144,
  label: site.address,
};

export function googleMapsSearchUrl() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`;
}

export function openStreetMapEmbedUrl() {
  const { lat, lng } = officeLocation;
  const pad = 0.014;
  const bbox = [lng - pad, lat - pad * 0.72, lng + pad, lat + pad * 0.72].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;
}
