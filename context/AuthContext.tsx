"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "@/lib/ui-feedback";

export type GebruikersRol = "speler" | "bestuur";

const STORAGE_KEY = "deZumpeAuth";
const ADMIN_CODE = "0000";

interface AuthState {
  rol: GebruikersRol;
}

interface AuthContextValue {
  rol: GebruikersRol;
  isBestuur: boolean;
  isGeladen: boolean;
  loginBestuur: (code: string) => boolean;
  logoutBestuur: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function laadAuthState(): AuthState {
  if (typeof window === "undefined") return { rol: "speler" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { rol: "speler" };
    const parsed = JSON.parse(raw) as AuthState;
    if (parsed.rol === "bestuur") return { rol: "bestuur" };
    return { rol: "speler" };
  } catch {
    return { rol: "speler" };
  }
}

function slaAuthStateOp(state: AuthState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [rol, setRol] = useState<GebruikersRol>("speler");
  const [isGeladen, setIsGeladen] = useState(false);

  useEffect(() => {
    const state = laadAuthState();
    /* eslint-disable react-hooks/set-state-in-effect -- localStorage hydratie na client mount */
    setRol(state.rol);
    setIsGeladen(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const loginBestuur = useCallback((code: string): boolean => {
    if (code !== ADMIN_CODE) {
      toast("Onjuiste code. Probeer opnieuw.", "error");
      return false;
    }
    setRol("bestuur");
    slaAuthStateOp({ rol: "bestuur" });
    toast("Welkom, bestuur!", "success");
    return true;
  }, []);

  const logoutBestuur = useCallback(() => {
    setRol("speler");
    slaAuthStateOp({ rol: "speler" });
    toast("Je bent uitgelogd als bestuur.", "info");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      rol,
      isBestuur: rol === "bestuur",
      isGeladen,
      loginBestuur,
      logoutBestuur,
    }),
    [rol, isGeladen, loginBestuur, logoutBestuur]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth moet binnen AuthProvider gebruikt worden.");
  }
  return context;
}
