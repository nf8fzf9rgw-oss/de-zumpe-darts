import AdminDashboard from "@/components/AdminDashboard";
import ProtectedPage from "@/components/ProtectedPage";

export default function BeheerPage() {
  return (
    <ProtectedPage
      titel="Beheer dashboard"
      bericht="Het wedstrijdleiding-dashboard is alleen toegankelijk voor bestuur. Log in via Meer of de header."
    >
      <AdminDashboard />
    </ProtectedPage>
  );
}
