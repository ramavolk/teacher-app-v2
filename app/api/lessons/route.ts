import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Получить ID текущего учителя из cookie
async function getTeacherId() {
  const cookieStore = await cookies();
  const teacherId = cookieStore.get("teacherId")?.value;
  return teacherId;
}

// GET - получить занятия за дату
export async function GET(request: Request) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  
  const lessons = await prisma.lesson.findMany({
    where: {
      userId: teacherId,
      date: date ? new Date(date) : undefined,
    },
    include: {
      student: {
        select: { id: true, name: true },
      },
    },
    orderBy: { time: "asc" },
  });
  
  // Форматируем ответ
  const formattedLessons = lessons.map(lesson => ({
    id: lesson.id,
    studentId: lesson.studentId,
    student: lesson.student.name,
    date: lesson.date.toISOString().split("T")[0],
    time: lesson.time,
    comment: lesson.comment || "",
  }));
  
  return NextResponse.json(formattedLessons);
}

// POST - добавить занятие
export async function POST(request: Request) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { studentId, date, time, comment } = await request.json();
  
  // Проверяем, что ученик принадлежит этому учителю
  const student = await prisma.student.findFirst({
    where: { id: studentId, userId: teacherId },
  });
  
  if (!student) {
    return NextResponse.json({ error: "Ученик не найден" }, { status: 404 });
  }
  
  const lesson = await prisma.lesson.create({
    data: {
      studentId,
      userId: teacherId,
      date: new Date(date),
      time,
      comment: comment || "",
    },
    include: {
      student: {
        select: { name: true },
      },
    },
  });
  
  return NextResponse.json({
    id: lesson.id,
    studentId: lesson.studentId,
    student: lesson.student.name,
    date: lesson.date.toISOString().split("T")[0],
    time: lesson.time,
    comment: lesson.comment,
  });
}

// PUT - обновить занятие (перенос или комментарий)
export async function PUT(request: Request) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id, date, time, comment } = await request.json();
  
  // Проверяем, что занятие принадлежит этому учителю
  const existing = await prisma.lesson.findFirst({
    where: { id, userId: teacherId },
  });
  
  if (!existing) {
    return NextResponse.json({ error: "Занятие не найдено" }, { status: 404 });
  }
  
  const updateData: any = {};
  if (date) updateData.date = new Date(date);
  if (time) updateData.time = time;
  if (comment !== undefined) updateData.comment = comment;
  
  const lesson = await prisma.lesson.update({
    where: { id },
    data: updateData,
  });
  
  return NextResponse.json({ success: true, lesson });
}

// DELETE - удалить занятие
export async function DELETE(request: Request) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "ID не указан" }, { status: 400 });
  }
  
  // Проверяем, что занятие принадлежит этому учителю
  const existing = await prisma.lesson.findFirst({
    where: { id, userId: teacherId },
  });
  
  if (!existing) {
    return NextResponse.json({ error: "Занятие не найдено" }, { status: 404 });
  }
  
  await prisma.lesson.delete({
    where: { id },
  });
  
  return NextResponse.json({ success: true });
}