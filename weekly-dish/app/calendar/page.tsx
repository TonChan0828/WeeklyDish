// app/calendar/page.tsx
"use client";
import React from "react";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import CalendarDisplay from "@/components/calendar/CalendarDisplay";
import ShoppingList from "@/components/shopping/ShoppingList";
import { format, addDays, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

interface Recipe {
  id: string;
  title: string;
  type: "main" | "side";
  category: string;
  servings: number;
  cooking_time: number;
  difficulty: string;
  image_url: string;
  description: string;
}

interface DayMeals {
  lunch: Recipe[];
  dinner: Recipe[];
}

interface CalendarData {
  [date: string]: DayMeals;
}

export default function Calendar() {
  const router = useRouter();
  // 主菜・副菜の数を状態管理
  const [lunchMain, setLunchMain] = useState(1);
  const [lunchSide, setLunchSide] = useState(2);
  const [dinnerMain, setDinnerMain] = useState(1);
  const [dinnerSide, setDinnerSide] = useState(3);
  // 1週間分の新しい献立
  const [calendar, setCalendar] = useState<CalendarData | null>(null);
  // 4週間分の献立
  const [calendar4weeks, setCalendar4weeks] = useState<CalendarData | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // 週の開始曜日を設定するstateを追加
  const [weekStartsOn, setWeekStartsOn] = useState(0); // 0: 日曜日, 1: 月曜日, ...

  // 日付範囲の選択を管理するstateを追加
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(
    format(addDays(new Date(), 6), "yyyy-MM-dd")
  );

  // 日付範囲の選択肢を生成する関数
  const generateDateOptions = (startDate: string, days: number) => {
    const options = [];
    const start = parseISO(startDate);
    for (let i = 0; i < days; i++) {
      const date = addDays(start, i);
      options.push({
        value: format(date, "yyyy-MM-dd"),
        label: format(date, "M月d日(E)", { locale: ja }),
      });
    }
    return options;
  };

  // 週の開始曜日の選択肢
  const weekStartOptions = [
    { value: 0, label: "日曜日" },
    { value: 1, label: "月曜日" },
    { value: 2, label: "火曜日" },
    { value: 3, label: "水曜日" },
    { value: 4, label: "木曜日" },
    { value: 5, label: "金曜日" },
    { value: 6, label: "土曜日" },
  ];

  // mainRecipesとsideRecipesの計算を追加
  const mainRecipes = useMemo(() => {
    if (!calendar) return [];
    const all = Object.values(calendar as CalendarData)
      .flatMap((day) => [...day.lunch, ...day.dinner])
      .filter((recipe) => recipe && recipe.type === "main"); // nullチェック追加
    return Array.from(new Map(all.map((r) => [r.id, r])).values());
  }, [calendar]);

  const sideRecipes = useMemo(() => {
    if (!calendar) return [];
    const all = Object.values(calendar as CalendarData)
      .flatMap((day) => [...day.lunch, ...day.dinner])
      .filter((recipe) => recipe && recipe.type === "side"); // nullチェック追加
    return Array.from(new Map(all.map((r) => [r.id, r])).values());
  }, [calendar]);

  // 初回レンダリング時に4週間分の献立を取得
  useEffect(() => {
    fetch(`/api/get-5weeks-meals?weekStartsOn=${weekStartsOn}`)
      .then((res) => res.json())
      .then((data) => setCalendar4weeks(data.calendar));
  }, [weekStartsOn]); // weekStartsOnが変更されたときにも再取得

  // 開始日が変更されたときの処理
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    // 終了日が開始日より前にならないように調整
    const start = parseISO(newStartDate);
    const end = parseISO(endDate);
    if (end < start) {
      setEndDate(format(start, "yyyy-MM-dd"));
    }
  };

  // 終了日が変更されたときの処理
  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);
    // 開始日が終了日より後にならないように調整
    const start = parseISO(startDate);
    const end = parseISO(newEndDate);
    if (start > end) {
      setStartDate(format(end, "yyyy-MM-dd"));
    }
  };

  // 献立生成リクエスト
  const handleGenerateMeals = async () => {
    setLoading(true);
    const res = await fetch("/api/generate-meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lunchMain,
        lunchSide,
        dinnerMain,
        dinnerSide,
        weekStartsOn,
        startDate,
        endDate,
      }),
    });
    const data = await res.json();
    setCalendar(data.calendar);
    setLoading(false);
  };

  // 編集用カレンダーのレシピ変更
  const handleChangeRecipe = (
    date: string,
    slot: "lunch" | "dinner",
    index: number,
    newRecipeId: string | null
  ) => {
    const allRecipes = [...mainRecipes, ...sideRecipes];
    const newRecipe = allRecipes.find((r) => r.id === newRecipeId) || null;
    setCalendar((prev) => {
      if (!prev) return prev;
      const newObj: CalendarData = { ...prev };
      const prevSlotArr = prev[date]?.[slot] as (Recipe | null)[] | undefined;
      newObj[date] = {
        ...prev[date],
        [slot]: prevSlotArr
          ? prevSlotArr.map((r, i) => (i === index ? newRecipe : r))
          : [],
      };
      return newObj;
    });
  };

  // 献立登録用の関数を追加
  const handleSaveMeals = async () => {
    if (!calendar) return;

    try {
      const res = await fetch("/api/save-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calendar }),
      });

      if (!res.ok) throw new Error("登録に失敗しました");

      alert("献立を登録しました！");
      // 登録後は4週間分の献立を再取得
      const updatedRes = await fetch("/api/get-5weeks-meals");
      const updatedData = await updatedRes.json();
      setCalendar4weeks(updatedData.calendar);
      setCalendar(null); // 生成された献立をクリア
    } catch (error) {
      console.error("登録エラー:", error);
      alert("献立の登録に失敗しました");
    }
  };

  // 4週間分のカレンダー（DB登録済み）からメニューを削除
  const handleDeleteRegisteredRecipe = async (
    date: string,
    slot: "lunch" | "dinner",
    index: number
  ) => {
    if (!calendar4weeks) return;
    const slotArr = calendar4weeks[date]?.[slot] as Recipe[] | undefined;
    const recipeId = slotArr && slotArr[index] ? slotArr[index].id : undefined;
    if (!recipeId) return;
    // 画面上から即時削除
    setCalendar4weeks((prev) => {
      if (!prev) return prev;
      // prevの型をCalendarDataとみなして型安全に書く
      const newObj: CalendarData = { ...prev };
      const prevSlotArr = prev[date]?.[slot] as Recipe[] | undefined;
      newObj[date] = {
        ...prev[date],
        [slot]: prevSlotArr ? prevSlotArr.filter((_, i) => i !== index) : [],
      };
      return newObj;
    });
    // DBからも削除
    try {
      const res = await fetch("/api/save-meals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time_slot: slot, recipe_id: recipeId }),
      });
      if (!res.ok) throw new Error("削除に失敗しました");
    } catch (e) {
      alert("サーバー側の削除に失敗しました");
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 bg-gradient-to-br from-orange-50 to-yellow-100 min-h-screen">
      <div className="flex-auto">
        <div className="container mx-auto p-6 rounded-3xl shadow-2xl bg-white/90 mt-8">
          <h1
            className="text-3xl font-extrabold mb-6 text-orange-600 flex items-center gap-2 drop-shadow-lg cursor-pointer hover:text-orange-500 transition"
            onClick={() => router.push("/calendar")}
          >
            <span className="inline-block bg-orange-100 text-orange-700 rounded-full px-3 py-1 text-sm font-semibold mr-2">
              WEEKLY
            </span>
            週間献立カレンダー
          </h1>

          {/* 日付範囲の選択を追加 */}
          <div className="mb-6 p-6 border border-orange-100 rounded-2xl bg-orange-50/60 shadow-sm">
            <h2 className="font-semibold mb-3 text-orange-700">
              日付範囲を選択
            </h2>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm mb-1 text-orange-800">
                  開始日
                </label>
                <select
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-300 bg-white shadow"
                >
                  {generateDateOptions(startDate, 30).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-lg text-orange-600">〜</span>
              <div>
                <label className="block text-sm mb-1 text-orange-800">
                  終了日
                </label>
                <select
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-300 bg-white shadow"
                >
                  {generateDateOptions(startDate, 30).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 週の開始曜日選択 */}
          <div className="mb-6 p-6 border border-orange-100 rounded-2xl bg-orange-50/60 shadow-sm">
            <h2 className="font-semibold mb-3 text-orange-700">
              週の開始曜日を選択
            </h2>
            <select
              value={weekStartsOn}
              onChange={(e) => setWeekStartsOn(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-300 bg-white shadow"
            >
              {weekStartOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 主菜・副菜の数指定 */}
          <div className="mb-6 p-6 border border-orange-100 rounded-2xl bg-orange-50/60 shadow-sm">
            <h2 className="font-semibold mb-3 text-orange-700">
              主菜・副菜の数を指定
            </h2>
            <div className="flex gap-8">
              <div>
                <h3 className="font-bold text-orange-600 mb-2">昼食</h3>
                <label className="block mb-2">
                  主菜:
                  <input
                    type="number"
                    min={0}
                    value={lunchMain}
                    onChange={(e) => setLunchMain(Number(e.target.value))}
                    className="border ml-2 w-12 rounded-lg focus:ring-2 focus:ring-orange-300"
                  />
                </label>
                <label className="block">
                  副菜:
                  <input
                    type="number"
                    min={0}
                    value={lunchSide}
                    onChange={(e) => setLunchSide(Number(e.target.value))}
                    className="border ml-2 w-12 rounded-lg focus:ring-2 focus:ring-orange-300"
                  />
                </label>
              </div>
              <div>
                <h3 className="font-bold text-green-600 mb-2">夕食</h3>
                <label className="block mb-2">
                  主菜:
                  <input
                    type="number"
                    min={0}
                    value={dinnerMain}
                    onChange={(e) => setDinnerMain(Number(e.target.value))}
                    className="border ml-2 w-12 rounded-lg focus:ring-2 focus:ring-green-300"
                  />
                </label>
                <label className="block">
                  副菜:
                  <input
                    type="number"
                    min={0}
                    value={dinnerSide}
                    onChange={(e) => setDinnerSide(Number(e.target.value))}
                    className="border ml-2 w-12 rounded-lg focus:ring-2 focus:ring-green-300"
                  />
                </label>
              </div>
            </div>
            <button
              onClick={handleGenerateMeals}
              disabled={loading}
              className="mt-6 bg-gradient-to-r from-orange-400 to-yellow-400 text-white px-6 py-2 rounded-lg shadow hover:from-orange-500 hover:to-yellow-500 transition disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 font-bold text-lg"
            >
              {loading ? "生成中..." : "献立を生成"}
            </button>
          </div>

          {/* カレンダー表示 */}
          {calendar4weeks ? (
            <CalendarDisplay
              calendarData={calendar4weeks}
              isEditable={false}
              mainRecipes={mainRecipes}
              sideRecipes={sideRecipes}
              onRecipeDelete={handleDeleteRegisteredRecipe}
            />
          ) : (
            <div className="text-center text-gray-400 py-8">読み込み中...</div>
          )}

          {calendar && (
            <>
              <CalendarDisplay
                calendarData={calendar}
                isEditable={true}
                mainRecipes={mainRecipes}
                sideRecipes={sideRecipes}
                onRecipeChange={handleChangeRecipe}
              />
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSaveMeals}
                  className="bg-gradient-to-r from-green-400 to-orange-400 text-white px-8 py-3 rounded-lg shadow hover:from-green-500 hover:to-orange-500 transition font-bold text-lg"
                >
                  この献立を登録する
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 買い物リストを中央寄せ＆カード風に改善 */}
      <div className="w-full md:w-[600px] flex justify-center items-start mt-8 md:mt-16">
        <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-3">
          <h2 className="text-xl font-bold mb-4 text-orange-700 flex items-center gap-2">
            <span className="inline-block bg-orange-100 rounded-full p-2">
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path
                  fill="#fb923c"
                  d="M7 18a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7Zm0 0v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1"
                />
              </svg>
            </span>
            買い物リスト
          </h2>
          <div className="mb-2 text-gray-600 text-sm">
            献立から自動で材料リストを作成します。日付を選んで「取得」ボタンを押してください。
          </div>
          <div className="bg-gray-50 rounded-lg p-4 shadow-inner">
            <ShoppingList />
          </div>
        </div>
      </div>
    </div>
  );
}
