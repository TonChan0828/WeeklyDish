"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaCalendarAlt,
  FaShoppingCart,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Header() {
  // 初期値をundefinedにしてサーバー/クライアントの描画差異を防ぐ
  const [isSignedIn, setIsSignedIn] = useState<boolean | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    // サインイン状態をAPI経由で判定
    fetch("/api/profile", { credentials: "include" })
      .then((res) => setIsSignedIn(res.ok))
      .catch(() => setIsSignedIn(false));
  }, []);

  return (
    <header className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* ロゴ／タイトル */}
        <button
          onClick={() => {
            if (isSignedIn === undefined) return; // 判定前は何もしない
            router.push(isSignedIn ? "/calendar" : "/");
          }}
          className="text-2xl font-bold hover:text-white transition bg-transparent border-none cursor-pointer"
          style={{ outline: "none" }}
          disabled={isSignedIn === undefined}
        >
          WeeklyDish
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
          {isSignedIn && (
            <Link href="/sign-out" className="text-white ml-4">
              Sign Out
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
