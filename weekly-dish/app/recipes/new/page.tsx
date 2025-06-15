"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const categories = [
  { value: "japanese", label: "和食" },
  { value: "western", label: "洋食" },
  { value: "chinese", label: "中華" },
  { value: "other", label: "その他" },
];

interface Ingredient {
  name: string;
  amount: string;
}

interface Step {
  description: string;
}

export default function RecipeNewPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"main" | "side">("main");
  const [category, setCategory] = useState("japanese");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "" },
  ]);
  const [steps, setSteps] = useState<Step[]>([{ description: "" }]);
  const [message, setMessage] = useState("");

  const handleAddIngredient = () =>
    setIngredients([...ingredients, { name: "", amount: "" }]);
  const handleAddStep = () => setSteps([...steps, { description: "" }]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, type, category, ingredients, steps }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("レシピを登録しました");
      setTitle("");
      setType("main");
      setCategory("japanese");
      setIngredients([{ name: "", amount: "" }]);
      setSteps([{ description: "" }]);
    } else {
      setMessage(data.error || "登録に失敗しました");
    }
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string,
  ) => {
    const newArr = [...ingredients];
    newArr[index][field] = value;
    setIngredients(newArr);
  };

  const updateStep = (index: number, value: string) => {
    const newArr = [...steps];
    newArr[index].description = value;
    setSteps(newArr);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-3xl font-extrabold mb-6 text-orange-600 text-center">
        レシピ登録
      </h1>
      {message && (
        <p className="mb-4 text-center text-green-600 font-semibold">
          {message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">レシピ名</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label>種類</Label>
          <div className="flex gap-4 mt-1">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="type"
                value="main"
                checked={type === "main"}
                onChange={() => setType("main")}
              />
              主菜
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="type"
                value="side"
                checked={type === "side"}
                onChange={() => setType("side")}
              />
              副菜
            </label>
          </div>
        </div>
        <div>
          <Label>カテゴリー</Label>
          <select
            className="mt-1 border rounded p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>材料</Label>
          {ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2 mt-2">
              <Input
                placeholder="名前"
                value={ing.name}
                onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="量"
                value={ing.amount}
                onChange={(e) => updateIngredient(idx, "amount", e.target.value)}
                className="flex-1"
              />
            </div>
          ))}
          <Button type="button" onClick={handleAddIngredient} className="mt-2">
            材料追加
          </Button>
        </div>
        <div>
          <Label>手順</Label>
          {steps.map((step, idx) => (
            <div key={idx} className="mt-2">
              <Input
                placeholder={`手順${idx + 1}`}
                value={step.description}
                onChange={(e) => updateStep(idx, e.target.value)}
              />
            </div>
          ))}
          <Button type="button" onClick={handleAddStep} className="mt-2">
            手順追加
          </Button>
        </div>
        <Button type="submit" className="mt-4">
          登録
        </Button>
      </form>
    </div>
  );
}
