"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  FolderTree,
  PiggyBank,
  Target,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/categories", label: "Categories", icon: FolderTree },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full px-4 py-6 justify-between bg-card text-card-foreground border-r border-border">
      <div className="flex flex-col space-y-8">
        {/* App Title */}
        <div className="px-3">
          <h1 className="text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            Paycheck
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Gestão Financeira CLT
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 w-full text-left"
      >
        <LogOut className="w-5 h-5" />
        <span>Sair</span>
      </button>
    </div>
  );
}
export default SidebarNav;
