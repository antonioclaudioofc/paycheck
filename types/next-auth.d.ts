import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: UserRole;
    permissions?: string[];
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      permissions: string[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    permissions: string[];
  }
}
