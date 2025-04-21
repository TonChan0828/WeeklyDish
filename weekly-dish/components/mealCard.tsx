import React from "react";

interface MealCardProps {
  name: string;
  type: string;
  timing: string;
}
export default function MealCard(dishes: MealCardProps) {
  const bgColor = dishes.type === "main" ? "bg-orange-100" : "bg-green-100";
  return (
    <>
      <div className={`p-2 m-2 rounded shadow ${bgColor}`}>
        <span className="text-xs font-semibold text-gray-600">
          {dishes.type === "main" ? "主菜" : "副菜"}
        </span>
        <p className="text-sm">{dishes.name}</p>
      </div>
    </>
  );
}
