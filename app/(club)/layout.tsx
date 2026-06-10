import AppShell from "@/components/AppShell";
import PrintCompetition from "@/components/PrintCompetition";

export default function ClubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      {children}
      <PrintCompetition />
    </AppShell>
  );
}
