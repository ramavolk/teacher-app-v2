import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { phone: "79991234567" },
    update: {},
    create: {
      phone: "79991234567",
      name: "Учитель",
    },
  })
  console.log("Пользователь создан:", user)
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())