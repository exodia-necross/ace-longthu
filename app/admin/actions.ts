"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

const adminPaths = [
  "/admin/dashboard",
  "/admin/members",
  "/admin/pairing",
  "/admin/schedule",
  "/admin/results",
  "/admin/ranking",
  "/admin/settings",
  "/admin/announcements",
  "/admin/reports",
  "/",
  "/players",
  "/schedule",
  "/ranking",
  "/teams",
  "/results"
];

function revalidateAdmin() {
  adminPaths.forEach((path) => revalidatePath(path));
}

function cleanFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uploadBannerFile(file: File, prefix: string) {
  if (file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error("Banner phải là file ảnh.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Banner tối đa 10MB.");

  const supabase = createSupabaseAdminClient();
  const { data: bucket } = await supabase.storage.getBucket("banners");
  if (!bucket) {
    const { error: bucketError } = await supabase.storage.createBucket("banners", { public: true });
    if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
      throw new Error(`Không thể tạo bucket banner: ${bucketError.message}`);
    }
  }

  const extension = cleanFileName(file.name).split(".").pop() || "png";
  const path = `${prefix}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("banners").upload(path, buffer, {
    contentType: file.type,
    upsert: false
  });

  if (error) throw new Error(`Không thể upload banner: ${error.message}`);

  const { data } = supabase.storage.from("banners").getPublicUrl(path);
  return data.publicUrl;
}

function parseSetDifference(setScore: string) {
  const [first, second] = setScore.split(/[-:]/).map((value) => Number.parseInt(value.trim(), 10));
  if (!Number.isFinite(first) || !Number.isFinite(second)) return 0;
  return Math.abs(first - second);
}

async function recalculateRankingsForTournament(tournamentId: string) {
  const supabase = createSupabaseAdminClient();
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id")
    .eq("tournament_id", tournamentId);

  if (teamsError) throw new Error(teamsError.message);

  const rankingByTeam = new Map<string, { matches: number; wins: number; losses: number; point_difference: number; points: number }>();
  for (const team of teams ?? []) {
    rankingByTeam.set(team.id, { matches: 0, wins: 0, losses: 0, point_difference: 0, points: 0 });
  }

  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select("id,home_team_id,away_team_id,match_results(winner_team_id,set1,set2,set3)")
    .eq("tournament_id", tournamentId)
    .eq("status", "completed");

  if (matchesError) throw new Error(matchesError.message);

  for (const match of matches ?? []) {
    const result = Array.isArray(match.match_results) ? match.match_results[0] : match.match_results;
    if (!result?.winner_team_id) continue;

    const winnerId = result.winner_team_id;
    const loserId = winnerId === match.home_team_id ? match.away_team_id : match.home_team_id;
    const winnerRanking = rankingByTeam.get(winnerId);
    const loserRanking = rankingByTeam.get(loserId);
    if (!winnerRanking || !loserRanking) continue;

    const pointDifference = [result.set1, result.set2, result.set3].filter(Boolean).reduce((total, setScore) => total + parseSetDifference(String(setScore)), 0);

    winnerRanking.matches += 1;
    winnerRanking.wins += 1;
    winnerRanking.point_difference += pointDifference;
    winnerRanking.points += 3;

    loserRanking.matches += 1;
    loserRanking.losses += 1;
    loserRanking.point_difference -= pointDifference;
  }

  await supabase.from("rankings").delete().eq("tournament_id", tournamentId);

  const rows = [...rankingByTeam.entries()].map(([teamId, ranking]) => ({
    tournament_id: tournamentId,
    team_id: teamId,
    ...ranking,
    updated_at: new Date().toISOString()
  }));

  if (rows.length > 0) {
    const { error } = await supabase.from("rankings").insert(rows);
    if (error) throw new Error(error.message);
  }
}

export async function createPlayerFromAdmin(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "");
  const gender = String(formData.get("gender") ?? "Nam");
  const level = String(formData.get("level") ?? "beginner");
  const dominantHand = String(formData.get("dominantHand") ?? "Tay phải");
  const address = String(formData.get("address") ?? "").trim();
  const status = String(formData.get("status") ?? "approved");

  if (!fullName || !email || !phone || !birthDate) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (tournamentError) throw new Error(tournamentError.message);

  const { error } = await supabase.from("players").insert({
    tournament_id: tournament.id,
    full_name: fullName,
    birth_date: birthDate,
    gender,
    phone,
    email,
    address: address || null,
    level,
    dominant_hand: dominantHand,
    event_type: "free",
    has_partner: false,
    status
  });

  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function updatePlayerStatus(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const playerId = String(formData.get("playerId") ?? "");
  const status = String(formData.get("status") ?? "pending");
  if (!playerId) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("players").update({ status }).eq("id", playerId);
  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function deletePlayer(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const playerId = String(formData.get("playerId") ?? "");
  if (!playerId) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("players").delete().eq("id", playerId);
  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function saveMatchResult(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const matchId = String(formData.get("matchId") ?? "");
  const winnerTeamId = String(formData.get("winnerTeamId") ?? "");
  const set1 = String(formData.get("set1") ?? "");
  const set2 = String(formData.get("set2") ?? "");
  const set3 = String(formData.get("set3") ?? "");

  if (!matchId || !winnerTeamId || !set1) return;

  const supabase = createSupabaseAdminClient();
  const { data: match, error: matchLoadError } = await supabase
    .from("matches")
    .select("tournament_id")
    .eq("id", matchId)
    .single();

  if (matchLoadError) throw new Error(matchLoadError.message);

  await supabase.from("match_results").delete().eq("match_id", matchId);

  const { error: resultError } = await supabase.from("match_results").insert({
    match_id: matchId,
    winner_team_id: winnerTeamId,
    set1,
    set2: set2 || null,
    set3: set3 || null
  });

  if (resultError) throw new Error(resultError.message);

  const { error: matchError } = await supabase.from("matches").update({ status: "completed" }).eq("id", matchId);
  if (matchError) throw new Error(matchError.message);

  await recalculateRankingsForTournament(match.tournament_id);

  revalidateAdmin();
}

export async function recalculateRankings() {
  if (!hasSupabaseAdminConfig()) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (error) throw new Error(error.message);

  await recalculateRankingsForTournament(tournament.id);
  revalidateAdmin();
}

export async function saveTournamentSettings(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const tournamentId = String(formData.get("tournamentId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slogan = String(formData.get("slogan") ?? "").trim();
  const startsAtDate = String(formData.get("startsAt") ?? "");
  const venue = String(formData.get("venue") ?? "").trim();
  const registrationOpen = formData.get("registrationOpen") === "on";

  if (!tournamentId || !name || !startsAtDate) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("tournaments")
    .update({
      name,
      slogan,
      starts_at: `${startsAtDate}T08:00:00+07:00`,
      venue_name: venue,
      address: null,
      registration_open: registrationOpen,
      updated_at: new Date().toISOString()
    })
    .eq("id", tournamentId);

  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function saveBannerSettings(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const currentMainBannerUrl = String(formData.get("currentMainBannerUrl") ?? "");
  const currentSubBannerUrl = String(formData.get("currentSubBannerUrl") ?? "");
  const mainBannerUrl = String(formData.get("mainBannerUrl") ?? "").trim();
  const subBannerUrl = String(formData.get("subBannerUrl") ?? "").trim();
  const altText = String(formData.get("altText") ?? "").trim() || "Banner Giải cầu lông ACE Lông Thủ";
  const mainBannerFile = formData.get("mainBannerFile");
  const subBannerFile = formData.get("subBannerFile");

  const uploadedMainUrl = mainBannerFile instanceof File ? await uploadBannerFile(mainBannerFile, "main") : null;
  const uploadedSubUrl = subBannerFile instanceof File ? await uploadBannerFile(subBannerFile, "sub") : null;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("settings").upsert({
    key: "site_banners",
    value: {
      mainBannerUrl: uploadedMainUrl || mainBannerUrl || currentMainBannerUrl || "/banners/ace-long-thu-banner-main.png",
      subBannerUrl: uploadedSubUrl || subBannerUrl || currentSubBannerUrl || "/banners/ace-long-thu-banner-sub.png",
      altText
    },
    updated_at: new Date().toISOString()
  });

  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function saveAnnouncement(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const id = String(formData.get("announcementId") ?? "");
  const tournamentId = String(formData.get("tournamentId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const isPublic = formData.get("isPublic") === "on";

  if (!title || !body) return;

  const supabase = createSupabaseAdminClient();
  const payload = {
    tournament_id: tournamentId || null,
    title,
    body,
    is_public: isPublic
  };

  const { error } = id
    ? await supabase.from("announcements").update(payload).eq("id", id)
    : await supabase.from("announcements").insert(payload);

  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function deleteAnnouncement(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const id = String(formData.get("announcementId") ?? "");
  if (!id) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidateAdmin();
}

type PairingPlayerRow = {
  id: string;
  full_name: string;
  gender: string;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  event_type: string;
  partner_name: string | null;
};

const levelScore: Record<PairingPlayerRow["level"], number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
};

function teamNameFor(players: PairingPlayerRow[]) {
  return players.map((player) => player.full_name.split(" ").at(-1) ?? player.full_name).join(" / ");
}

function pairPlayers(players: PairingPlayerRow[]) {
  const teams: Array<{ eventType: string; members: PairingPlayerRow[]; status: string; name: string }> = [];
  const used = new Set<string>();
  const orderedPlayers = [...players].sort((a, b) => levelScore[a.level] - levelScore[b.level]);

  for (const player of orderedPlayers) {
    if (used.has(player.id)) continue;

    const requestedPartner = orderedPlayers.find(
      (candidate) =>
        candidate.id !== player.id &&
        !used.has(candidate.id) &&
        candidate.full_name === player.partner_name
    );

    if (requestedPartner) {
      used.add(player.id);
      used.add(requestedPartner.id);
      teams.push({ eventType: "Tự do", members: [player, requestedPartner], status: "approved", name: teamNameFor([player, requestedPartner]) });
      continue;
    }

    const partner = orderedPlayers
      .filter((candidate) => candidate.id !== player.id && !used.has(candidate.id))
      .sort((a, b) => Math.abs(levelScore[a.level] - levelScore[player.level]) - Math.abs(levelScore[b.level] - levelScore[player.level]))[0];

    used.add(player.id);
    if (partner) {
      used.add(partner.id);
      teams.push({ eventType: "Tự do", members: [player, partner], status: "approved", name: teamNameFor([player, partner]) });
    } else {
      teams.push({ eventType: "Tự do", members: [player], status: "pending", name: player.full_name });
    }
  }

  return teams;
}

export async function generateTeamsFromApprovedPlayers() {
  if (!hasSupabaseAdminConfig()) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (tournamentError) throw new Error(tournamentError.message);

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id,full_name,gender,level,event_type,partner_name")
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (playersError) throw new Error(playersError.message);

  const generatedTeams = pairPlayers((players ?? []) as PairingPlayerRow[]);

  const { data: oldTeams, error: oldTeamsError } = await supabase
    .from("teams")
    .select("id")
    .eq("tournament_id", tournament.id);

  if (oldTeamsError) throw new Error(oldTeamsError.message);

  const oldTeamIds = (oldTeams ?? []).map((team) => team.id);
  if (oldTeamIds.length > 0) {
    await supabase.from("matches").delete().in("home_team_id", oldTeamIds);
    await supabase.from("matches").delete().in("away_team_id", oldTeamIds);
    await supabase.from("teams").delete().in("id", oldTeamIds);
  }

  for (const generatedTeam of generatedTeams) {
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        tournament_id: tournament.id,
        name: generatedTeam.name,
        event_type: generatedTeam.eventType,
        status: generatedTeam.status
      })
      .select("id")
      .single();

    if (teamError) throw new Error(teamError.message);

    const members = generatedTeam.members.map((member) => ({
      team_id: team.id,
      player_id: member.id
    }));

    if (members.length > 0) {
      const { error: membersError } = await supabase.from("team_members").insert(members);
      if (membersError) throw new Error(membersError.message);
    }
  }

  revalidateAdmin();
}

export async function createManualTeam(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const name = String(formData.get("name") ?? "").trim();
  const eventType = String(formData.get("eventType") ?? "Tự do").trim() || "Tự do";
  const status = String(formData.get("status") ?? "approved");
  const playerIds = formData.getAll("playerIds").map(String).filter(Boolean);

  if (!name || playerIds.length === 0) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (tournamentError) throw new Error(tournamentError.message);

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      tournament_id: tournament.id,
      name,
      event_type: eventType,
      status
    })
    .select("id")
    .single();

  if (teamError) throw new Error(teamError.message);

  const { error: membersError } = await supabase.from("team_members").insert(
    playerIds.map((playerId) => ({
      team_id: team.id,
      player_id: playerId
    }))
  );

  if (membersError) throw new Error(membersError.message);

  revalidateAdmin();
}

export async function deleteTeam(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const teamId = String(formData.get("teamId") ?? "");
  if (!teamId) return;

  const supabase = createSupabaseAdminClient();
  const { data: team } = await supabase.from("teams").select("tournament_id").eq("id", teamId).maybeSingle();
  await supabase.from("matches").delete().eq("home_team_id", teamId);
  await supabase.from("matches").delete().eq("away_team_id", teamId);
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) throw new Error(error.message);

  if (team?.tournament_id) {
    await recalculateRankingsForTournament(team.tournament_id);
  }

  revalidateAdmin();
}

type ScheduleMatch = { homeTeamId: string; awayTeamId: string; [key: string]: unknown };

function noConsecutiveSort<T extends ScheduleMatch>(matches: T[]): T[] {
  const remaining = [...matches];
  const result: T[] = [];
  let lastTeams = new Set<string>();

  while (remaining.length > 0) {
    const idx = remaining.findIndex(
      (m) => !lastTeams.has(m.homeTeamId) && !lastTeams.has(m.awayTeamId)
    );
    const pick = idx === -1 ? remaining.shift()! : remaining.splice(idx, 1)[0];
    result.push(pick);
    lastTeams = new Set([pick.homeTeamId, pick.awayTeamId]);
  }
  return result;
}

function shuffleItems<T>(items: T[]) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function roundRobinPairs<T>(teams: T[]) {
  const pairs: Array<Array<[T, T]>> = [];
  const pool: Array<T | null> = teams.length % 2 === 0 ? [...teams] : [...teams, null];
  const rounds = pool.length - 1;

  for (let round = 0; round < rounds; round += 1) {
    const roundPairs: Array<[T, T]> = [];

    for (let index = 0; index < pool.length / 2; index += 1) {
      const home = pool[index];
      const away = pool[pool.length - 1 - index];
      if (home && away) roundPairs.push(round % 2 === 0 ? [home, away] : [away, home]);
    }

    pairs.push(roundPairs);
    const fixed = pool[0];
    const rotating = pool.slice(1);
    rotating.unshift(rotating.pop() ?? null);
    pool.splice(0, pool.length, fixed, ...rotating);
  }

  return pairs;
}

export async function assignTeamToGroup(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const teamId = String(formData.get("teamId") ?? "");
  const group = String(formData.get("group") ?? "");
  if (!teamId) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("teams")
    .update({ event_type: group || "Tự do" })
    .eq("id", teamId);

  if (error) throw new Error(error.message);
  revalidateAdmin();
}

export async function updateMatch(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const matchId = String(formData.get("matchId") ?? "");
  const courtId = String(formData.get("courtId") ?? "");
  const startsAt = String(formData.get("startsAt") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const eventType = String(formData.get("eventType") ?? "").trim();

  if (!matchId) return;

  const supabase = createSupabaseAdminClient();
  const updates: Record<string, string> = {};
  if (courtId) updates.court_id = courtId;
  if (startsAt) updates.starts_at = new Date(`${startsAt}+07:00`).toISOString();
  if (code) updates.code = code;
  if (eventType) updates.event_type = eventType;

  const { error } = await supabase.from("matches").update(updates).eq("id", matchId);
  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function deleteAllMatches() {
  if (!hasSupabaseAdminConfig()) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (tournamentError) throw new Error(tournamentError.message);

  await supabase.from("matches").delete().eq("tournament_id", tournament.id);
  await recalculateRankingsForTournament(tournament.id);
  revalidateAdmin();
}

export async function generateGroupMatches(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const groupLabel = String(formData.get("group") ?? "");
  if (!groupLabel) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id,starts_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (tournamentError) throw new Error(tournamentError.message);

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id,name,event_type,status")
    .eq("tournament_id", tournament.id)
    .eq("status", "approved")
    .eq("event_type", groupLabel)
    .order("created_at", { ascending: true });

  if (teamsError) throw new Error(teamsError.message);

  const groupTeams = shuffleItems(teams ?? []);
  if (groupTeams.length < 2) throw new Error(`Cần ít nhất 2 đội trong ${groupLabel} để sinh lịch.`);

  const { data: courts, error: courtsError } = await supabase
    .from("courts")
    .select("id,name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (courtsError) throw new Error(courtsError.message);
  if (!courts || courts.length === 0) throw new Error("Chưa có sân active để sinh lịch.");

  // Get last slot time to append after existing matches
  const { data: existingMatches } = await supabase
    .from("matches")
    .select("starts_at,court_id")
    .eq("tournament_id", tournament.id)
    .order("starts_at", { ascending: false })
    .limit(1);

  // Delete old matches for this group only
  await supabase
    .from("matches")
    .delete()
    .eq("tournament_id", tournament.id)
    .eq("event_type", groupLabel);

  const prefix = groupLabel === "Bảng A" ? "A" : groupLabel === "Bảng B" ? "B" : groupLabel.charAt(0);
  const startAt = existingMatches && existingMatches.length > 0
    ? new Date(new Date(existingMatches[0].starts_at).getTime() + 45 * 60 * 1000)
    : new Date(tournament.starts_at);

  // Build all pairs then sort so no team plays 2 consecutive matches
  const rawPairs: Array<{ homeTeamId: string; awayTeamId: string; home: typeof groupTeams[0]; away: typeof groupTeams[0] }> = [];
  for (const round of roundRobinPairs(groupTeams)) {
    for (const [home, away] of shuffleItems(round)) {
      rawPairs.push({ homeTeamId: home.id, awayTeamId: away.id, home, away });
    }
  }
  const sortedPairs = noConsecutiveSort(rawPairs);

  const inserts = sortedPairs.map((pair, index) => ({
    tournament_id: tournament.id,
    code: `${prefix}-${String(index + 1).padStart(3, "0")}`,
    event_type: groupLabel,
    court_id: courts[index % courts.length].id,
    home_team_id: pair.home.id,
    away_team_id: pair.away.id,
    starts_at: new Date(startAt.getTime() + index * 45 * 60 * 1000).toISOString(),
    status: "scheduled"
  }));

  if (inserts.length > 0) {
    const { error } = await supabase.from("matches").insert(inserts);
    if (error) throw new Error(error.message);
  }

  await recalculateRankingsForTournament(tournament.id);
  revalidateAdmin();
}

export async function assignGroupsRandomly() {
  if (!hasSupabaseAdminConfig()) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (tournamentError) throw new Error(tournamentError.message);

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id,status")
    .eq("tournament_id", tournament.id)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (teamsError) throw new Error(teamsError.message);

  const eligibleTeams = shuffleItems(teams ?? []);
  if (eligibleTeams.length < 2) throw new Error("Cần ít nhất 2 đội đủ điều kiện để chia bảng.");

  const splitIndex = Math.ceil(eligibleTeams.length / 2);
  const groupA = eligibleTeams.slice(0, splitIndex);
  const groupB = eligibleTeams.slice(splitIndex);

  const { error: errA } = await supabase.from("teams").update({ event_type: "Bảng A" }).in("id", groupA.map((t) => t.id));
  if (errA) throw new Error(errA.message);

  const { error: errB } = await supabase.from("teams").update({ event_type: "Bảng B" }).in("id", groupB.map((t) => t.id));
  if (errB) throw new Error(errB.message);

  revalidateAdmin();
}

export async function generateRoundRobinMatches() {
  if (!hasSupabaseAdminConfig()) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id,starts_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (tournamentError) throw new Error(tournamentError.message);

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id,name,event_type,status")
    .eq("tournament_id", tournament.id)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (teamsError) throw new Error(teamsError.message);

  const { data: courts, error: courtsError } = await supabase
    .from("courts")
    .select("id,name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (courtsError) throw new Error(courtsError.message);

  if (!courts || courts.length === 0) throw new Error("Chưa có sân active để sinh lịch.");

  const allTeams = teams ?? [];
  if (allTeams.length < 2) throw new Error("Cần ít nhất 2 đội đủ điều kiện để sinh lịch.");

  const hasGroupAssignment = allTeams.some((t) => t.event_type === "Bảng A" || t.event_type === "Bảng B");

  let groups: Array<{ label: string; prefix: string; teams: typeof allTeams }>;
  if (hasGroupAssignment) {
    groups = [
      { label: "Bảng A", prefix: "A", teams: allTeams.filter((t) => t.event_type === "Bảng A") },
      { label: "Bảng B", prefix: "B", teams: allTeams.filter((t) => t.event_type === "Bảng B") }
    ].filter((g) => g.teams.length > 0);
  } else {
    const shuffled = shuffleItems(allTeams);
    const splitIndex = Math.ceil(shuffled.length / 2);
    groups = [
      { label: "Bảng A", prefix: "A", teams: shuffled.slice(0, splitIndex) },
      { label: "Bảng B", prefix: "B", teams: shuffled.slice(splitIndex) }
    ].filter((g) => g.teams.length > 0);

    for (const group of groups) {
      const { error: groupError } = await supabase
        .from("teams")
        .update({ event_type: group.label })
        .in("id", group.teams.map((t) => t.id));
      if (groupError) throw new Error(groupError.message);
    }
  }

  await supabase.from("matches").delete().eq("tournament_id", tournament.id);

  const startAt = new Date(tournament.starts_at);
  const groupStageMatches: Array<Record<string, unknown>> = [];
  let slot = 0;

  for (const group of groups) {
    // Build all pairs for this group then sort so no team plays 2 consecutive matches
    const rawPairs: Array<{ homeTeamId: string; awayTeamId: string; home: typeof group.teams[0]; away: typeof group.teams[0] }> = [];
    for (const round of roundRobinPairs(group.teams)) {
      for (const [home, away] of shuffleItems(round)) {
        rawPairs.push({ homeTeamId: home.id, awayTeamId: away.id, home, away });
      }
    }
    const sortedPairs = noConsecutiveSort(rawPairs);

    sortedPairs.forEach((pair, i) => {
      groupStageMatches.push({
        tournament_id: tournament.id,
        code: `${group.prefix}-${String(i + 1).padStart(3, "0")}`,
        event_type: group.label,
        court_id: courts[slot % courts.length].id,
        home_team_id: pair.home.id,
        away_team_id: pair.away.id,
        starts_at: new Date(startAt.getTime() + slot * 45 * 60 * 1000).toISOString(),
        status: "scheduled"
      });
      slot += 1;
    });
  }

  if (groupStageMatches.length > 0) {
    const { error: insertError } = await supabase.from("matches").insert(groupStageMatches);
    if (insertError) throw new Error(insertError.message);
  }

  await recalculateRankingsForTournament(tournament.id);
  revalidateAdmin();
}

export async function createManualMatch(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const homeTeamId = String(formData.get("homeTeamId") ?? "");
  const awayTeamId = String(formData.get("awayTeamId") ?? "");
  const courtId = String(formData.get("courtId") ?? "");
  const startsAt = String(formData.get("startsAt") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  const eventType = String(formData.get("eventType") ?? "Tự do").trim() || "Tự do";

  if (!homeTeamId || !awayTeamId || !courtId || !startsAt || homeTeamId === awayTeamId) return;

  const supabase = createSupabaseAdminClient();
  const { data: selectedTeams, error: teamsError } = await supabase
    .from("teams")
    .select("id,tournament_id,event_type")
    .in("id", [homeTeamId, awayTeamId]);

  if (teamsError) throw new Error(teamsError.message);
  if (!selectedTeams || selectedTeams.length !== 2) throw new Error("Không tìm thấy đủ hai đội.");

  const homeTeam = selectedTeams.find((team) => team.id === homeTeamId);
  const awayTeam = selectedTeams.find((team) => team.id === awayTeamId);
  if (!homeTeam || !awayTeam) throw new Error("Đội không hợp lệ.");

  const matchCode = code || `MAN-${Date.now().toString().slice(-6)}`;
  const { error } = await supabase.from("matches").insert({
    tournament_id: homeTeam.tournament_id,
    code: matchCode,
    event_type: eventType,
    court_id: courtId,
    home_team_id: homeTeamId,
    away_team_id: awayTeamId,
    starts_at: new Date(`${startsAt}+07:00`).toISOString(),
    status: "scheduled"
  });

  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function generateSemiFinals() {
  if (!hasSupabaseAdminConfig()) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("id,starts_at")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  if (tournamentError) throw new Error(tournamentError.message);

  // Get rankings joined with teams to know each team's group
  const { data: rankingRows, error: rankingError } = await supabase
    .from("rankings")
    .select("team_id,points,point_difference,wins,teams(id,name,event_type)")
    .eq("tournament_id", tournament.id)
    .order("points", { ascending: false })
    .order("point_difference", { ascending: false });
  if (rankingError) throw new Error(rankingError.message);

  const rows = (rankingRows ?? []) as Array<{
    team_id: string;
    points: number;
    point_difference: number;
    wins: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    teams: any;
  }>;

  const groupA = rows.filter((r) => r.teams?.event_type === "Bảng A");
  const groupB = rows.filter((r) => r.teams?.event_type === "Bảng B");

  if (groupA.length < 2) throw new Error("Bảng A cần ít nhất 2 đội có kết quả để sinh bán kết.");
  if (groupB.length < 2) throw new Error("Bảng B cần ít nhất 2 đội có kết quả để sinh bán kết.");

  const first_A = groupA[0];
  const second_A = groupA[1];
  const first_B = groupB[0];
  const second_B = groupB[1];

  const { data: courts, error: courtsError } = await supabase
    .from("courts").select("id,name").eq("is_active", true).order("name", { ascending: true });
  if (courtsError) throw new Error(courtsError.message);
  if (!courts || courts.length === 0) throw new Error("Chưa có sân active.");

  // Get latest match time to schedule semis after group stage
  const { data: lastMatch } = await supabase
    .from("matches").select("starts_at").eq("tournament_id", tournament.id)
    .not("event_type", "in", '("Bán kết","Chung kết","Tranh hạng 3")')
    .order("starts_at", { ascending: false }).limit(1);

  const baseTime = lastMatch && lastMatch.length > 0
    ? new Date(new Date(lastMatch[0].starts_at).getTime() + 60 * 60 * 1000)
    : new Date(tournament.starts_at);

  // Delete old knockout matches
  await supabase.from("matches").delete().eq("tournament_id", tournament.id)
    .in("event_type", ["Bán kết", "Chung kết", "Tranh hạng 3"]);

  const semis = [
    {
      code: "BK-001",
      event_type: "Bán kết",
      court_id: courts[0].id,
      home_team_id: first_A.team_id,
      away_team_id: second_B.team_id,
      starts_at: baseTime.toISOString(),
      status: "scheduled",
      tournament_id: tournament.id
    },
    {
      code: "BK-002",
      event_type: "Bán kết",
      court_id: courts[courts.length > 1 ? 1 : 0].id,
      home_team_id: first_B.team_id,
      away_team_id: second_A.team_id,
      starts_at: new Date(baseTime.getTime() + 60 * 60 * 1000).toISOString(),
      status: "scheduled",
      tournament_id: tournament.id
    }
  ];

  const { error } = await supabase.from("matches").insert(semis);
  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function generateFinalAndThirdPlace() {
  if (!hasSupabaseAdminConfig()) return;

  const supabase = createSupabaseAdminClient();
  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments").select("id").order("created_at", { ascending: true }).limit(1).single();
  if (tournamentError) throw new Error(tournamentError.message);

  // Get semi-final matches with results
  const { data: semis, error: semisError } = await supabase
    .from("matches")
    .select("id,home_team_id,away_team_id,starts_at,match_results(winner_team_id)")
    .eq("tournament_id", tournament.id)
    .eq("event_type", "Bán kết")
    .order("code", { ascending: true });
  if (semisError) throw new Error(semisError.message);
  if (!semis || semis.length < 2) throw new Error("Cần có 2 trận bán kết đã được thi đấu.");

  const getResult = (match: typeof semis[0]) => {
    const result = Array.isArray(match.match_results) ? match.match_results[0] : match.match_results;
    return result?.winner_team_id ?? null;
  };

  const winner1 = getResult(semis[0]);
  const winner2 = getResult(semis[1]);
  if (!winner1 || !winner2) throw new Error("Chưa có kết quả cả 2 trận bán kết.");

  const loser1 = winner1 === semis[0].home_team_id ? semis[0].away_team_id : semis[0].home_team_id;
  const loser2 = winner2 === semis[1].home_team_id ? semis[1].away_team_id : semis[1].home_team_id;

  const { data: courts } = await supabase.from("courts").select("id,name").eq("is_active", true).order("name", { ascending: true });
  const courtId = courts?.[0]?.id;
  if (!courtId) throw new Error("Chưa có sân active.");

  const lastSemiTime = new Date(Math.max(...semis.map((s) => new Date(s.starts_at).getTime())));
  const finalTime = new Date(lastSemiTime.getTime() + 90 * 60 * 1000);
  const thirdTime = new Date(lastSemiTime.getTime() + 60 * 60 * 1000);

  await supabase.from("matches").delete().eq("tournament_id", tournament.id)
    .in("event_type", ["Chung kết", "Tranh hạng 3"]);

  const { error } = await supabase.from("matches").insert([
    {
      tournament_id: tournament.id,
      code: "TH3-001",
      event_type: "Tranh hạng 3",
      court_id: courts![courts!.length > 1 ? 1 : 0].id,
      home_team_id: loser1,
      away_team_id: loser2,
      starts_at: thirdTime.toISOString(),
      status: "scheduled"
    },
    {
      tournament_id: tournament.id,
      code: "CK-001",
      event_type: "Chung kết",
      court_id: courtId,
      home_team_id: winner1,
      away_team_id: winner2,
      starts_at: finalTime.toISOString(),
      status: "scheduled"
    }
  ]);
  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function resetMatchResult(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) return;

  const supabase = createSupabaseAdminClient();
  const { data: match } = await supabase.from("matches").select("tournament_id").eq("id", matchId).maybeSingle();

  await supabase.from("match_results").delete().eq("match_id", matchId);
  await supabase.from("matches").update({ status: "scheduled" }).eq("id", matchId);

  if (match?.tournament_id) {
    await recalculateRankingsForTournament(match.tournament_id);
  }

  revalidateAdmin();
}

export async function deleteMatch(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) return;

  const supabase = createSupabaseAdminClient();
  const { data: match } = await supabase.from("matches").select("tournament_id").eq("id", matchId).maybeSingle();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw new Error(error.message);

  if (match?.tournament_id) {
    await recalculateRankingsForTournament(match.tournament_id);
  }

  revalidateAdmin();
}
