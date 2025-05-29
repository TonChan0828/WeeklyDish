"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaCalendarAlt,
  FaShoppingCart,
} from "react-icons/fa";

export default function Header() {
  const [isSignedIn, setIsSignedIn] = useState(false);

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
        <Link
          href="/calendar"
          className="text-2xl font-bold hover:text-white transition"
        >
          WeeklyDish
        </Link>
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
