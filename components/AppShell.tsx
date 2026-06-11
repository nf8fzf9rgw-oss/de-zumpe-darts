"use client";

import { usePathname } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";
import PrintCompetition from "@/components/PrintCompetition";
import PrintPreviewModal from "@/components/PrintPreviewModal";
import Sidebar from "@/components/Sidebar";
import { SpeelavondProvider } from "@/context/SpeelavondContext";

function ShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAanmelden = pathname.startsWith("/aanmelden");

  if (isAanmelden) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Sidebar />
      <div className="min-h-screen pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:ml-64 lg:pb-0">
        <Header />
        <main className="no-print p-4 md:p-6 lg:p-8">{children}</main>
      </div>
      <BottomNav />
      <PrintCompetition />
      <PrintPreviewModal />
    </div>
  );
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SpeelavondProvider>
      <ShellContent>{children}</ShellContent>
    </SpeelavondProvider>
  );
}
