import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// Получить ID текущего учителя из cookie
async function getTeacherId() {
  const cookieStore = await cookies();
  const teacherId = cookieStore.get("teacherId")?.value;
  return teacherId;
}

// GET - получить всех учеников текущего учителя
export async function GET(request: Request) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  
  // Если передан id - возвращаем одного ученика
  if (id) {
    const student = await prisma.student.findFirst({
      where: { id, userId: teacherId },
    });
    return NextResponse.json(student);
  }
  
  // Иначе возвращаем всех учеников
  const students = await prisma.student.findMany({
    where: { userId: teacherId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(students);
}

// POST - добавить ученика
export async function POST(request: Request) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { name, phone, level } = await request.json();
  
  const student = await prisma.student.create({
    data: {
      name,
      phone: phone || "",
      level: level || "A1",
      userId: teacherId,
    },
  });
  
  return NextResponse.json(student);
}

// PUT - обновить ученика
export async function PUT(request: Request) {
  const teacherId = await getTeacherId();
  if (!teacherId) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  const { id, name, phone, level } = await request.json();
  
  // Проверяем, что ученик принадлежит этому учителю
  const existing = await prisma.student.findFirst({
    where: { id, userId: teacherId },
  });
  
  if (!existing) {
    return NextResponse.json({ error: "Ученик не найден" }, { status: 404 });
  }
  
  const student = await prisma.student.update({
    where: { id },
    data: { name, phone, level },
  });
  
  return NextResponse.json(student);
}

// DELETE - удалить ученика
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
  
  // Проверяем, что ученик принадлежит этому учителю
  const existing = await prisma.student.findFirst({
    where: { id, userId: teacherId },
  });
  
  if (!existing) {
    return NextResponse.json({ error: "Ученик не найден" }, { status: 404 });
  }
  
  // Сначала удаляем все занятия этого ученика
  await prisma.lesson.deleteMany({
    where: { studentId: id },
  });
  
  // Затем удаляем ученика
  await prisma.student.delete({
    where: { id },
  });
  
  return NextResponse.json({ success: true });
}