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
  const [calendar, setCalendar] = useState(null);
  // 4週間分の献立
  const [calendar4weeks, setCalendar4weeks] = useState(null);
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
      .filter((recipe) => recipe.type === "main");
    return Array.from(new Map(all.map((r) => [r.id, r])).values());
  }, [calendar]);

  const sideRecipes = useMemo(() => {
    if (!calendar) return [];
    const all = Object.values(calendar as CalendarData)
      .flatMap((day) => [...day.lunch, ...day.dinner])
      .filter((recipe) => recipe.type === "side");
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

  const handleChangeRecipe = (
    date: string,
    slot: "lunch" | "dinner",
    index: number,
    newRecipeId: string
  ) => {
    const allRecipes = [...mainRecipes, ...sideRecipes];
    const newRecipe = allRecipes.find((r) => r.id === newRecipeId);
    setCalendar((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        [slot]: prev[date][slot].map((r, i) => (i === index ? newRecipe : r)),
      },
    }));
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

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-auto">
        <div className="container mx-auto p-4">
          <h1
            className="text-2xl font-bold mb-4 cursor-pointer hover:text-blue-600 transition"
            onClick={() => router.push("/calendar")}
          >
            週間献立カレンダー
          </h1>

          {/* 日付範囲の選択を追加 */}
          <div className="mb-4 p-4 border rounded">
            <h2 className="font-semibold mb-2">日付範囲を選択</h2>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm mb-1">開始日</label>
                <select
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {generateDateOptions(startDate, 30).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-lg">〜</span>
              <div>
                <label className="block text-sm mb-1">終了日</label>
                <select
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="border rounded px-2 py-1"
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
          <div className="mb-4 p-4 border rounded">
            <h2 className="font-semibold mb-2">週の開始曜日を選択</h2>
            <select
              value={weekStartsOn}
              onChange={(e) => setWeekStartsOn(Number(e.target.value))}
              className="border rounded px-2 py-1"
            >
              {weekStartOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 主菜・副菜の数指定 */}
          <div className="mb-4 p-4 border rounded">
            <h2 className="font-semibold mb-2">主菜・副菜の数を指定</h2>
            <div className="flex gap-8">
              <div>
                <h3 className="font-bold">昼食</h3>
                <label>
                  主菜:
                  <input
                    type="number"
                    min={0}
                    value={lunchMain}
                    onChange={(e) => setLunchMain(Number(e.target.value))}
                    className="border ml-2 w-12"
                  />
                </label>
                <label className="ml-4">
                  副菜:
                  <input
                    type="number"
                    min={0}
                    value={lunchSide}
                    onChange={(e) => setLunchSide(Number(e.target.value))}
                    className="border ml-2 w-12"
                  />
                </label>
              </div>
              <div>
                <h3 className="font-bold">夕食</h3>
                <label>
                  主菜:
                  <input
                    type="number"
                    min={0}
                    value={dinnerMain}
                    onChange={(e) => setDinnerMain(Number(e.target.value))}
                    className="border ml-2 w-12"
                  />
                </label>
                <label className="ml-4">
                  副菜:
                  <input
                    type="number"
                    min={0}
                    value={dinnerSide}
                    onChange={(e) => setDinnerSide(Number(e.target.value))}
                    className="border ml-2 w-12"
                  />
                </label>
              </div>
            </div>
            <button
              onClick={handleGenerateMeals}
              disabled={loading}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? "生成中..." : "献立を生成"}
            </button>
          </div>

          {/* カレンダー表示 */}
          {calendar4weeks ? (
            <CalendarDisplay calendarData={calendar4weeks} isEditable={false} />
          ) : (
            <div>読み込み中...</div>
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
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleSaveMeals}
                  className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
                >
                  この献立を登録する
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="w-full md:w-[400px]">
        <ShoppingList />
      </div>
    </div>
  );
}
