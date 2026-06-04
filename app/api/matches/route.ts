import { NextResponse } from "next/server";
import { matches } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ data: matches });
}
