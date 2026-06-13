import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = createCategorySchema.partial().safeParse(body);

    if (!validated.success) {
      return Response.json(
        { error: "Invalid data", details: validated.error.flatten() },
        { status: 400 },
      );
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || !category.active) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    const isUserAdmin = session.user.role === "ADMIN" || session.user.permissions?.includes("manage:categories");

    // Check permissions
    if (category.isDefault) {
      if (!isUserAdmin) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      if (category.userId !== session.user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        color: validated.data.color,
        icon: validated.data.icon,
        isDefault: isUserAdmin ? validated.data.isDefault : category.isDefault,
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("[PUT /api/categories/[id]]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category || !category.active) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    const isUserAdmin = session.user.role === "ADMIN" || session.user.permissions?.includes("manage:categories");

    // Check permissions
    if (category.isDefault) {
      if (!isUserAdmin) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    } else {
      if (category.userId !== session.user.id) {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Soft delete (set active to false)
    const deleted = await prisma.category.update({
      where: { id },
      data: { active: false },
    });

    return Response.json({ message: "Category deleted successfully", data: deleted });
  } catch (error) {
    console.error("[DELETE /api/categories/[id]]", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
