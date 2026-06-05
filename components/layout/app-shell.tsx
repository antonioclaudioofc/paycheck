import React from "react";
import { SidebarNav } from "./sidebar-nav";
import { BottomNav } from "./bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <SidebarNav />
      </aside>

      <main className="flex-1 md:ml-64 pb-20 md:pb-6 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/90 backdrop-blur-md border-t border-border flex md:hidden">
        <BottomNav />
      </nav>
    </div>
  );
}
export default AppShell;
