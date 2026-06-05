import { NextResponse } from "next/server";
import { getAdminMatches } from "@/lib/admin-data";

export async function GET() {
  const matches = await getAdminMatches();
  return NextResponse.json({ data: matches });
}
