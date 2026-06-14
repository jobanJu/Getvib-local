import { NextResponse } from "next/server";
import { isPseudoAvailable } from "@/features/events/server";
import { parsePseudo } from "@/lib/validation";

// Vérifie la disponibilité d'un pseudo (utilisé à l'inscription / dans les
// réglages). Ouvert : pas d'info sensible, juste libre / pris / format invalide.
export async function GET(request: Request) {
  try {
    const raw = new URL(request.url).searchParams.get("pseudo") || "";
    const pseudo = parsePseudo(raw);
    const available = await isPseudoAvailable(pseudo);
    return NextResponse.json({ available, pseudo });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ available: false, error: e?.message || "Pseudo invalide." }, { status: 200 });
  }
}
