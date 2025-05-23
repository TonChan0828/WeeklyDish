"use client";
import ShoppingList from "@/components/shopping/ShoppingList";

export default function ShoppingListPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">買い物リスト</h1>
      <ShoppingList />
    </div>
  );
}
