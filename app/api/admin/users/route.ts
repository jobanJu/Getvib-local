import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin";
import { searchAdminProfiles, setUserBanStatus } from "@/features/admin/server";

export async function GET(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  
  try {
    const users = await searchAdminProfiles(q);
    return NextResponse.json(users);
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Erreur lors de la récupération des utilisateurs." }, { status: 400 });
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const { userId, banned, until } = (await request.json()) as { 
      userId?: string; 
      banned?: boolean; 
      until?: string | null 
    };
    if (!userId) return NextResponse.json({ error: "userId manquant." }, { status: 400 });

    await setUserBanStatus(userId, !!banned, until);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const e = error as { message?: string };
    return NextResponse.json({ error: e?.message || "Erreur lors de la modification du statut de l'utilisateur." }, { status: 400 });
  }
}
