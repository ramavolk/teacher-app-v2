"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await res.json();
    setLoading(false);
    
    if (res.ok) {
      toast.success("Вход выполнен");
      router.push("/admin");
    } else {
      toast.error(data.error || "Ошибка входа");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-emerald-100">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-emerald-800 text-5xl font-arabic translate-y-1.5">أ</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            Arabic Koran
          </h1>
          <p className="text-emerald-600 text-sm mt-1">Админ-панель</p>
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent my-6"></div>
          <p className="text-gray-500 text-sm">Вход для администратора</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-4 text-lg border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 bg-white"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Пароль"
              className="w-full px-4 py-4 text-lg border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 bg-white"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl hover:from-emerald-700 hover:to-teal-800 transition shadow-md font-medium text-lg disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-emerald-500 hover:text-emerald-600 transition">
            ← Вход для учителей
          </a>
        </div>
      </div>
    </div>
  );
}