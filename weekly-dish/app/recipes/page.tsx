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
      <h1 className="text-3xl font-bold mb-6 text-center">レシピ一覧</h1>
      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="px-5 py-2 text-gray-600">レシピ名</th>
              <th className="px-5 py-2 text-gray-600">主菜/副菜</th>
            </tr>
          </thead>
          <tbody>
            {recipes && recipes.length > 0 ? (
              recipes.map((recipe: Recipe) => (
                <tr
                  key={recipe.id}
                  className="hover:bg-orange-50 transition cursor-pointer"
                  onClick={() => setSelectedRecipe(recipe)}
                >
                  <td className="px-4 py-2 font-medium text-orange-700 underline">
                    {recipe.title}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        recipe.type === "main"
                          ? "bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-bold"
                          : "bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold"
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
