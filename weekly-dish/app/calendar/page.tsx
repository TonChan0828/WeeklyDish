import React from "react";

import MealCard from "@/components/mealCard";
interface MealCardProps {
  name: string;
  type: string;
  timing: string;
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

export default function Calendar() {
  const last4Weeks = getLast4Weeks();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 時間をリセットして比較用に準備

  const lunch: MealCardProps = {
    name: "鶏の照焼",
    type: "main",
    timing: "lunch",
  };
  const dinner: MealCardProps = {
    name: "ほうれん草のおひたし",
    type: "sub",
    timing: "dinner",
  };
  return (
    <>
      <div>
        <div>
          <div className="font-bold text-2xl pt-10">過去4週間の献立</div>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {last4Weeks.map((date: Date, index: number) => {
              // 現在の日付より前かどうかを判定
              const isPast = date < today; // 時間をリセットして比較
              return (
                <div
                  key={index}
                  className={`p-3 shadow rounded ${
                    isPast ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <h2 className="font-bold text-center">
                    {`${date.getMonth() + 1}/${date.getDate()} (${days[date.getDay()]})`}
                  </h2>
                  <MealCard {...lunch} />
                  <MealCard {...dinner} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
