import { site } from "@/lib/site";

/** ITS GROUP store — from Google Maps place listing. */
export const officeLocation = {
  lat: 42.1387382,
  lng: 21.7071799,
  label: site.address,
};

export const STORE_MAP_ID = "store-map";

export function googleMapsPlaceUrl() {
  return site.googleMapsUrl;
}

export function googleMapsSearchUrl() {
  return googleMapsPlaceUrl();
}

export function googleMapsEmbedUrl() {
  const { lat, lng } = officeLocation;
  const place = encodeURIComponent(`ITS Group, ${site.address}`);
  return `https://www.google.com/maps?q=${place}&ll=${lat},${lng}&z=17&hl=mk&output=embed`;
}

/** @deprecated OSM embed — use googleMapsEmbedUrl for pin accuracy */
export function openStreetMapEmbedUrl() {
  const { lat, lng } = officeLocation;
  const padLng = 0.0035;
  const padLat = 0.0025;
  const bbox = [lng - padLng, lat - padLat, lng + padLng, lat + padLat].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
}
