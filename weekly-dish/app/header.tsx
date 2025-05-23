"use client";
import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <>
      <div className="bg-blue-600 h-12 flex  text-xl">
        <Link href="/calendar">
          <h1 className="text-white text-3xl">Weekly Dish</h1>
        </Link>
        <Link href="/profile" className="text-white ml-auto">
          Profile
        </Link>
        <Link href="/calendar" className="text-white ml-4">
          Calendar
        </Link>
        <Link href="/shoppingList" className="text-white ml-4">
          Shopping List
        </Link>
      </div>
    </>
  );
}
