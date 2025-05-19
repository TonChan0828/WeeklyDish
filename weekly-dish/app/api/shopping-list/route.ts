import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/shopping-list?start=YYYY-MM-DD&end=YYYY-MM-DD
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "startとendは必須です" }, { status: 400 });
  }

  // サーバー側でSQL関数を呼び出す
  const { data, error } = await supabase.rpc("get_shopping_list", {
    start_date: start,
    end_date: end,
  });

  if (error) {
    console.error("買い物リスト取得エラー:", error);
    return NextResponse.json({ error: "買い物リストの取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ shoppingList: data });
}
