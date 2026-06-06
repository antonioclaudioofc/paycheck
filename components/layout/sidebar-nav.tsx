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
  Landmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { href: "/categories", label: "Categorias", icon: FolderTree },
  { href: "/budgets", label: "Orçamentos", icon: PiggyBank },
  { href: "/goals", label: "Metas", icon: Target },
];

interface SidebarNavProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export function SidebarNav({ isCollapsed, toggleCollapse }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div
      className={`relative flex flex-col h-full py-6 justify-between bg-card text-card-foreground border-r border-border transition-all duration-300 ${
        isCollapsed ? "px-2" : "px-4"
      }`}
    >
      <button
        onClick={toggleCollapse}
        className="absolute top-8 -right-5 z-40 bg-card border border-border rounded-full w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105"
        title={isCollapsed ? "Expandir" : "Recolher"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      <div className="flex flex-col space-y-8">
        <div
          className={`flex items-center ${isCollapsed ? "flex-col space-y-4" : "px-1"}`}
        >
          <div
            className={`flex items-center ${isCollapsed ? "flex-col" : "space-x-3.5"}`}
          >
            <Landmark className="w-8 h-8 text-primary shrink-0" />
            {!isCollapsed && (
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground leading-none">
                  Paycheck
                </h1>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium tracking-wide uppercase">
                  Gestão CLT
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex flex-col space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center rounded-xl text-base font-semibold transition-all duration-200 ${
                  isCollapsed
                    ? "justify-center p-3 w-12 h-12"
                    : "space-x-3.5 px-4 py-3.5"
                } ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow shadow-primary/10"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title={item.label}
              >
                <Icon className="w-6 h-6 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col space-y-4 items-center">
        <div
          className={`flex items-center w-full ${isCollapsed ? "justify-center" : "justify-between px-2"}`}
        >
          {!isCollapsed && (
            <span className="text-xs text-muted-foreground font-bold tracking-wider">
              TEMA
            </span>
          )}
          <ThemeToggle />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={`flex items-center rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 transition-all duration-200 cursor-pointer ${
            isCollapsed
              ? "justify-center p-3 w-12 h-12"
              : "space-x-3.5 px-4 py-3.5 w-full text-left"
          }`}
          title="Sair"
        >
          <LogOut className="w-6 h-6 shrink-0" />
          {!isCollapsed && (
            <span className="text-base font-semibold">Sair</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default SidebarNav;
