// components/calendar/CalendarDisplay.tsx
import { format } from "date-fns";
import { ja } from "date-fns/locale";

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

  return (
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
            className="text-green-600 mt-2"
          />
        </div>
      ))}
    </div>
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
  className?: string;
}

function MealSection({
  title,
  meals,
  isEditable,
  mainRecipes,
  sideRecipes,
  onRecipeChange,
  className,
}: MealSectionProps) {
  return (
    <div>
      <h3 className={`font-semibold ${className}`}>{title}</h3>
      <ul className="list-disc ml-5">
        {meals.map((recipe, i) => (
          <li key={`${title}-${i}`} className="text-gray-700">
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
