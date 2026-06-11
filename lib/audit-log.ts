import type { AuditLogEntry } from "@/types/competition";

const AUDIT_KEY = "deZumpeAuditLog";
const MAX_ENTRIES = 200;

export function laadAuditLog(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as AuditLogEntry[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function logAuditActie(
  actie: string,
  details: string,
  door?: string
): void {
  const entry: AuditLogEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actie,
    details,
    door,
  };
  const log = [entry, ...laadAuditLog()].slice(0, MAX_ENTRIES);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(log));
}
