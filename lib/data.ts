import { announcements, matches, players, rankings, teams, tournament } from "@/lib/mock-data";

export async function getPublicData() {
  return { tournament, announcements, matches, players, rankings, teams };
}

export async function getDashboardStats() {
  return {
    pendingPlayers: players.filter((player) => player.status === "Chờ duyệt").length,
    approvedPlayers: players.filter((player) => player.status === "Đã duyệt").length,
    teams: teams.length,
    scheduledMatches: matches.length,
    completedMatches: matches.filter((match) => match.status === "Đã kết thúc").length
  };
}
