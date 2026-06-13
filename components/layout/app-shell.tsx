"use client";

import React, { useState, useEffect } from "react";
import { BottomNav } from "./bottom-nav";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Landmark } from "lucide-react";
import SidebarNav from "./sidebar-nav";
import { Session } from "next-auth";

export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem("sidebar-collapsed", String(newVal));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-card border-b border-border z-30">
        <div className="flex items-center space-x-2">
          <Landmark className="w-6 h-6 text-primary shrink-0" />
          <span className="font-bold text-lg">Paycheck</span>
        </div>
        <ThemeToggle />
      </header>

      <aside
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30 transition-all duration-300 ${
          isCollapsed ? "md:w-20" : "md:w-64"
        }`}
      >
        <SidebarNav
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
          user={session?.user}
        />
      </aside>

      <main
        className={`flex-1 pb-20 md:pb-6 p-4 md:p-8 overflow-y-auto transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-64"
        }`}
      >
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/90 backdrop-blur-md border-t border-border flex md:hidden">
        <BottomNav user={session?.user} />
      </nav>
    </div>
  );
}
export default AppShell;
