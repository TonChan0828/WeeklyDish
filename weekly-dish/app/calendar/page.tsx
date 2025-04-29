import React from "react";

import MealCard from "@/components/mealCard";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { title } from "process";

interface MealWithRecipe {
  date: string;
  time_slot: "lunch" | "dinner";
  recipe: {
    title: string;
    type: "main" | "side";
  };
}

const days = ["日", "月", "火", "水", "木", "金", "土"];
// 過去4週間分の日付を生成する関数
function getLast4Weeks(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - dayOfWeek); // 今週の日曜日の日付を取得
  // 今日から過去4週間分の日付を生成
  const dates = Array.from({ length: 28 }, (_, i) => {
    const date = new Date();
    date.setDate(lastSunday.getDate() - i + 6);
    return date;
  });
  return dates.reverse();
}

export default async function Calendar() {
  const last4Weeks = getLast4Weeks();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 時間をリセットして比較用に準備

  const supabaseURl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id,title,type");
  const { data: meals } = await supabase
    .from("meal_entries")
    .select("date,time_slot,recipe(*)");
  const mealsByDate: Record<
    string,
    { lunch: MealWithRecipe[]; dinner: MealWithRecipe[] }
  > = {};
  console.log("Meals with Recipes:", meals);

  meals?.forEach((meal) => {
    const date = meal.date;
    const time = meal.time_slot;
    if (!mealsByDate[date]) {
      mealsByDate[date] = { lunch: [], dinner: [] };
    }
    if (!mealsByDate[date][time]) {
      mealsByDate[date][time] = [];
    }
    mealsByDate[date][time].push(meal);
  });

  const days = [
    "2025-04-21",
    "2025-04-22",
    "2025-04-23",
    "2025-04-24",
    "2025-04-25",
    "2025-04-26",
    "2025-04-27",
  ];

  return (
    <>
      <div>
        <div>
          <h1 className="text-2xl font-bold mb-4">1週間の献立カレンダー</h1>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <div key={day} className="bg-white p-3 shadow rounded">
                <h2 className="font-bold text-sm text-center">{day}</h2>

                <div className="mt-2">
                  <p className="text-xs font-bold">昼：</p>
                  <div className="space-y-1">
                    {mealsByDate[day]?.lunch?.map((meal, i) => (
                      <MealCard key={i} {...meal} />
                    )) ?? <p className="text-sm text-gray-400">-</p>}
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs font-bold">夜：</p>
                  <div className="space-y-1">
                    {mealsByDate[day]?.dinner?.map((meal, i) => (
                      <MealCard key={i} {...meal} />
                    )) ?? <p className="text-sm text-gray-400">-</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
