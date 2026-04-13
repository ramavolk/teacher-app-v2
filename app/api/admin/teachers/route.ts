import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

async function isAdmin() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("adminId")?.value;
  if (!adminId) return false;
  const admin = await prisma.user.findUnique({ where: { id: adminId, role: "admin" } });
  return !!admin;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }
  
  const teachers = await prisma.user.findMany({
    where: { role: "teacher" },
    select: { id: true, name: true, email: true, isActive: true },
  });
  return NextResponse.json(teachers);
}

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }
  
  const { name, email, password } = await request.json();
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const teacher = await prisma.user.create({
    data: { email, password: hashedPassword, name, role: "teacher", isActive: true },
  });
  return NextResponse.json(teacher);
}

export async function PUT(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }
  
  const { id, name, email, password, isActive } = await request.json();
  const data: any = { name, email, isActive };
  if (password) data.password = await bcrypt.hash(password, 10);
  
  await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}