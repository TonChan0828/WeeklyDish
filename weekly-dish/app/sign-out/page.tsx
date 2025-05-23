"use client";
import { useEffect } from "react";

export default function SignOutPage() {
  useEffect(() => {
    // サインアウトAPIを呼び出し
    fetch("/api/sign-out", { method: "POST", credentials: "include" }).then(
      () => {
        // サインインページへリダイレクト
        window.location.href = "/sign-in";
      }
    );
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Signing out...</h1>
      <p>サインアウトしています。しばらくお待ちください。</p>
    </div>
  );
}
