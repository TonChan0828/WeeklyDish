import { NextResponse } from "next/server"; 
import { createClient } from "@/utils/supabase/server";
import { addDays, format, parseISO, eachDayOfInterval } from "date-fns";

type Recipe = {
  id: string;
  title: string;
  type: string;
  duration_days: number;
  time_slot: string[];
  category: string;
  servings: number;
  cooking_time: number;
  difficulty: string;
  image_url: string;
  description: string;
  created_at: string;
  updated_at: string;
};


// 指定数だけランダムに配列から抽出する関数
function getRandomItems<T>(arr: T[], num: number): T[] {
  if (num <= 0) return [];
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

export async function POST (request: Request) {
    try {
       // 1. リクエストbodyから数値を取得
     const { lunchMain, lunchSide, dinnerMain, dinnerSide, weekStartsOn,startDate,
      endDate  } = await request.json();

    const supabase = await createClient();
    const today = new Date();
    
    // 指// 日付範囲から日付の配列を生成
    const dates = eachDayOfInterval({
      start: parseISO(startDate),
      end: parseISO(endDate)
    }).map(date => format(date, "yyyy-MM-dd"));

    // 2. レシピ全件取得
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*");

    if (error || !recipes) {
      return NextResponse.json({ error: "レシピ取得失敗" }, { status: 500 });
    }

    // 3. 主菜・副菜でレシピを分類
    const mainRecipes = recipes.filter(r => r.type === "main");
    const sideRecipes = recipes.filter(r => r.type === "side");
        
    // すでに使ったレシピIDを記録
    let usedMainIds: string[] = [];
    let usedSideIds: string[] = [];

    // 4. 1週間分のカレンダーを作成
    const calendar: Record<string, { lunch: any[]; dinner: any[] }> = {};
    // その日使えるレシピから、すでに使ったものを除外
      const availableMain = mainRecipes.filter(r => !usedMainIds.includes(r.id));
      const availableSide = sideRecipes.filter(r => !usedSideIds.includes(r.id));

    for (const date of dates) {
      // 主菜・副菜をランダムに抽出i
      const lunchMains = getRandomItems(availableMain, lunchMain);
      const lunchSides = getRandomItems(availableSide, lunchSide);
      const dinnerMains = getRandomItems(availableMain, dinnerMain);
      const dinnerSides = getRandomItems(availableSide, dinnerSide);

      calendar[date] = {
        lunch: [...lunchMains, ...lunchSides],
        dinner: [...dinnerMains, ...dinnerSides],
      };
    }
    console.log(calendar);
    return NextResponse.json({ calendar });
  } catch (error) {
    console.error("献立生成エラー:", error);
    return NextResponse.json(
      { error: "献立の生成に失敗しました" },
      { status: 500 }
    );
    }
}
