"use client";
import React from "react";
import { useState, useMemo } from "react";

import MealCard from "@/components/mealCard";
import { createClient } from "@/utils/supabase/server";
import { format, addDays } from "date-fns";
import { ja } from "date-fns/locale";

export default function Calendar() {
  // 主菜・副菜の数を状態管理
  const [lunchMain, setLunchMain] = useState(1);
  const [lunchSide, setLunchSide] = useState(2);
  const [dinnerMain, setDinnerMain] = useState(1);
  const [dinnerSide, setDinnerSide] = useState(3);
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);

  const mainRecipes = useMemo(() => {
    if (!calendar) return [];
    const all = Object.values(calendar)
      .flatMap((day) => [...day.lunch, ...day.dinner])
      .filter((recipe) => recipe.type === "main");
    // 重複除去（idでユニーク化）
    return Array.from(new Map(all.map((r) => [r.id, r])).values());
  }, [calendar]);

  const sideRecipes = useMemo(() => {
    if (!calendar) return [];
    const all = Object.values(calendar)
      .flatMap((day) => [...day.lunch, ...day.dinner])
      .filter((recipe) => recipe.type === "side");
    // 重複除去（idでユニーク化）
    return Array.from(new Map(all.map((r) => [r.id, r])).values());
  }, [calendar]);

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
      }),
    });
    const data = await res.json();
    setCalendar(data.calendar);
    setLoading(false);
  };

  const handleChangeRecipe = (date, slot, index, newRecipeId) => {
    // 新しいレシピをmainRecipes/sideRecipesから探す
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">週間献立カレンダー</h1>
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

      {calendar && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {Object.entries(calendar).map(([date, meals]) => (
            <div key={date} className="border p-4 rounded shadow bg-white">
              <h2 className="font-bold mb-2 text-lg">
                {format(new Date(date), "M月d日(E)", { locale: ja })}
              </h2>
              <div>
                <h3 className="font-semibold text-blue-600">昼食</h3>
                <ul className="list-disc ml-5">
                  {meals.lunch.map((recipe, i) => (
                    <li key={`lunch-${i}`} className="flex items-center gap-2">
                      <select
                        value={recipe.id}
                        onChange={(e) =>
                          handleChangeRecipe(date, "lunch", i, e.target.value)
                        }
                        className="border rounded px-2"
                      >
                        {(recipe.type === "main"
                          ? mainRecipes
                          : sideRecipes
                        ).map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <h3 className="font-semibold text-green-600">夕食</h3>
                <ul className="list-disc ml-5">
                  {meals.dinner.map((recipe, i) => (
                    <li key={`dinner-${i}`} className="flex items-center gap-2">
                      <select
                        value={recipe.id}
                        onChange={(e) =>
                          handleChangeRecipe(date, "dinner", i, e.target.value)
                        }
                        className="border rounded px-2"
                      >
                        {(recipe.type === "main"
                          ? mainRecipes
                          : sideRecipes
                        ).map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title}
                          </option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
