import { createClient } from "@/utils/supabase/server";

export default async function Instruments() {
  const supabase = await createClient();
  const { data: recipe } = await supabase.from("recipes").select();
  const { data: meal } = await supabase.from("meal_entries").select();

  return (
    <>
      <pre>{JSON.stringify(recipe, null, 2)}</pre>
      <pre>{JSON.stringify(meal, null, 2)}</pre>
    </>
  );
}
