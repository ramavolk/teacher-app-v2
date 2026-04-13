"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  email: string;
}

export default function TeacherLoginPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/teachers/list")
      .then(res => res.json())
      .then(setTeachers)
      .catch(() => toast.error("Ошибка загрузки"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return toast.error("Выберите преподавателя");
    if (!password) return toast.error("Введите пароль");
    
    setLoading(true);
    const res = await fetch("/api/teacher/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId: selectedId, password }),
    });
    const data = await res.json();
    setLoading(false);
    
    if (res.ok) {
      toast.success(`Добро пожаловать, ${data.teacher.name}!`);
      router.push("/dashboard");
    } else {
      toast.error(data.error || "Ошибка входа");
    }
  };

  const selectedTeacher = teachers.find(t => t.id === selectedId);

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
          <p className="text-emerald-600 text-sm mt-1">Образовательный центр</p>
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent my-6"></div>
          <p className="text-gray-500 text-sm">Вход для преподавателей</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Кастомный выпадающий список */}
          <div className="relative">
            <div 
              className="w-full px-4 py-4 text-lg border border-emerald-200 rounded-xl focus-within:ring-2 focus-within:ring-amber-400 bg-white cursor-pointer flex justify-between items-center"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className={selectedId ? "text-gray-900" : "text-emerald-600"}>
                {selectedId ? selectedTeacher?.name : "👨‍🏫 Преподаватель"}
              </span>
              <svg 
                className={`w-5 h-5 text-emerald-500 transition-transform ${isOpen ? "rotate-180" : ""}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {isOpen && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-emerald-200 rounded-xl shadow-lg overflow-hidden">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="px-4 py-3 hover:bg-emerald-50 cursor-pointer transition flex items-center gap-2 border-b border-emerald-50 last:border-0"
                    onClick={() => {
                      setSelectedId(teacher.id);
                      setIsOpen(false);
                    }}
                  >
                    <span className="text-lg">👨‍🏫</span>
                    <span className="text-gray-800">{teacher.name}</span>
                    {selectedId === teacher.id && (
                      <span className="ml-auto text-emerald-500">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Поле пароля */}
          <div>
            <input
              type="password"
              placeholder="🔒 Пароль"
              className="w-full px-4 py-4 text-lg border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-700 bg-white placeholder:text-gray-400"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Кнопка входа */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl hover:from-emerald-700 hover:to-teal-800 transition shadow-md font-medium text-lg disabled:opacity-50"
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/admin/login" className="text-sm text-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-1">
            <span>🔐</span> Вход для администратора
          </a>
        </div>
      </div>
    </div>
  );
}