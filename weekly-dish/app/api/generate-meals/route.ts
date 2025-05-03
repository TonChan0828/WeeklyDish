import { NextResponse } from "next/server"; 
import { createClient } from "@/utils/supabase/server";
import { addDays, format } from "date-fns";

type Recipe = {
  id: string;
  name: string;
    duration_days: number;
    time_slot: string[];
    category: string;
};

type MealCalendar = {
    [date: string]: {
        lunch: Recipe[];
        dinner: Recipe[];
    };
};


export async function POST () {
    try {
        const supabase = await createClient();
        const today = new Date();

        // 1週間分の日付を生成
        const dates = Array.from({ length: 7 }).map((_, i) =>
            format(addDays(today, i), "yyyy-MM-dd")
        );

        // 1か月前の日付を計算
        const oneMonthAgo = format(addDays(today, -28), "yyyy-MM-dd");

        // 直近１ヶ月で使用したレシピIDを取得
        const { data: recentlyUsedRecipes } = await supabase.from("meal_entries").select("recipe").gte("date", oneMonthAgo);
        // console.log("debug recentlyUsedRecipes:",recentlyUsedRecipes);

        const recentIds = recentlyUsedRecipes?.map((entry) => entry.recipe) || [];
        // console.log("debug recentIds:",recentIds);

        // 利用可能なレシピを取得
        const { data: recipes, error } = await supabase
            .from("recipes")
            .select("*")
            .not("id", "in", `(${recentIds.join(",")})`);
        // console.log("debug recipes:",recipes);
        if (error || !recipes) {
            return NextResponse.json({ error: "レシピの取得に失敗しました" }, { status: 500 });
        }
        
        const calendar: MealCalendar = {};
        
        // 各日付に対して献立を生成
        for (const date of dates) {
            calendar[date] = { "lunch": [], "dinner": [] };
            // console.log("debug date:", date);
            // 昼食と夕食それぞれに対して処理
            for (const slot of ["lunch", "dinner"] as const) {
                const availableRecipes = recipes.filter(recipe => { return recipe.time_slot?.includes(slot) && !recentIds.includes(recipe.id); });

                if (availableRecipes.length === 0) {
                    continue;
                }
                
                // ランダムにレシピを選択
                const selectedRecipe = availableRecipes[Math.floor(Math.random() * availableRecipes.length)];
                // console.log("debug selectedRecipe:", selectedRecipe);
                // duration_daysの日数分、レシピを割り当て
                for (let offset = 0; offset < (selectedRecipe.duration_days); offset++) {
                    const targetDate = format(addDays(new Date(date), offset), "yyyy-MM-dd");
                    if (calendar[targetDate]) {
                        calendar[targetDate][slot].push(selectedRecipe);
                    }
                }
                // 使用したレシピをrecentIdsに追加
                recentIds.push(selectedRecipe.id);

                // 献立履歴に記録
                await supabase.from("meal_entries").insert(
                    {
                        recipe: selectedRecipe.id,
                        date: date,
                        time_slot: slot
                    });
            }
        }
        for (const data in calendar) {
            console.log("debug data:", data);
            for(const slot in calendar[data]){
                console.log("debug slot:", slot);
                console.log("debug calendar[data][slot]:", calendar[data][slot]);
            }
        }
        return NextResponse.json({ calendar });
    } catch (error) {
        console.error("献立生成エラー:", error);
        return NextResponse.json(
            { error: "献立の生成に失敗しました" },
            { status: 500 }
        );
    }
}
