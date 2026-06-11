import type { Bord } from "@/types/competition";

export type UndoActie =
  | { type: "borden"; borden: Bord[] }
  | { type: "wedstrijd"; bordNaam: string; wedstrijdId: string; snapshot: Bord };

const MAX_UNDO = 20;

export function pushUndo(
  stack: UndoActie[],
  actie: UndoActie
): UndoActie[] {
  return [...stack.slice(-(MAX_UNDO - 1)), actie];
}

export function popUndo(stack: UndoActie[]): {
  actie: UndoActie | null;
  rest: UndoActie[];
} {
  if (stack.length === 0) return { actie: null, rest: [] };
  const actie = stack[stack.length - 1];
  return { actie, rest: stack.slice(0, -1) };
}
