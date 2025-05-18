import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// context.params.id で取得
export async function GET(request: Request, context: { params: { id: string } }) {
  const supabase = await createClient();
  const { id: recipeId } = await context.params;

  const { data: ingredients } = await supabase
    .from("ingredients")
    .select("*")
    .eq("recipe_id", recipeId);

  const { data: steps } = await supabase
    .from("steps")
    .select("*")
    .eq("recipe_id", recipeId)
    .order("step_number", { ascending: true });

  return NextResponse.json({ ingredients, steps });
}