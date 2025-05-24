"use client";
import ShoppingList from "@/components/shopping/ShoppingList";

export default function ShoppingListPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-8">
      <h1 className="text-3xl font-extrabold mb-6 text-blue-700 flex items-center gap-2">
        <span className="inline-block bg-blue-100 rounded-full p-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M7 18a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7Zm0 0v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1"/></svg>
        </span>
        買い物リスト
      </h1>
      <div className="mb-8 text-gray-600 text-lg">
        献立から自動で材料リストを作成します。日付を選んで「取得」ボタンを押してください。
      </div>
      <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
        <ShoppingList />
      </div>
    </div>
  );
}
