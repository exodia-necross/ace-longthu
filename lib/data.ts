import { tournament } from "@/lib/mock-data";
import { getAdminAnnouncements, getAdminMatches, getAdminPlayers, getAdminRankings, getAdminTeams, getAdminTournament, getBannerSettings } from "@/lib/admin-data";

export async function getPublicData() {
  const [currentTournament, bannerSettings, announcements, players, teams, matches, rankings] = await Promise.all([
    getAdminTournament(),
    getBannerSettings(),
    getAdminAnnouncements({ publicOnly: true }),
    getAdminPlayers(),
    getAdminTeams(),
    getAdminMatches(),
    getAdminRankings()
  ]);

  return {
    tournament: {
      ...tournament,
      name: currentTournament.name,
      slogan: currentTournament.slogan,
      startsAt: currentTournament.startsAt,
      venue: currentTournament.venue,
      registrationOpen: currentTournament.registrationOpen
    },
    banners: bannerSettings,
    announcements,
    players: players.filter((player) => player.status === "Đã duyệt"),
    teams: teams.filter((team) => team.status === "Đủ điều kiện"),
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
