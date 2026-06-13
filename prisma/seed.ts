import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "Salário", color: "#10b981", isDefault: true },
  { name: "Freelance", color: "#06b6d4", isDefault: true },
  { name: "Investimentos", color: "#3b82f6", isDefault: true },
  { name: "Outros (Entradas)", color: "#6b7280", isDefault: true },
  { name: "Alimentação", color: "#f97316", isDefault: true },
  { name: "Moradia", color: "#ef4444", isDefault: true },
  { name: "Transporte", color: "#0ea5e9", isDefault: true },
  { name: "Saúde", color: "#14b8a6", isDefault: true },
  { name: "Educação", color: "#a855f7", isDefault: true },
  { name: "Lazer", color: "#ec4899", isDefault: true },
  { name: "Outros (Saídas)", color: "#6b7280", isDefault: true },
];

async function main() {
  console.log("Iniciando seed de categorias padrão...");

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: null,
        name: cat.name,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          color: cat.color,
          isDefault: true,
          userId: null,
        },
      });
      console.log(`Categoria criada: ${cat.name}`);
    } else {
      console.log(`Categoria já existe: ${cat.name}`);
    }
  }

  console.log("Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro ao rodar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
