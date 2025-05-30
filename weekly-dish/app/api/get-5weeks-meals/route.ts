import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { addDays, subDays, format, startOfWeek }from "date-fns";

export async function GET(request:Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "未認証" }, { status: 401 });
    
    // URLから週の開始曜日を取得（デフォルトは日曜日）
    const url = new URL(request.url);
    const weekStartsOn = parseInt(url.searchParams.get("weekStartsOn") || "0");
    
    // 現在の日付から4週間前の週の開始日を計算
    const today = new Date();
    const startDay = startOfWeek(subDays(today, 28), { weekStartsOn });
    
    // 35日分の日付を生成
    const dates = Array.from({ length: 35 }).map((_, i) =>
      format(addDays(startDay, i), "yyyy-MM-dd")
    );

    // ここでは例として、DBに保存済みの献立履歴から取得
    const { data: meals, error } = await supabase
      .from("meal_entries")
      .select(`
        date,
        time_slot,
        notes,
        recipe:recipes (
          id,
          title,
          type,
          category,
          servings,
          cooking_time,
          difficulty,
          image_url,
          description
        )
      `)
      .eq("user_id",user.id)
      .in("date", dates);

    if (error || !meals) {
      return NextResponse.json({ error: "献立取得失敗" }, { status: 500 });
    }

    // 日付ごとにまとめる
    const calendar: Record<string, { lunch: any[]; dinner: any[] }> = {};
    for (const date of dates) {
      calendar[date] = { lunch: [], dinner: [] };
    }
    meals.forEach(entry => {
      if (calendar[entry.date]) {
        calendar[entry.date][entry.time_slot].push(entry.recipe);
      }
    });

    return NextResponse.json({ calendar });
  } catch (error) {
    console.error("献立取得エラー:", error);
    return NextResponse.json(
      { error: "献立の取得に失敗しました" },
      { status: 500 }
    );
  }

  return NextResponse.json({ calendar });
}