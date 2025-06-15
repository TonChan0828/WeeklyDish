import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, title, type")
    .order("title", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ recipes });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "未認証です" }, { status: 401 });
  }

  const { title, type, category, ingredients, steps } = await request.json();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({ title, type, category })
    .select("id")
    .single();

  if (error || !recipe) {
    return NextResponse.json(
      { error: error?.message || "レシピ登録に失敗しました" },
      { status: 500 },
    );
  }

  if (Array.isArray(ingredients) && ingredients.length > 0) {
    const ingredientData = ingredients.map((ing: any) => ({
      recipe_id: recipe.id,
      name: ing.name,
      amount_text: ing.amount,
    }));
    const { error: ingError } = await supabase
      .from("ingredients")
      .insert(ingredientData);
    if (ingError) {
      return NextResponse.json({ error: ingError.message }, { status: 500 });
    }
  }

  if (Array.isArray(steps) && steps.length > 0) {
    const stepData = steps.map((step: any, idx: number) => ({
      recipe_id: recipe.id,
      description: step.description,
      step_number: idx + 1,
    }));
    const { error: stepError } = await supabase
      .from("steps")
      .insert(stepData);
    if (stepError) {
      return NextResponse.json({ error: stepError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ id: recipe.id });
}
