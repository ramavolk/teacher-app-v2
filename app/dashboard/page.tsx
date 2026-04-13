"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Lesson {
  id: string;
  student: string;
  studentId: string;
  date: string;
  time: string;
  comment: string;
}

interface Student {
  id: string;
  name: string;
  phone: string;
  level: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [teacherName, setTeacherName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [showNewLesson, setShowNewLesson] = useState(false);
  const [showNewStudent, setShowNewStudent] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState<Student | null>(null);
  const [showReschedule, setShowReschedule] = useState<string | null>(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [newLesson, setNewLesson] = useState({ studentId: "", date: selectedDate, time: "", comment: "" });
  const [newStudent, setNewStudent] = useState({ name: "", phone: "+7 ", level: "A1" });
  const [editStudent, setEditStudent] = useState({ name: "", phone: "", level: "" });

  useEffect(() => {
    fetch("/api/teacher/login")
      .then(res => res.json())
      .then(data => {
        if (!data.teacher) {
          router.push("/login");
        } else {
          setTeacherName(data.teacher.name);
          setTeacherId(data.teacher.id);
        }
      })
      .catch(() => router.push("/login"));
  }, []);

  const loadData = async () => {
    if (!teacherId) return;
    try {
      const [studentsRes, lessonsRes] = await Promise.all([
        fetch(`/api/students`),
        fetch(`/api/lessons?date=${selectedDate}`)
      ]);
      
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (lessonsRes.ok) setLessons(await lessonsRes.json());
    } catch (error) {
      toast.error("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) loadData();
  }, [selectedDate, teacherId]);

  const logout = async () => {
    await fetch("/api/teacher/login", { method: "DELETE" });
    router.push("/login");
  };

  const handleAddStudent = async () => {
    if (!newStudent.name) return toast.error("Введите имя");
    
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });
    
    if (res.ok) {
      toast.success("Ученик добавлен");
      setShowNewStudent(false);
      setNewStudent({ name: "", phone: "+7 ", level: "A1" });
      loadData();
    } else {
      toast.error("Ошибка");
    }
  };

  const handleEditStudent = async () => {
    if (!editStudent.name) return toast.error("Введите имя");
    
    const res = await fetch("/api/students", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: showEditStudent?.id, ...editStudent }),
    });
    
    if (res.ok) {
      toast.success("Данные обновлены");
      setShowEditStudent(null);
      loadData();
    } else {
      toast.error("Ошибка");
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Удалить ученика ${name}?`)) return;
    const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Ученик удален");
      loadData();
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.studentId || !newLesson.date || !newLesson.time) {
      return toast.error("Заполните все поля");
    }
    
    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLesson),
    });
    
    if (res.ok) {
      toast.success("Занятие добавлено");
      setShowNewLesson(false);
      setNewLesson({ studentId: "", date: selectedDate, time: "", comment: "" });
      loadData();
    } else {
      toast.error("Ошибка");
    }
  };

  const handleUpdateComment = async (id: string, currentComment: string) => {
    const newComment = prompt("Введите комментарий:", currentComment || "");
    if (newComment === null) return;
    
    const res = await fetch("/api/lessons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, comment: newComment }),
    });
    
    if (res.ok) {
      toast.success("Комментарий обновлен");
      loadData();
    } else {
      toast.error("Ошибка");
    }
  };

  const handleReschedule = async (id: string) => {
    if (!rescheduleData.date || !rescheduleData.time) {
      return toast.error("Выберите дату и время");
    }
    
    const res = await fetch("/api/lessons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, date: rescheduleData.date, time: rescheduleData.time }),
    });
    
    if (res.ok) {
      toast.success("Занятие перенесено");
      setShowReschedule(null);
      loadData();
    } else {
      toast.error("Ошибка");
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Удалить занятие?")) return;
    const res = await fetch(`/api/lessons?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Занятие удалено");
      loadData();
    }
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${day}.${month}.${year}`;
  };

  // Получение названия дня недели
  const getDayName = (date: string) => {
    const days = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    const d = new Date(date);
    return days[d.getDay()];
  };

  // Переключение даты
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate.toISOString().split("T")[0]);
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Загрузка...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      {/* Шапка */}
      <header className="bg-gradient-to-r from-emerald-800 to-teal-800 shadow-lg sticky top-0 z-20">
        <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-emerald-800 text-5xl font-arabic leading-none translate-y-2">أ</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Arabic Koran
              </h1>
              <p className="text-xs text-emerald-200">Управление расписанием</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#c9a03d" opacity="0.3"/>
                <circle cx="12" cy="12" r="8" fill="#c9a03d"/>
                <path d="M12 6v6l4 2" stroke="#1a4d3a" strokeWidth="2" fill="none"/>
              </svg>
              <span className="text-emerald-200">{teacherName}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
            >
              <span>🚪</span> Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Красивый выбор даты */}
        <div className="bg-gradient-to-r from-white to-emerald-50 rounded-2xl shadow-md p-6 mb-8 border border-emerald-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h2 className="text-2xl font-bold text-emerald-800">Расписание</h2>
              <p className="text-emerald-500 mt-1">Выберите дату для просмотра занятий</p>
            </div>
            
            {/* Кастомный выбор даты */}
            <div className="flex items-center gap-4 bg-white rounded-xl p-2 shadow-sm border border-emerald-100">
              <button
                onClick={() => changeDate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-emerald-100 transition text-emerald-600 text-xl"
              >
                ◀
              </button>
              
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 text-lg border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-emerald-700 bg-transparent text-center cursor-pointer"
                />
              </div>
              
              <button
                onClick={() => changeDate(1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-emerald-100 transition text-emerald-600 text-xl"
              >
                ▶
              </button>
            </div>
          </div>
          
          {/* Отображение выбранной даты красиво */}
          <div className="mt-4 pt-4 border-t border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-3 text-white text-center min-w-[80px]">
                <div className="text-2xl font-bold">{formatDate(selectedDate).split(".")[0]}</div>
                <div className="text-xs">{formatDate(selectedDate).split(".")[1]}.{formatDate(selectedDate).split(".")[2]}</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-emerald-800">{getDayName(selectedDate)}</div>
                <div className="text-sm text-emerald-500">{lessons.length} занятий</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Список занятий */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🕐</span>
              <h3 className="text-xl font-semibold text-emerald-700">
                {formatDate(selectedDate)}, {lessons.length} занятий
              </h3>
            </div>

            {lessons.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-emerald-100">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-emerald-400 text-lg">Нет занятий на этот день</p>
                <button onClick={() => setShowNewLesson(true)} className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl">
                  Добавить занятие
                </button>
              </div>
            ) : (
              lessons.map((lesson) => (
                <div key={lesson.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-emerald-100 overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-500">{lesson.time}</div>
                        </div>
                        <div className="w-px h-12 bg-emerald-100"></div>
                        <div>
                          <h4 className="text-lg font-bold text-emerald-800">{lesson.student}</h4>
                          <p className="text-sm text-gray-500 mt-0.5">💬 {lesson.comment || "Без комментария"}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        {showReschedule === lesson.id ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="date"
                              className="px-3 py-2 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-emerald-700 bg-white"
                              value={rescheduleData.date}
                              onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                            />
                            <input
                              type="time"
                              className="px-3 py-2 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-emerald-700 bg-white"
                              value={rescheduleData.time}
                              onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                            />
                            <button onClick={() => handleReschedule(lesson.id)} className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm">Сохранить</button>
                            <button onClick={() => setShowReschedule(null)} className="px-3 py-2 bg-red-100 text-red-600 rounded-xl text-sm hover:bg-red-200">Отмена</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { setShowReschedule(lesson.id); setRescheduleData({ date: lesson.date, time: lesson.time }); }} className="px-4 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100">📅 Перенести</button>
                            <button onClick={() => handleUpdateComment(lesson.id, lesson.comment)} className="px-4 py-2 text-sm bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100">💬 Коммент</button>
                            <button onClick={() => handleDeleteLesson(lesson.id)} className="px-4 py-2 text-sm bg-red-50 text-red-500 rounded-xl hover:bg-red-100">🗑️ Удалить</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Список учеников */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-emerald-100">
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  <h3 className="text-lg font-semibold text-emerald-800">Мои ученики</h3>
                  <span className="text-xs text-emerald-400 bg-emerald-50 px-2 py-1 rounded-full">{students.length}</span>
                </div>
                <button onClick={() => setShowNewStudent(true)} className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700">
                  + Добавить
                </button>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {students.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">Нет учеников</p>
                ) : (
                  students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 transition group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-sm shadow-sm">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white" opacity="0.9"/>
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{student.name}</div>
                          <div className="text-xs text-gray-400">{student.phone || "Нет телефона"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-600 font-medium">{student.level}</span>
                        <button onClick={() => { setShowEditStudent(student); setEditStudent({ name: student.name, phone: student.phone, level: student.level }); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-emerald-600 transition" title="Редактировать">✏️</button>
                        <button onClick={() => handleDeleteStudent(student.id, student.name)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition" title="Удалить">🗑️</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Быстрые действия */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⚡</span>
                <h3 className="text-lg font-semibold">Быстрые действия</h3>
              </div>
              <div className="space-y-3">
                <button onClick={() => setShowNewLesson(true)} className="w-full px-4 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition text-left flex items-center gap-3">
                  ➕ Создать занятие
                </button>
                <button 
                  onClick={() => toast.info("Аналитика будет доступна в следующей версии приложения")} 
                  className="w-full px-4 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition text-left flex items-center gap-3"
                >
                  📊 Аналитика
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модалки (оставлены без изменений) */}
      {showNewLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-5 text-emerald-800">Новое занятие</h2>
            <div className="space-y-4">
              <select className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" value={newLesson.studentId} onChange={e => setNewLesson({ ...newLesson, studentId: e.target.value })}>
                <option value="">Выберите ученика</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="date" className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" value={newLesson.date} onChange={e => setNewLesson({ ...newLesson, date: e.target.value })} />
              <input type="time" className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" value={newLesson.time} onChange={e => setNewLesson({ ...newLesson, time: e.target.value })} />
              <textarea placeholder="Комментарий" className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" rows={2} value={newLesson.comment} onChange={e => setNewLesson({ ...newLesson, comment: e.target.value })} />
              <div className="flex gap-3">
                <button onClick={handleAddLesson} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl">Добавить</button>
                <button onClick={() => setShowNewLesson(false)} className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-5 text-emerald-800">Новый ученик</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Имя" className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
              <input type="tel" placeholder="Телефон" className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" value={newStudent.phone} onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })} />
              <select className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" value={newStudent.level} onChange={e => setNewStudent({ ...newStudent, level: e.target.value })}>
                <option value="A1">A1 - Начальный</option>
                <option value="A2">A2 - Базовый</option>
                <option value="B1">B1 - Средний</option>
                <option value="B2">B2 - Выше среднего</option>
                <option value="C1">C1 - Продвинутый</option>
              </select>
              <div className="flex gap-3">
                <button onClick={handleAddStudent} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl">Добавить</button>
                <button onClick={() => setShowNewStudent(false)} className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-5 text-emerald-800">Редактировать ученика</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Имя" className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" value={editStudent.name} onChange={e => setEditStudent({ ...editStudent, name: e.target.value })} />
              <input type="tel" placeholder="Телефон" className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" value={editStudent.phone} onChange={e => setEditStudent({ ...editStudent, phone: e.target.value })} />
              <select className="w-full p-3 border border-emerald-200 rounded-xl text-emerald-700 bg-white" value={editStudent.level} onChange={e => setEditStudent({ ...editStudent, level: e.target.value })}>
                <option value="A1">A1 - Начальный</option>
                <option value="A2">A2 - Базовый</option>
                <option value="B1">B1 - Средний</option>
                <option value="B2">B2 - Выше среднего</option>
                <option value="C1">C1 - Продвинутый</option>
              </select>
              <div className="flex gap-3">
                <button onClick={handleEditStudent} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl">Сохранить</button>
                <button onClick={() => setShowEditStudent(null)} className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}