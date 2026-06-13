import { auth } from "@/lib/auth";
import CategoriesClient from "./components/categories-client";

export default async function CategoriesPage() {
  const session = await auth();

  return <CategoriesClient session={session} />;
}
