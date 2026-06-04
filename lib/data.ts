import { announcements, tournament } from "@/lib/mock-data";
import { getAdminMatches, getAdminPlayers, getAdminRankings, getAdminTeams } from "@/lib/admin-data";

export async function getPublicData() {
  const [players, teams, matches, rankings] = await Promise.all([
    getAdminPlayers(),
    getAdminTeams(),
    getAdminMatches(),
    getAdminRankings()
  ]);

  return {
    tournament,
    announcements,
    players: players.filter((player) => player.status === "Đã duyệt"),
    teams,
    matches,
    rankings
  };
}

export async function getDashboardStats() {
  const [players, teams, matches] = await Promise.all([
    getAdminPlayers(),
    getAdminTeams(),
    getAdminMatches()
  ]);

  return {
    pendingPlayers: players.filter((player) => player.status === "Chờ duyệt").length,
    approvedPlayers: players.filter((player) => player.status === "Đã duyệt").length,
    teams: teams.length,
    scheduledMatches: matches.length,
    completedMatches: matches.filter((match) => match.status === "Đã kết thúc").length
  };
}
