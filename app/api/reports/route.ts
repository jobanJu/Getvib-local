import { NextResponse } from "next/server";
import { createReport } from "@/features/reports/server";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const report = await createReport(user.id, await request.json());
    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 400 });
  }
}
