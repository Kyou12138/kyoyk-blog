import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL } from "@/lib/site";

const CANONICAL_HOST = new URL(SITE_URL).host;
const ALIASES = new Set(["www.kythron.com", "blog.kythron.com", "blog.kyoyk.top"]);

/** 非 canonical 域名统一 301，避免重复内容与登录态分裂。 */
export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0];
  if (!host || host === CANONICAL_HOST || !ALIASES.has(host)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.host = CANONICAL_HOST;
  url.protocol = "https:";
  url.port = "";
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
