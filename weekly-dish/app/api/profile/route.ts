import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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
