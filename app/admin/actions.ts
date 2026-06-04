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
  await supabase.from("matches").delete().eq("home_team_id", teamId);
  await supabase.from("matches").delete().eq("away_team_id", teamId);
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) throw new Error(error.message);

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

  await supabase.from("matches").delete().eq("tournament_id", tournament.id);

  const inserts = [];
  let slot = 0;
  let count = 1;
  const startAt = new Date(tournament.starts_at);
  const eventTeams = teams ?? [];

  for (let i = 0; i < eventTeams.length; i += 1) {
    for (let j = i + 1; j < eventTeams.length; j += 1) {
      const court = courts[slot % courts.length];
      const startsAt = new Date(startAt.getTime() + slot * 45 * 60 * 1000);
      inserts.push({
        tournament_id: tournament.id,
        code: `RR-${String(count).padStart(3, "0")}`,
        event_type: "Tự do",
        court_id: court.id,
        home_team_id: eventTeams[i].id,
        away_team_id: eventTeams[j].id,
        starts_at: startsAt.toISOString(),
        status: "scheduled"
      });
      slot += 1;
      count += 1;
    }
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase.from("matches").insert(inserts);
    if (insertError) throw new Error(insertError.message);
  }

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
    starts_at: new Date(startsAt).toISOString(),
    status: "scheduled"
  });

  if (error) throw new Error(error.message);

  revalidateAdmin();
}

export async function deleteMatch(formData: FormData) {
  if (!hasSupabaseAdminConfig()) return;

  const matchId = String(formData.get("matchId") ?? "");
  if (!matchId) return;

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("matches").delete().eq("id", matchId);
  if (error) throw new Error(error.message);

  revalidateAdmin();
}
