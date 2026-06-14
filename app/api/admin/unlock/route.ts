import { NextResponse } from "next/server";
import { requireAdminEmailApi, checkAdminPasswords, makeUnlockToken, ADMIN_UNLOCK_COOKIE } from "@/lib/admin";

// Déverrouille le back-office : exige un compte admin connecté + les DEUX mots de
// passe. En cas de succès, pose un cookie httpOnly signé (valable 8h).
export async function POST(request: Request) {
  const { response } = await requireAdminEmailApi();
  if (response) return response;

  try {
    const { p1, p2 } = (await request.json()) as { p1?: string; p2?: string };
    if (!checkAdminPasswords(String(p1 || ""), String(p2 || ""))) {
      return NextResponse.json({ error: "Mots de passe incorrects." }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_UNLOCK_COOKIE, makeUnlockToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 8 * 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Erreur." }, { status: 400 });
  }
}
