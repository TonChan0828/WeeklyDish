"use client";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const RecipeDetailModal = dynamic(
  () => import("@/components/recipes/RecipeDetailModal"),
  { ssr: false }
);

interface Recipe {
  id: string;
  title: string;
  type: "main" | "side";
}

export default function RecipesPageWrapper() {
  // クライアントコンポーネントとしてラップ
  return <RecipesPageClient />;
}

function RecipesPageClient() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 初回のみレシピ一覧を取得
  useEffect(() => {
    fetch("/api/recipes")
      .then((res) => res.json())
      .then((data) => setRecipes(data.recipes))
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="text-red-500 p-8">
        レシピの取得に失敗しました: {error}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-orange-600 drop-shadow-lg tracking-tight">
        レシピ一覧
      </h1>
      <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-3xl shadow-2xl p-8">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-5 py-2 text-orange-700 font-bold text-lg">レシピ名</th>
              <th className="px-5 py-2 text-orange-700 font-bold text-lg">主菜/副菜</th>
            </tr>
          </thead>
          <tbody>
            {recipes && recipes.length > 0 ? (
              recipes.map((recipe: Recipe) => (
                <tr
                  key={recipe.id}
                  className="hover:bg-orange-100/60 transition cursor-pointer rounded-xl shadow-sm"
                  onClick={() => setSelectedRecipe(recipe)}
                  style={{ borderRadius: "1rem" }}
                >
                  <td className="px-4 py-3 font-semibold text-orange-700 underline text-lg rounded-l-xl">
                    {recipe.title}
                  </td>
                  <td className="px-4 py-3 rounded-r-xl">
                    <span
                      className={
                        recipe.type === "main"
                          ? "bg-orange-200 text-orange-800 px-4 py-1 rounded-full text-sm font-bold shadow"
                          : "bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold shadow"
                      }
                    >
                      {recipe.type === "main" ? "主菜" : "副菜"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="text-center text-gray-400 py-8">
                  レシピがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />
    </div>
  );
}
