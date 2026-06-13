import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations";

const DEFAULT_USER_CATEGORIES = [
  { name: "Salário", color: "#10b981" },
  { name: "Freelance", color: "#06b6d4" },
  { name: "Investimentos", color: "#3b82f6" },
  { name: "Outros (Entradas)", color: "#6b7280" },
  { name: "Alimentação", color: "#f97316" },
  { name: "Moradia", color: "#ef4444" },
  { name: "Transporte", color: "#0ea5e9" },
  { name: "Saúde", color: "#14b8a6" },
  { name: "Educação", color: "#a855f7" },
  { name: "Lazer", color: "#ec4899" },
  { name: "Outros (Saídas)", color: "#6b7280" },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await prisma.category.count({
      where: {
        userId: session.user.id,
        active: true,
      },
    });

    if (count === 0) {
      await prisma.category.createMany({
        data: DEFAULT_USER_CATEGORIES.map((cat) => ({
          userId: session.user.id,
          name: cat.name,
          color: cat.color,
          isDefault: false,
        })),
      });
    }

    const categories = await prisma.category.findMany({
      where: {
        active: true,
        OR: [
          { userId: session.user.id },
          { isDefault: true },
        ],
      },
      orderBy: { name: "asc" },
    });

    return Response.json(categories);
  } catch (error) {
    console.error("[GET /api/categories]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createCategorySchema.safeParse(body);

    if (!validated.success) {
      return Response.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const { name, color, icon, isDefault } = validated.data;
    const isUserAdmin = session.user.role === "ADMIN" || session.user.permissions?.includes("manage:categories");

    if (isDefault && !isUserAdmin) {
      return Response.json(
        { error: "Forbidden: Only admins can create system categories" },
        { status: 403 },
      );
    }

    const targetUserId = isDefault ? null : session.user.id;

    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: targetUserId,
        name,
      },
    });

    if (existingCategory) {
      if (existingCategory.active) {
        return Response.json(
          { error: "Category already exists with this name" },
          { status: 400 },
        );
      } else {
        const reactivated = await prisma.category.update({
          where: { id: existingCategory.id },
          data: {
            active: true,
            color,
            icon,
          },
        });
        return Response.json(reactivated, { status: 200 });
      }
    }

    const category = await prisma.category.create({
      data: {
        userId: targetUserId,
        name,
        color,
        icon,
        isDefault: !!isDefault,
      },
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
