"use client";

import { useAuth } from "@/context/AuthContext";
import { useSpeelavond } from "@/context/SpeelavondContext";
import { avondWeergaveStatus } from "@/lib/wedstrijd-overzicht";

export function useAvondWeergave() {
  const { borden, gestartOp, openbareEindtijd, laatsteOpslag, isOpenbaarActief } =
    useSpeelavond();
  const { isBestuur } = useAuth();
  const status = avondWeergaveStatus(borden, {
    gestartOp,
    openbareEindtijd,
    datum: laatsteOpslag,
    isBestuur,
  });

  return {
    status,
    isBestuur,
    isOpenbaarActief,
    toonLiveBorden: isBestuur || isOpenbaarActief,
    toonWaarMoetIkSpelen: isBestuur || isOpenbaarActief,
  };
}
