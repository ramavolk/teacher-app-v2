import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { teacherId, password } = await request.json();
  
  const teacher = await prisma.user.findFirst({
    where: { id: teacherId, role: "teacher", isActive: true }
  });
  
  if (!teacher) {
    return NextResponse.json({ error: "Учитель не найден" }, { status: 401 });
  }
  
  const isValid = await bcrypt.compare(password, teacher.password);
  if (!isValid) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  
  (await cookies()).set("teacherId", teacher.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  
  return NextResponse.json({ success: true, teacher: { id: teacher.id, name: teacher.name } });
}

export async function GET() {
  const cookieStore = await cookies();
  const teacherId = cookieStore.get("teacherId")?.value;
  
  if (!teacherId) {
    return NextResponse.json({ teacher: null });
  }
  
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { id: true, name: true, email: true }
  });
  
  return NextResponse.json({ teacher });
}

export async function DELETE() {
  (await cookies()).delete("teacherId");
  return NextResponse.json({ success: true });
}