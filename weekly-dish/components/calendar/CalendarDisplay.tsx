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
    newRecipeId: string | null
  ) => void;
  onRecipeDelete?: (
    date: string,
    slot: "lunch" | "dinner",
    index: number
  ) => void;
}

export default function CalendarDisplay({
  calendarData,
  isEditable = false,
  mainRecipes = [],
  sideRecipes = [],
  onRecipeChange,
  onRecipeDelete,
}: CalendarDisplayProps) {
  // 日付をソート
  const sortedDates = Object.entries(calendarData).sort(([dateA], [dateB]) => {
    const a = new Date(dateA);
    const b = new Date(dateB);
    return a.getTime() - b.getTime();
  });

  // 選択中レシピのstateを拡張してindex/日付/枠も保持
  const [selectedRecipe, setSelectedRecipe] = useState<
    (Recipe & { date: string; slot: "lunch" | "dinner"; index: number }) | null
  >(null);
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
              onRecipeClick={(recipe, index) =>
                setSelectedRecipe(
                  recipe ? { ...recipe, date, slot: "lunch", index } : null
                )
              }
              className="text-blue-600"
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
              onRecipeClick={(recipe, index) =>
                setSelectedRecipe(
                  recipe ? { ...recipe, date, slot: "dinner", index } : null
                )
              }
              className="text-green-600 mt-2"
            />
          </div>
        ))}
      </div>
      {/* モーダル表示 */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="relative bg-gradient-to-br from-blue-50 to-green-100 p-8 rounded-3xl shadow-2xl min-w-[320px] max-w-[95vw] w-full sm:w-[420px] border border-blue-200 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-extrabold mb-2 text-blue-700 drop-shadow-sm text-center">
              {selectedRecipe.title}
            </h2>
            <p className="mb-3 text-base text-blue-500 font-semibold text-center">
              種類:{" "}
              <span className="inline-block px-2 py-1 rounded bg-blue-200/60 text-blue-800 text-sm font-bold">
                {selectedRecipe.type === "main" ? "主菜" : "副菜"}
              </span>
            </p>
            {/* ここから詳細 */}
            {loading && (
              <p className="text-blue-600 font-semibold">読み込み中...</p>
            )}
            {detail && (
              <>
                <h3 className="font-bold mt-4 mb-1 text-lg text-green-700 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  材料
                </h3>
                <ul className="list-none ml-0 mb-4 w-full">
                  {detail.ingredients.map((ing: any) => (
                    <li
                      key={ing.id}
                      className="flex items-center gap-2 py-1 border-b border-dashed border-blue-100 last:border-b-0 text-gray-700"
                    >
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                      <span className="font-medium">{ing.name}</span>
                      <span className="text-sm text-gray-500">
                        {/* amount/unitが空ならamount_textを表示 */}
                        {!ing.amount && !ing.unit && ing.amount_text
                          ? ing.amount_text
                          : `${ing.amount ?? ""}${ing.unit ?? ""}`}
                      </span>
                      {ing.notes && (
                        <span className="ml-2 text-xs text-gray-400">
                          ({ing.notes})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <h3 className="font-bold mt-4 mb-1 text-lg text-orange-700 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6l4 2"
                    />
                  </svg>
                  手順
                </h3>
                <ol className="list-decimal ml-5 w-full">
                  {detail.steps.map((step: any) => (
                    <li key={step.id} className="mb-2 text-gray-800">
                      <span className="font-medium">{step.description}</span>
                      {step.tips && (
                        <span className="ml-2 text-xs text-gray-500">
                          （{step.tips}）
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
            {/* 削除ボタン（onRecipeDeleteがあれば表示） */}
            {onRecipeDelete && (
              <button
                className="my-4 px-4 py-2 rounded-full bg-red-100 text-red-700 font-bold shadow hover:bg-red-200 transition-colors border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={() => {
                  onRecipeDelete(
                    selectedRecipe.date,
                    selectedRecipe.slot,
                    selectedRecipe.index
                  );
                  setSelectedRecipe(null);
                }}
                type="button"
              >
                このメニューの登録を削除
              </button>
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
  onRecipeChange: (index: number, newRecipeId: string | null) => void;
  onRecipeClick?: (recipe: Recipe | null, index: number) => void; // 追加
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
}: MealSectionProps & {
  onRecipeClick?: (recipe: Recipe | null, index: number) => void;
}) {
  return (
    <div>
      <h3 className={`font-semibold ${className}`}>{title}</h3>
      <ul className="list-disc ml-5">
        {meals.map((recipe, i) => (
          <li
            key={`${title}-${i}`}
            className={`text-gray-700 ${!isEditable ? "cursor-pointer hover:underline" : ""}`}
            onClick={() => !isEditable && onRecipeClick?.(recipe, i)}
          >
            {isEditable ? (
              <select
                value={recipe ? recipe.id : ""}
                onChange={(e) => onRecipeChange(i, e.target.value || null)}
                className="border rounded px-2 w-full"
              >
                <option value="">（選択しない）</option>
                {(recipe && recipe.type === "main") ||
                (!recipe && title === "昼食")
                  ? mainRecipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))
                  : sideRecipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
              </select>
            ) : recipe ? (
              recipe.title
            ) : (
              <span className="text-gray-400">（選択なし）</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
