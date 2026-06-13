import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    data: {
      role: "ADMIN",
    },
  });
  console.log(
    `Sucesso: ${result.count} usuários foram promovidos a ADMIN no banco de dados local!`,
  );
}

main()
  .catch((e) => {
    console.error("Erro ao promover usuários:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
