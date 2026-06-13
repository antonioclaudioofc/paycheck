import { auth } from "@/lib/auth";
import GoalsClient from "./components/goals-client";

export default async function GoalsPage() {
  const session = await auth();

  return <GoalsClient session={session} />;
}
