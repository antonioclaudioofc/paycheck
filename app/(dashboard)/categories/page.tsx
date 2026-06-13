import { auth } from "@/lib/auth";
import CategoriesClient from "./categories-client";

export default async function CategoriesPage() {
  const session = await auth();

  return <CategoriesClient session={session} />;
}
