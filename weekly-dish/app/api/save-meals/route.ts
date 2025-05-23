// weekly-dish/app/api/save-meals/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

interface MealEntry {
  date: string;
  time_slot: "lunch" | "dinner";
  recipe_id: string; 
  notes?: string;
  user_id: string; 
}

export async function POST(request: Request) {
  try {
    const { calendar } = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "未認証" }, { status: 401 });

    // 献立データをmeal_entriesテーブルに保存
    const entries: MealEntry[] = [];
    for (const [date, meals] of Object.entries(calendar)) {
      // 昼食の登録
      for (const recipe of meals.lunch) {
        entries.push({
          date,
          time_slot: "lunch",
          recipe_id: recipe.id, 
          notes: recipe.notes,
          user_id: user.id, 
        });
      }
      // 夕食の登録
      for (const recipe of meals.dinner) {
        entries.push({
          date,
          time_slot: "dinner",
          recipe_id: recipe.id, 
          notes: recipe.notes,
          user_id: user.id,
        });
      }
    }

    // 一括でデータを挿入
    const { error } = await supabase
      .from("meal_entries")
      .insert(entries);

    if (error) {
      console.error("保存エラー:", error);
      return NextResponse.json(
        { error: "献立の保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("保存エラー:", error);
    return NextResponse.json(
      { error: "献立の保存に失敗しました" },
      { status: 500 }
    );
  }
}