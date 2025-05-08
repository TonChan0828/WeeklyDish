import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { addDays,subDays, format } from "date-fns";

export async function GET() {
  const supabase = await createClient();
  const startDay = subDays(new Date(), 28);
  const dates = Array.from({ length: 35 }).map((_, i) =>
    format(addDays(startDay, i), "yyyy-MM-dd")
  );

  // ここでは例として、DBに保存済みの献立履歴から取得
  const { data: meals, error } = await supabase
    .from("meal_entries")
    .select("date, time_slot, recipe:recipes(*)")
    .in("date", dates);

  if (error || !meals) {
    return NextResponse.json({ error: "献立取得失敗" }, { status: 500 });
  }

  // 日付ごとにまとめる
  const calendar = {};
  for (const date of dates) {
    calendar[date] = { lunch: [], dinner: [] };
  }
  meals.forEach(entry => {
    if (calendar[entry.date]) {
      calendar[entry.date][entry.time_slot].push(entry.recipe);
    }
  });

  return NextResponse.json({ calendar });
}