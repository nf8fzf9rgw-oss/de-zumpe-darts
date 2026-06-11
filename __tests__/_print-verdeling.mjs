import { berekenBordVerdeling } from "../lib/competition.ts";

for (let n = 25; n <= 35; n += 1) {
  console.log(`${n} -> ${JSON.stringify(berekenBordVerdeling(n))}`);
}
