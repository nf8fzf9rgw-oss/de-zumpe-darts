"use client";

import { useCallback, useRef, useState } from "react";
import type { UndoActie } from "@/lib/undo";
import { popUndo, pushUndo } from "@/lib/undo";

export function useUndoStack() {
  const [stack, setStack] = useState<UndoActie[]>([]);
  const stackRef = useRef<UndoActie[]>([]);

  const sync = useCallback((next: UndoActie[]) => {
    stackRef.current = next;
    setStack(next);
  }, []);

  const push = useCallback(
    (actie: UndoActie) => {
      sync(pushUndo(stackRef.current, actie));
    },
    [sync]
  );

  const undo = useCallback((): UndoActie | null => {
    const { actie, rest } = popUndo(stackRef.current);
    sync(rest);
    return actie;
  }, [sync]);

  const clear = useCallback(() => sync([]), [sync]);

  return { stack, push, undo, clear, canUndo: stack.length > 0 };
}
