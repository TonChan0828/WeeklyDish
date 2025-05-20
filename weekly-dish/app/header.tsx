"use client";
import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <>
      <div className="bg-blue-600 h-12 flex-auto">
        <p>Header</p>
        <Link href="/profile" className="text-white ml-auto">
          Profile
        </Link>
        <Link href="/calendar" className="text-white ml-4">
          Calendar
        </Link>
        <Link href="/shopping-list" className="text-white ml-4">
          Shopping List
        </Link>
      </div>
    </>
  );
}
