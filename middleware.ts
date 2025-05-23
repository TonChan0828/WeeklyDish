import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  // 認証が必要なパス
  const protectedPaths = ["/protected", "/calendar"];
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const supabase = createClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/(auth-pages)/sign-in";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/protected/:path*", "/calendar/:path*"],
};
