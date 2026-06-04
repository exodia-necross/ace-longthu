import { NextResponse } from "next/server";
import { getAdminMatches, getAdminPlayers, getAdminRankings, getAdminTeams } from "@/lib/admin-data";

function toCsv(rows: Record<string, unknown>[]) {
  const headers = Object.keys(rows[0] ?? {});
  const body = rows.map((row) =>
    headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")
  );
  return [headers.join(","), ...body].join("\n");
}

export async function GET(request: Request) {
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
