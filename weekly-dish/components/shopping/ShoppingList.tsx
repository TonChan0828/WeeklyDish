"use client";
import { useState } from "react";
import { format, addDays } from "date-fns";
import { FaListUl } from "react-icons/fa";

export default function ShoppingList() {
  // 今日と明日の日付を初期値に設定
  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(tomorrow);
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
      console.error("通信エラー:", e);
      setError("通信エラー");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-8 bg-gradient-to-br from-blue-100 to-green-50 rounded-2xl shadow-lg border border-blue-200">
      <div className="flex items-center gap-3 mb-8">
        <FaListUl className="text-blue-600 text-3xl drop-shadow-sm" />
        <h2 className="text-2xl font-extrabold text-blue-700 drop-shadow-sm">
          買い物リスト自動生成
        </h2>
      </div>
      <div className="flex flex-wrap gap-4 mb-8 items-end">
        <div>
          <label className="block text-sm text-blue-800 mb-1">開始日</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 bg-white min-w-[140px]"
          />
        </div>
        <span className="text-lg text-blue-600">〜</span>
        <div>
          <label className="block text-sm text-blue-800 mb-1">終了日</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="border rounded px-2 py-1 focus:ring-2 focus:ring-blue-300 bg-white min-w-[140px]"
          />
        </div>
        <div className="flex-1 flex justify-end">
          <button
            onClick={fetchList}
            className="bg-gradient-to-r from-blue-400 to-green-400 text-white px-8 py-2 rounded-lg shadow hover:from-blue-500 hover:to-green-500 transition disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-400 font-bold w-full md:w-auto"
            disabled={loading || !start || !end}
          >
            取得
          </button>
        </div>
      </div>
      {loading && <p className="text-blue-600 font-semibold">読み込み中...</p>}
      {error && <p className="text-red-500 font-semibold">{error}</p>}
      {list && (
        <div className="overflow-x-auto mt-6 rounded-3xl shadow-2xl border border-blue-200 bg-gradient-to-br from-white/95 to-green-50/80 backdrop-blur-md">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-gradient-to-r from-blue-100/80 to-green-100/80 text-blue-700 text-lg">
                <th className="border-b px-6 py-4 font-bold text-left rounded-tl-2xl">
                  材料名
                </th>
                <th className="border-b px-6 py-4 font-bold text-right rounded-tr-2xl">
                  合計量
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((item, i) => (
                <tr
                  key={item.name + i}
                  className="hover:bg-blue-50/60 transition group"
                >
                  <td className="border-b px-6 py-4 font-semibold text-gray-800 group-hover:text-blue-700 text-lg tracking-wide">
                    <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400 mr-2 align-middle"></span>
                    {item.name}
                  </td>
                  <td className="border-b px-6 py-4 text-right text-blue-600 font-bold text-lg">
                    {item.total_amount_text || item.total_amount || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
