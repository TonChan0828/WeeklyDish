"use client";
import React from "react";
import { useState } from "react";

import MealCard from "@/components/mealCard";
import { createClient } from "@/utils/supabase/server";
import { format, addDays } from "date-fns";
import { ja } from "date-fns/locale";

export default function Calendar() {
  const [calendar, setCalendar] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateMeals = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/generate-meals", { method: "POST" });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setCalendar(data.calendar);
    } catch (error) {
      console.error("献立生成エラー", error);
      alert("献立の生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">週間献立カレンダー</h1>

      <button
        onClick={generateMeals}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4 hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "生成中..." : "献立を生成"}
      </button>

      {calendar && (
        <div className="grid gap-4">
          {Object.entries(calendar).map(([date, meals]) => (
            <div key={date} className="border p-4 rounded">
              <h2 className="font-bold">
                {format(new Date(date), "M月d日(E)", { locale: ja })}
              </h2>
              <div className="mt-2">
                <h3 className="font-semibold">昼食:</h3>
                <ul className="list-disc ml-4">
                  {meals.lunch.map((recipe, i) => (
                    <li key={`lunch-${i}`}>{recipe.title}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-2">
                <h3 className="font-semibold">夕食:</h3>
                <ul className="list-disc ml-4">
                  {meals.dinner.map((recipe, i) => (
                    <li key={`dinner-${i}`}>{recipe.title}</li>
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
