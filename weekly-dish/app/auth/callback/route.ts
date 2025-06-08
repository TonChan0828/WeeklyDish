import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Vercel本番環境対応: originをX-Forwarded-HostやVERCEL_URLから取得
  const requestUrl = new URL(request.url);
  let origin = requestUrl.origin;
  // X-Forwarded-Hostがあれば優先
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedHost) {
    origin = `${requestUrl.protocol}//${forwardedHost}`;
  } else if (process.env.VERCEL_URL) {
    origin = `https://${process.env.VERCEL_URL}`;
  }

  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/`);
}
