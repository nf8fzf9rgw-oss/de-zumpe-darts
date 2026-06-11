/** Cross-tab realtime sync via BroadcastChannel (fallback: storage events). */

const CHANNEL_NAME = "de-zumpe-sync";

let channel: BroadcastChannel | null = null;

export type SyncEvent = { type: "reload" };

export function initRealtimeSync(onReload: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  if ("BroadcastChannel" in window) {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent<SyncEvent>) => {
      if (event.data?.type === "reload") onReload();
    };
  }

  const onStorage = (e: StorageEvent) => {
    if (
      e.key === "deZumpeSpeelavond" ||
      e.key === "deZumpeHistorie" ||
      e.key === "deZumpeAanmeld"
    ) {
      onReload();
    }
  };

  window.addEventListener("storage", onStorage);

  return () => {
    channel?.close();
    channel = null;
    window.removeEventListener("storage", onStorage);
  };
}

export function broadcastReload(): void {
  channel?.postMessage({ type: "reload" });
}
