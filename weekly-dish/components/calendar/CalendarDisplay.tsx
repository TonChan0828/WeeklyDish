// components/calendar/CalendarDisplay.tsx
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useState, useEffect } from "react";

interface Recipe {
  id: string;
  title: string;
  type: "main" | "side";
}

interface DayMeals {
  lunch: Recipe[];
  dinner: Recipe[];
}

interface CalendarDisplayProps {
  calendarData: Record<string, DayMeals>;
  isEditable?: boolean;
  mainRecipes?: Recipe[];
  sideRecipes?: Recipe[];
  onRecipeChange?: (
    date: string,
    slot: "lunch" | "dinner",
    index: number,
    newRecipeId: string
  ) => void;
}

export default function CalendarDisplay({
  calendarData,
  isEditable = false,
  mainRecipes = [],
  sideRecipes = [],
  onRecipeChange,
}: CalendarDisplayProps) {
  // 日付をソート
  const sortedDates = Object.entries(calendarData).sort(([dateA], [dateB]) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getTime() - b.getTime();
  });

  // 選択中レシピのstate
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [detail, setDetail] = useState<{
    ingredients: any[];
    steps: any[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedRecipe) {
      setLoading(true);
      fetch(`/api/recipe-detail/${selectedRecipe.id}`)
        .then((res) => res.json())
        .then((data) => setDetail(data))
        .finally(() => setLoading(false));
    } else {
      setDetail(null);
    }
  }, [selectedRecipe]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mt-8">
        {sortedDates.map(([date, meals]) => (
          <div key={date} className="border p-4 rounded shadow bg-white">
            <h2 className="font-bold mb-2 text-lg">
              {format(new Date(date), "M月d日(E)", { locale: ja })}
            </h2>
            <MealSection
              title="昼食"
              meals={meals.lunch}
              isEditable={isEditable}
              mainRecipes={mainRecipes}
              sideRecipes={sideRecipes}
              onRecipeChange={(index, newRecipeId) =>
                onRecipeChange?.(date, "lunch", index, newRecipeId)
              }
              onRecipeClick={setSelectedRecipe}
              className="text-orange-600"
            />
            <MealSection
              title="夕食"
              meals={meals.dinner}
              isEditable={isEditable}
              mainRecipes={mainRecipes}
              sideRecipes={sideRecipes}
              onRecipeChange={(index, newRecipeId) =>
                onRecipeChange?.(date, "dinner", index, newRecipeId)
              }
              onRecipeClick={setSelectedRecipe}
              className="text-green-600 mt-2"
            />
          </div>
        ))}
      </div>
      {/* モーダル表示 */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[300px] max-w-[90vw] relative">
            <button
              className="absolute top-2 right-4 text-2xl"
              onClick={() => setSelectedRecipe(null)}
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">{selectedRecipe.title}</h2>
            <p className="mb-1">
              種類: {selectedRecipe.type === "main" ? "主菜" : "副菜"}
            </p>
            {/* ここから詳細 */}
            {loading && <p>読み込み中...</p>}
            {detail && (
              <>
                <h3 className="font-bold mt-4">材料</h3>
                <ul className="list-disc ml-5">
                  {detail.ingredients.map((ing: any) => (
                    <li key={ing.id}>
                      {ing.name} {ing.amount}
                      {ing.unit} {ing.notes && `(${ing.notes})`}
                    </li>
                  ))}
                </ul>
                <h3 className="font-bold mt-4">手順</h3>
                <ol className="list-decimal ml-5">
                  {detail.steps.map((step: any) => (
                    <li key={step.id}>
                      {step.description}
                      {step.tips && (
                        <span className="text-xs text-gray-500">
                          （{step.tips}）
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// 食事セクション（昼食・夕食）のコンポーネント
interface MealSectionProps {
  title: string;
  meals: Recipe[];
  isEditable: boolean;
  mainRecipes: Recipe[];
  sideRecipes: Recipe[];
  onRecipeChange: (index: number, newRecipeId: string) => void;
  onRecipeClick?: (recipe: Recipe) => void; // 追加
  className?: string;
}

function MealSection({
  title,
  meals,
  isEditable,
  mainRecipes,
  sideRecipes,
  onRecipeChange,
  onRecipeClick,
  className,
}: MealSectionProps) {
  return (
    <div>
      <h3 className={`font-semibold ${className}`}>{title}</h3>
      <ul className="list-disc ml-5">
        {meals.map((recipe, i) => (
          <li
            key={`${title}-${i}`}
            className={`text-gray-700 ${!isEditable ? "cursor-pointer hover:underline" : ""}`}
            onClick={() => !isEditable && onRecipeClick?.(recipe)}
          >
            {isEditable ? (
              <select
                value={recipe.id}
                onChange={(e) => onRecipeChange(i, e.target.value)}
                className="border rounded px-2 w-full"
              >
                {(recipe.type === "main" ? mainRecipes : sideRecipes).map(
                  (r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  )
                )}
              </select>
            ) : (
              recipe.title
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
