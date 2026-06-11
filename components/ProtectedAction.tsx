"use client";

import { useAuth } from "@/context/AuthContext";

interface ProtectedActionProps {
  children: React.ReactNode;
}

/** Verbergt inhoud volledig voor spelers — alleen zichtbaar voor bestuur. */
export default function ProtectedAction({ children }: ProtectedActionProps) {
  const { isBestuur } = useAuth();
  if (!isBestuur) return null;
  return <>{children}</>;
}
