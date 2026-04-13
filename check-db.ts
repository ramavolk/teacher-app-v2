import { prisma } from "./lib/prisma";

async function check() {
  const users = await prisma.user.findMany();
  console.log("Пользователи в БД:", users);
}

check();