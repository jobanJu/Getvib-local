import { createHmac, timingSafeEqual } from "crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/email";

// ─────────────────────────────────────────────────────────────────────────────
// Verrou du back-office : DEUX niveaux.
//   1) être connecté avec un compte admin (ADMIN_EMAILS),
//   2) avoir déverrouillé /admin avec les DEUX mots de passe (cookie signé).
// ─────────────────────────────────────────────────────────────────────────────

export const ADMIN_UNLOCK_COOKIE = "gv_admin_unlock";
const UNLOCK_TTL_MS = 8 * 60 * 60 * 1000; // 8h

function adminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || ADMIN_EMAIL;
  return raw.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  return !!email && adminEmails().includes(email.toLowerCase());
}

// ─── Mots de passe (double) ───
/** Vérifie les DEUX mots de passe admin contre les variables d'environnement. */
export function checkAdminPasswords(p1: string, p2: string): boolean {
  const e1 = process.env.ADMIN_PASSWORD_1;
  const e2 = process.env.ADMIN_PASSWORD_2;
  if (!e1 || !e2) return false; // non configurés → impossible de déverrouiller
  return safeEqual(p1, e1) && safeEqual(p2, e2);
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

// ─── Cookie de déverrouillage signé (HMAC) ───
function unlockSecret(): string {
  return process.env.ADMIN_COOKIE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "gv-dev-secret";
}

export function makeUnlockToken(): string {
  const exp = String(Date.now() + UNLOCK_TTL_MS);
  const sig = createHmac("sha256", unlockSecret()).update(exp).digest("hex");
  return `${exp}.${sig}`;
}

function verifyUnlockToken(token?: string): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = createHmac("sha256", unlockSecret()).update(exp).digest("hex");
  return safeEqual(sig, expected);
}

async function hasUnlockCookie(): Promise<boolean> {
  const store = await cookies();
  return verifyUnlockToken(store.get(ADMIN_UNLOCK_COOKIE)?.value);
}

// ─── Gates ───

/** Compte admin connecté (sans exiger le déverrouillage). Pour la page/route de
 *  déverrouillage elle-même. */
export async function requireAdminEmailApi() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!isAdminEmail(user.email)) return { user: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user, response: null };
}

/** Page de déverrouillage : compte admin connecté, sans exiger le cookie. */
export async function requireAdminEmailPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/discover");
  return user;
}

export async function isUnlocked() {
  return hasUnlockCookie();
}

/** Page /admin/* : exige compte admin ET déverrouillage (sinon → /admin/unlock). */
export async function requireAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/discover");
  if (!(await hasUnlockCookie())) redirect("/admin/unlock");
  return user;
}

/** Route API admin : exige compte admin ET déverrouillage. */
export async function requireAdminApi() {
  const { user, response } = await requireAdminEmailApi();
  if (response) return { user: null, response };
  if (!(await hasUnlockCookie())) {
    return { user: null, response: NextResponse.json({ error: "Locked" }, { status: 403 }) };
  }
  return { user, response: null };
}
