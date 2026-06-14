import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  const store = await cookies();
  const allCookies = (await store).getAll().map(c => ({ name: c.name, value: c.value.substring(0, 10) + "..." }));

  return NextResponse.json({
    message: "DEBUG AUTH NEW ROUTE",
    timestamp: new Date().toISOString(),
    userEmail: user?.email || null,
    cookiesFound: allCookies,
    envUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "MISSING",
    error: error?.message || null
  });
}
