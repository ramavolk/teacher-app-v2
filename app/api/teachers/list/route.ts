import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const teachers = await prisma.user.findMany({
    where: { role: "teacher", isActive: true },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(teachers);
}