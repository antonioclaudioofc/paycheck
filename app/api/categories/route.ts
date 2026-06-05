import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
        active: true,
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

    const { name, color, icon, type } = validated.data;

    const existingCategory = await prisma.category.findUnique({
      where: {
        userId_name_type: {
          userId: session.user.id,
          name,
          type,
        },
      },
    });

    if (existingCategory) {
      if (existingCategory.active) {
        return Response.json(
          { error: "Category already exists with this name and type" },
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
        userId: session.user.id,
        name,
        color,
        icon,
        type,
      },
    });

    return Response.json(category, { status: 201 });
  } catch (error) {
    console.error("[POST /api/categories]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
