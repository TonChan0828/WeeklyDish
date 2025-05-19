"use client";
import { useState } from "react";

export default function ShoppingList() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [list, setList] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchList = async () => {
    setLoading(true);
    setError("");
    setList(null);
    try {
      const res = await fetch(`/api/shopping-list?start=${start}&end=${end}`);
      const data = await res.json();
      if (res.ok) {
        setList(data.shoppingList);
      } else {
        setError(data.error || "エラーが発生しました");
      }
    } catch (e) {
      setError("通信エラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">買い物リスト自動生成</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <span>〜</span>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={fetchList}
          className="bg-blue-500 text-white px-4 py-1 rounded"
          disabled={loading || !start || !end}
        >
          取得
        </button>
      </div>
      {loading && <p>読み込み中...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {list && (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">材料名</th>
              <th className="border px-2 py-1">合計量</th>
              <th className="border px-2 py-1">単位</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item, i) => (
              <tr key={item.name + item.unit + i}>
                <td className="border px-2 py-1">{item.name}</td>
                <td className="border px-2 py-1">{item.total_amount}</td>
                <td className="border px-2 py-1">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
