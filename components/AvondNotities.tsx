"use client";

import ProtectedAction from "@/components/ProtectedAction";
import { useSpeelavond } from "@/context/SpeelavondContext";

export default function AvondNotities() {
  const { notities, setNotities } = useSpeelavond();

  return (
    <ProtectedAction>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <label className="mb-2 block text-sm font-bold text-white">
          Notities speelavond
        </label>
        <textarea
          value={notities}
          onChange={(e) => setNotities(e.target.value)}
          rows={2}
          placeholder="Bijv. koffie defect, extra bord 9…"
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none"
        />
      </div>
    </ProtectedAction>
  );
}
