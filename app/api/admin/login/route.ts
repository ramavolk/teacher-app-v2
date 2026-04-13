import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  console.log("🔍 Поиск админа:", email);
  
  const admin = await prisma.user.findFirst({
    where: { email, role: "admin" }
  });
  
  if (!admin) {
    console.log("❌ Админ не найден");
    return NextResponse.json({ error: "Админ не найден" }, { status: 401 });
  }
  
  console.log("✅ Админ найден:", admin.email);
  
  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    console.log("❌ Неверный пароль");
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }
  
  console.log("✅ Пароль верный");
  
  (await cookies()).set("adminId", admin.id, {
    httpOnly: true,
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  
  return NextResponse.json({ success: true, admin: { id: admin.id, name: admin.name } });
}

export async function GET() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("adminId")?.value;
  
  if (!adminId) {
    return NextResponse.json({ admin: null });
  }
  
  const admin = await prisma.user.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, role: true }
  });
  
  return NextResponse.json({ admin });
}

export async function DELETE() {
  (await cookies()).delete("adminId");
  return NextResponse.json({ success: true });
}