import { matches, players, rankings, teams } from "@/lib/mock-data";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import type { EventType, MatchStatus, Player, PlayerStatus, RankingRow, SkillLevel, Team } from "@/lib/types";

const levels: Record<string, SkillLevel> = {
  beginner: "Mới chơi",
  intermediate: "Trung bình",
  advanced: "Khá",
  expert: "Giỏi"
};

const events: Record<string, EventType> = {
  mens_single: "Đơn nam",
  womens_single: "Đơn nữ",
  mens_double: "Đôi nam",
  womens_double: "Đôi nữ",
  mixed_double: "Đôi nam nữ"
};

const statuses: Record<string, PlayerStatus> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối"
};

const matchStatuses: Record<string, MatchStatus> = {
  scheduled: "Sắp diễn ra",
  live: "Đang thi đấu",
  completed: "Đã kết thúc",
  cancelled: "Đã kết thúc"
};

type PlayerRow = {
  id: string;
  full_name: string;
  birth_date: string;
  gender: "Nam" | "Nữ" | "Khác" | string;
  phone: string;
  email: string;
  address: string | null;
  level: string;
  dominant_hand: string;
  event_type: string;
  has_partner: boolean;
  partner_name: string | null;
  note: string | null;
  avatar_url: string | null;
  status: string;
};

export type AdminMatch = {
  id: string;
  code: string;
  startsAt: string;
  court: string;
  eventType: EventType;
  homeTeam: string;
  homeTeamId: string;
  awayTeam: string;
  awayTeamId: string;
  status: MatchStatus;
};

export function mapPlayer(row: PlayerRow): Player {
  return {
    id: row.id,
    fullName: row.full_name,
    birthDate: row.birth_date,
    gender: row.gender === "Nam" || row.gender === "Nữ" || row.gender === "Khác" ? row.gender : "Khác",
    phone: row.phone,
    email: row.email,
    address: row.address ?? "",
    level: levels[row.level] ?? "Trung bình",
    dominantHand: row.dominant_hand === "Tay trái" ? "Tay trái" : "Tay phải",
    eventType: events[row.event_type] ?? "Đơn nam",
    hasPartner: row.has_partner,
    partnerName: row.partner_name ?? undefined,
    note: row.note ?? undefined,
    avatarUrl: row.avatar_url ?? "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=300&q=80",
    status: statuses[row.status] ?? "Chờ duyệt"
  };
}

export async function getAdminPlayers(): Promise<Player[]> {
  if (!hasSupabaseAdminConfig()) return players;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load players", error);
    return players;
  }

  return (data as PlayerRow[]).map(mapPlayer);
}

export async function getAdminTeams(): Promise<Team[]> {
  if (!hasSupabaseAdminConfig()) return teams;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id,name,event_type,status,team_members(players(full_name))")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load teams", error);
    return teams;
  }

  return (data as any[]).map((team) => ({
    id: team.id,
    name: team.name,
    eventType: events[team.event_type] ?? "Đôi nam",
    status: team.status === "approved" || team.status === "Đủ điều kiện" ? "Đủ điều kiện" : team.status === "paused" ? "Tạm dừng" : "Chờ ghép",
    members: (team.team_members ?? []).map((member: any) => member.players?.full_name).filter(Boolean)
  }));
}

export async function getAdminMatches(): Promise<AdminMatch[]> {
  if (!hasSupabaseAdminConfig()) {
    return matches.map((match) => ({
      ...match,
      homeTeamId: match.id,
      awayTeamId: match.id
    }));
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("matches")
    .select("id,code,event_type,starts_at,status,courts(name),home:teams!matches_home_team_id_fkey(id,name),away:teams!matches_away_team_id_fkey(id,name)")
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("Failed to load matches", error);
    return matches.map((match) => ({ ...match, homeTeamId: match.id, awayTeamId: match.id }));
  }

  return (data as any[]).map((match) => ({
    id: match.id,
    code: match.code,
    startsAt: match.starts_at,
    court: match.courts?.name ?? "Chưa xếp sân",
    eventType: events[match.event_type] ?? "Đơn nam",
    homeTeam: match.home?.name ?? "Đội A",
    homeTeamId: match.home?.id ?? "",
    awayTeam: match.away?.name ?? "Đội B",
    awayTeamId: match.away?.id ?? "",
    status: matchStatuses[match.status] ?? "Sắp diễn ra"
  }));
}

export async function getAdminRankings(): Promise<RankingRow[]> {
  if (!hasSupabaseAdminConfig()) return rankings;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("rankings")
    .select("matches,wins,losses,point_difference,points,teams(name)")
    .order("points", { ascending: false })
    .order("point_difference", { ascending: false });

  if (error) {
    console.error("Failed to load rankings", error);
    return rankings;
  }

  return (data as any[]).map((row, index) => ({
    rank: index + 1,
    team: row.teams?.name ?? "Chưa rõ đội",
    matches: row.matches,
    wins: row.wins,
    losses: row.losses,
    difference: row.point_difference,
    points: row.points
  }));
}
