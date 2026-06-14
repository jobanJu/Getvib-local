import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

// DIAGNOSTIC TEMPORAIRE — à supprimer après debug.
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const store = await cookies();
  const allCookies = store.getAll().map((c) => c.name);
  const authCookies = allCookies.filter((n) => n.startsWith("sb-"));

  const response = NextResponse.json({
    timestamp: new Date().toISOString(),
    loggedIn: !!user,
    yourEmail: user?.email ?? null,
    isAdmin: isAdminEmail(user?.email),
    adminEmailsEnvSet: !!process.env.ADMIN_EMAILS,
    adminEmailsValue: process.env.ADMIN_EMAILS || "Using default",
    supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    nodeEnv: process.env.NODE_ENV,
    authError: error?.message ?? null,
    cookieCount: allCookies.length,
    allCookies,
    authCookies,
  });

  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
