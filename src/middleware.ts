import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AI_CRAWLER_UA =
  /GPTBot|ChatGPT-User|OAI-SearchBot|ClaudeBot|anthropic-ai|Bytespider|CCBot|Google-Extended/i;

function isCatalogFilterRequest(pathname: string, search: string) {
  if (search.length <= 1) return false;
  return pathname.startsWith("/kategorija/") || pathname === "/katalog";
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host === "www.itsgroup.mk") {
    const url = request.nextUrl.clone();
    url.host = "itsgroup.mk";
    return NextResponse.redirect(url, 308);
  }

  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  if (isCatalogFilterRequest(pathname, search)) {
    const ua = request.headers.get("user-agent") ?? "";
    if (AI_CRAWLER_UA.test(ua)) {
      return new NextResponse("Catalog filter URLs are not available for this crawler.", { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
