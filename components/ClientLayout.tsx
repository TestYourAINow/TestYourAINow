'use client'

import { ReactNode } from "react";
import { Toaster } from "sonner";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/context/SidebarContext";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex bg-premium-gradient text-white min-h-screen">
      {/* Sidebar container toujours à 270px */}
      <div className="w-[270px]">
        <Sidebar />
      </div>

      {/* Main content - pas bougé */}
      <main className="flex-1 p-6 transition-all duration-300 ease-in-out">
        <Toaster position="top-center" richColors style={{ zIndex: 9999 }} />
        {children}
      </main>
    </div>
  );
}