import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-yellow-100">
      <div className="bg-white/80 rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-xl w-full">
        <h1 className="text-5xl font-extrabold text-orange-500 mb-4 drop-shadow-lg tracking-tight">
          Weekly Dish
        </h1>
        <p className="text-lg text-gray-700 mb-8 text-center font-medium">
          1週間の献立を自動生成し、
          <br />
          買い物リストも一括管理できる
          <br />
          あなたのための食卓アシスタント
        </p>
        <div className="flex gap-6 mb-6">
          <Link href="/sign-in">
            <button className="px-8 py-3 rounded-full bg-orange-400 text-white font-bold shadow-md hover:bg-orange-500 transition text-lg">
              サインイン
            </button>
          </Link>
          <Link href="/sign-up">
            <button className="px-8 py-3 rounded-full bg-white text-orange-500 font-bold border-2 border-orange-400 shadow-md hover:bg-orange-50 transition text-lg">
              新規登録
            </button>
          </Link>
        </div>
        <span className="text-xs text-gray-400">© 2025 Weekly Dish</span>
      </div>
    </div>
  );
}
