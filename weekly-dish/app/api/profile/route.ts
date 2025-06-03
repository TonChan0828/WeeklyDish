import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

// GET: プロフィール取得
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
//   console.log("user", user);
    if (!user) {
        console.error("User not found:", userError);
      
      return NextResponse.json({ error: "未認証です" }, { status: 401 });
      
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

    if (error) {
    console.error("Profile retrieval error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}

// PATCH: プロフィール更新
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
      console.error("User not found:", userError);
      return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  const updates = await request.json();
  updates.id = user.id;

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .upsert(updates)
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile });
}

// DELETE: ユーザープロフィールと認証アカウント削除
export async function DELETE(request: Request) {
  // 通常のsupabaseクライアント（anonキー）でユーザー取得
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[DELETE] user取得結果:", user, userError);

  if (!user) {
    console.error("[DELETE] User not found:", userError);
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  // service_roleキーで管理者クライアントを作成
  console.log("[DELETE] adminClient作成前", process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  console.log("[DELETE] adminClient作成後", adminClient);

  // 認証アカウント（auth.users）を削除
  try {
    const result = await adminClient.auth.admin.deleteUser(user.id);
    console.log("[DELETE] deleteUser結果:", result);
    if (result.error) {
      console.error("[DELETE] Auth user delete error:", result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
  } catch (e) {
    console.error("[DELETE] deleteUser例外:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }

  // user_profilesはCASCADEで自動削除される想定
  console.log("[DELETE] 削除成功");
  return NextResponse.json({ success: true });
}
