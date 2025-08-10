"use client";

import { SidebarContent } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div>
      {/* Sidebar untuk tampilan desktop (fixed) */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="border-r border-gray-200">
          <SidebarContent />
        </div>
      </div>

      {/* Konten Utama */}
      <main className="min-h-screen">
        <div className="lg:ml-64">
          <Topbar />
          <main className="p-6">{children}</main>
        </div>
      </main>
    </div>
  );
}
