"use client";

import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { SpeelavondProvider } from "@/context/SpeelavondContext";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SpeelavondProvider>
      <div className="min-h-screen bg-black text-white">
        <Sidebar />
        <div className="min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:ml-64 lg:pb-0">
          <Header />
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
        <BottomNav />
      </div>
    </SpeelavondProvider>
  );
}
