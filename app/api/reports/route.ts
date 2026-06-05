import { NextResponse } from "next/server";
import { getAdminMatches, getAdminPlayers, getAdminRankings, getAdminTeams } from "@/lib/admin-data";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function toCsv(rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const body = rows.map((row) =>
    headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")
  );
  return [headers.join(","), ...body].join("\n");
}

export async function GET(request: Request) {
  if (hasSupabaseAdminConfig()) {
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: profile } = await adminClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || !["admin", "organizer"].includes(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const type = new URL(request.url).searchParams.get("type") ?? "players";
  const players = await getAdminPlayers();
  const teams = await getAdminTeams();
  const matches = await getAdminMatches();
  const rankings = await getAdminRankings();
  const data = {
    players,
    teams,
    matches,
    rankings
  }[type as "players" | "teams" | "matches" | "rankings"] ?? players;

  return new NextResponse(toCsv(data as unknown as Record<string, unknown>[]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ace-${type}.csv"`
    }
  });
}
