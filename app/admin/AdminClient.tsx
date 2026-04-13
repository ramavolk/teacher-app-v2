"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Teacher {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
}

export default function AdminClient({ admin }: { admin: any }) {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const load = async () => {
    const res = await fetch("/api/admin/teachers");
    if (res.ok) setTeachers(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  const save = async () => {
    if (!form.name || !form.email) return toast.error("Заполните поля");
    if (!editing && !form.password) return toast.error("Введите пароль");

    const res = await fetch("/api/admin/teachers", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing ? { id: editing.id, ...form } : form),
    });

    if (res.ok) {
      toast.success(editing ? "Обновлен" : "Добавлен");
      setModalOpen(false);
      setEditing(null);
      setForm({ name: "", email: "", password: "" });
      load();
    } else {
      toast.error("Ошибка");
    }
  };

  const toggleStatus = async (id: string, active: boolean) => {
    const t = teachers.find((t) => t.id === id);
    if (!t) return;
    await fetch("/api/admin/teachers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...t, isActive: !active }),
    });
    load();
  };

  const del = async (id: string) => {
    if (!confirm("Удалить учителя?")) return;
    await fetch(`/api/admin/teachers?id=${id}`, { method: "DELETE" });
    load();
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-emerald-600 text-lg">Загрузка...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Шапка с логотипом */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-emerald-800 text-3xl font-arabic">أ</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Arabic Koran
              </h1>
              <p className="text-emerald-600 text-sm">Админ-панель</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Вы вошли как</p>
              <p className="font-semibold text-emerald-700">{admin.name}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition shadow-md"
            >
              🚪 Выйти
            </button>
          </div>
        </div>

        {/* Заголовок страницы (без иконки) */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
            Управление учителями
          </h2>
          <p className="text-emerald-500 text-sm mt-1">Добавление, редактирование и управление учителями</p>
        </div>

        {/* Таблица */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-emerald-100">
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-amber-50 border-b border-emerald-100 flex justify-between items-center">
            <span className="font-semibold text-emerald-800">📋 Список учителей</span>
            <button
              onClick={() => {
                setEditing(null);
                setForm({ name: "", email: "", password: "" });
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl hover:shadow-md transition font-medium"
            >
              + Добавить учителя
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-left text-emerald-700 font-semibold">Имя</th>
                  <th className="p-4 text-left text-emerald-700 font-semibold">Email</th>
                  <th className="p-4 text-left text-emerald-700 font-semibold">Статус</th>
                  <th className="p-4 text-left text-emerald-700 font-semibold">Действия</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400">
                      Нет добавленных учителей
                    </td>
                  </tr>
                ) : (
                  teachers.map((t) => (
                    <tr key={t.id} className="border-t border-gray-100 hover:bg-emerald-50/30 transition">
                      <td className="p-4 text-gray-800 font-medium">{t.name}</td>
                      <td className="p-4 text-gray-600">{t.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            t.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.isActive ? "Активен" : "Заблокирован"}
                        </span>
                      </td>
                      <td className="p-4 space-x-3">
                        <button
                          onClick={() => {
                            setEditing(t);
                            setForm({ name: t.name, email: t.email, password: "" });
                            setModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition font-medium"
                        >
                          ✏️ Ред.
                        </button>
                        <button
                          onClick={() => toggleStatus(t.id, t.isActive)}
                          className={`transition font-medium ${
                            t.isActive ? "text-yellow-600 hover:text-yellow-800" : "text-green-600 hover:text-green-800"
                          }`}
                        >
                          {t.isActive ? "🔒 Блок" : "✅ Акт"}
                        </button>
                        <button onClick={() => del(t.id)} className="text-red-600 hover:text-red-800 transition font-medium">
                          🗑️ Уд.
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-5 text-emerald-800">
              {editing ? "✏️ Редактировать учителя" : "➕ Новый учитель"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Имя"
                className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 bg-white"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 bg-white"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="password"
                placeholder={editing ? "Новый пароль (оставьте пустым)" : "Пароль"}
                className="w-full p-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900 bg-white"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <div className="flex gap-3 pt-3">
                <button
                  onClick={save}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl hover:shadow-md transition font-medium"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}