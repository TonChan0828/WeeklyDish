import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { addDays, subDays, format, startOfWeek }from "date-fns";

export async function GET(request:Request) {
  // calendarをtry外で宣言
  let calendar: Record<string, { lunch: any[]; dinner: any[] }> = {};
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "未認証" }, { status: 401 });
    
    // URLから週の開始曜日を取得（デフォルトは日曜日）
    const url = new URL(request.url);
    let weekStartsOn = Number(url.searchParams.get("weekStartsOn"));
    if (isNaN(weekStartsOn) || weekStartsOn < 0 || weekStartsOn > 6) weekStartsOn = 0;
    // 現在の日付から4週間前の週の開始日を計算
    const today = new Date();
    const startDay = startOfWeek(subDays(today, 28), { weekStartsOn: weekStartsOn as 0|1|2|3|4|5|6 });
    
    // 35日分の日付を生成
    const dates = Array.from({ length: 35 }).map((_, i) =>
      format(addDays(startDay, i), "yyyy-MM-dd")
    );

    // DBから献立履歴を取得
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
    calendar = {};
    for (const date of dates) {
      calendar[date] = { lunch: [], dinner: [] };
    }
    meals.forEach((entry: any) => {
      if (calendar[entry.date] && (entry.time_slot === "lunch" || entry.time_slot === "dinner")) {
        (calendar[entry.date][entry.time_slot as "lunch" | "dinner"] as any[]).push(entry.recipe);
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
}