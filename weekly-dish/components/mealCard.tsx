import React from "react";

interface MealWithRecipe {
  date: string;
  time_slot: "lunch" | "dinner";
  recipe: {
    title: string;
    type: "main" | "side";
  };
}
export default function MealCard(dishes: MealWithRecipe) {
  const bgColor =
    dishes.recipe?.type === "main" ? "bg-orange-100" : "bg-green-100";
  return (
    <>
      <div className={`p-2 m-2 rounded shadow ${bgColor}`}>
        <span className="text-xs font-semibold text-gray-600">
          {dishes.recipe?.type === "main" ? "主菜" : "副菜"}
        </span>
        <p className="text-sm">{dishes.recipe?.title}</p>
      </div>
    </>
  );
}
