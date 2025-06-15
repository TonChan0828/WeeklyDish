"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaCalendarAlt,
  FaShoppingCart,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Header() {
  // 初期値をundefinedにしてサーバー/クライアントの描画差異を防ぐ
  const [isSignedIn, setIsSignedIn] = useState<boolean | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // サインイン状態をAPI経由で判定
    fetch("/api/profile", { credentials: "include" })
      .then((res) => setIsSignedIn(res.ok))
      .catch(() => setIsSignedIn(false));
  }, []);

  return (
    <header className="bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 text-white">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* ロゴ／タイトル */}
        <button
          onClick={() => {
            if (isSignedIn === undefined) return; // 判定前は何もしない
            router.push(isSignedIn ? "/calendar" : "/");
            setMenuOpen(false);
          }}
          className="text-2xl font-bold hover:text-white transition bg-transparent border-none cursor-pointer"
          style={{ outline: "none" }}
          disabled={isSignedIn === undefined}
        >
          WeeklyDish
        </button>

        <div className="flex items-center">
          {/* モバイルメニュー切替ボタン */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
          {/* ナビリンク */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/profile"
              className="flex items-center space-x-1 hover:text-white transition"
            >
              <FaUserCircle />
              <span>プロフィール</span>
            </Link>
            <Link
              href="/calendar"
              className="flex items-center space-x-1 hover:text-white transition"
            >
              <FaCalendarAlt />
              <span>カレンダー</span>
            </Link>
            <Link
              href="/shopping-list"
              className="flex items-center space-x-1 hover:text-white transition"
            >
              <FaShoppingCart />
              <span>買い物リスト</span>
            </Link>
            <Link
              href="/recipes"
              className="flex items-center space-x-1 hover:text-white transition"
            >
              <span>レシピ一覧</span>
            </Link>
            <Link
              href="/recipes/new"
              className="flex items-center space-x-1 hover:text-white transition"
            >
              <span>レシピ登録</span>
            </Link>
            {isSignedIn && (
              <Link href="/sign-out" className="text-white ml-4">
                Sign Out
              </Link>
            )}
          </nav>
        </div>
      </div>

      {/* モバイルナビゲーション */}
      {menuOpen && (
        <nav className="md:hidden bg-gradient-to-b from-orange-500 via-pink-500 to-red-500 text-white px-4 pb-4 space-y-3">
          <Link
            href="/profile"
            className="flex items-center space-x-2"
            onClick={() => setMenuOpen(false)}
          >
            <FaUserCircle />
            <span>プロフィール</span>
          </Link>
          <Link
            href="/calendar"
            className="flex items-center space-x-2"
            onClick={() => setMenuOpen(false)}
          >
            <FaCalendarAlt />
            <span>カレンダー</span>
          </Link>
          <Link
            href="/shopping-list"
            className="flex items-center space-x-2"
            onClick={() => setMenuOpen(false)}
          >
            <FaShoppingCart />
            <span>買い物リスト</span>
          </Link>
          <Link
            href="/recipes"
            className="flex items-center space-x-2"
            onClick={() => setMenuOpen(false)}
          >
            <span>レシピ一覧</span>
          </Link>
          <Link
            href="/recipes/new"
            className="flex items-center space-x-2"
            onClick={() => setMenuOpen(false)}
          >
            <span>レシピ登録</span>
          </Link>
          {isSignedIn && (
            <Link
              href="/sign-out"
              className="flex items-center space-x-2"
              onClick={() => setMenuOpen(false)}
            >
              <FaSignOutAlt />
              <span>Sign Out</span>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
