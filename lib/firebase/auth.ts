import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function requireUser() {
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  try {
    const user = await getAdminAuth().verifyIdToken(token);
    return { user, response: null };
  } catch {
    return { user: null, response: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  }
}
