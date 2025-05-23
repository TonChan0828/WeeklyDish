"use client";

import { useEffect, useState } from "react";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ name: "" });

  // プロフィール取得
  useEffect(() => {
    setLoading(true);
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error("プロフィール取得に失敗しました");
        const data = await res.json();
        setProfile(data.profile);
        setForm({
          name: data.profile?.name || "",
        });
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // 入力変更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // プロフィール更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("プロフィール更新に失敗しました");
      setSuccess("プロフィールを更新しました");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      {!loading && profile && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
          <label className="flex flex-col">
            名前
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border rounded px-2 py-1"
            />
          </label>
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            保存
          </button>
        </form>
      )}
    </div>
  );
}
