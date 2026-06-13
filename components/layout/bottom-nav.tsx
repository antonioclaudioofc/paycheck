"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FolderTree,
  PiggyBank,
  Target,
  Shield,
} from "lucide-react";
import { Session } from "next-auth";

const navItems = [
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/categories", label: "Categorias", icon: FolderTree },
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budgets", label: "Orçamentos", icon: PiggyBank },
  { href: "/goals", label: "Metas", icon: Target },
];

export function BottomNav({ user }: { user?: Session["user"] }) {
  const pathname = usePathname();

  const items = [...navItems];
  if (user?.role === "ADMIN") {
    items.push({ href: "/admin", label: "Admin", icon: Shield });
  }

  return (
    <div className="flex w-full items-center justify-around h-16 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all duration-200 ${
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${isActive ? "scale-110" : ""}`} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
export default BottomNav;
