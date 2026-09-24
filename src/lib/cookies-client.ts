export function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : "";
}

function registrableDomainAttribute() {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  if (host === "itsgroup.mk" || host.endsWith(".itsgroup.mk")) {
    return "; Domain=.itsgroup.mk";
  }
  return "";
}

export function setCookie(name: string, value: string, days: number) {
  const maxAge = days * 24 * 60 * 60;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}${registrableDomainAttribute()}`;
}
