"use client";
import { useEffect, useState } from "react";

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}
interface Step {
  id: string;
  description: string;
  step_number: number;
}
interface RecipeDetail {
  ingredients: Ingredient[];
  steps: Step[];
}
interface RecipeDetailModalProps {
  recipe: { id: string; title: string; type: "main" | "side" } | null;
  onClose: () => void;
}

export default function RecipeDetailModal({
  recipe,
  onClose,
}: RecipeDetailModalProps) {
  const [detail, setDetail] = useState<RecipeDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!recipe) return;
    setLoading(true);
    fetch(`/api/recipe-detail/${recipe.id}`)
      .then((res) => res.json())
      .then((data) => setDetail(data))
      .finally(() => setLoading(false));
  }, [recipe]);

  if (!recipe) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-gradient-to-br from-blue-50 to-green-100 p-8 rounded-3xl shadow-2xl min-w-[320px] max-w-[95vw] w-full sm:w-[420px] border border-blue-200 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        <h2 className="text-2xl font-extrabold mb-2 text-blue-700 drop-shadow-sm text-center">
          {recipe.title}
        </h2>
        <p className="mb-3 text-base text-blue-500 font-semibold text-center">
          種類:{" "}
          <span className="inline-block px-2 py-1 rounded bg-blue-200/60 text-blue-800 text-sm font-bold">
            {recipe.type === "main" ? "主菜" : "副菜"}
          </span>
        </p>
        {loading && (
          <p className="text-blue-600 font-semibold">読み込み中...</p>
        )}
        {detail && (
          <>
            <h3 className="font-bold mt-4 mb-1 text-lg text-green-700 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              材料
            </h3>
            <ul className="list-none ml-0 mb-4 w-full">
              {detail.ingredients.map((ing) => (
                <li
                  key={ing.id}
                  className="flex items-center gap-2 py-1 border-b border-dashed border-blue-100 last:border-b-0 text-gray-700"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-2"></span>
                  <span className="font-medium">{ing.name}</span>
                  <span className="text-sm text-gray-500">{ing.quantity}</span>
                </li>
              ))}
            </ul>
            <h3 className="font-bold mt-4 mb-1 text-lg text-orange-700 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-orange-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6l4 2"
                />
              </svg>
              手順
            </h3>
            <ol className="list-decimal ml-5 w-full">
              {detail.steps.map((step) => (
                <li key={step.id} className="mb-2 text-gray-800">
                  <span className="font-medium">{step.description}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </div>
  );
}
