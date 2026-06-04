"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

const adminPaths = [
  "/admin/dashboard",
  "/admin/members",
  "/admin/pairing",
  "/admin/schedule",
  "/admin/results",
  "/admin/ranking"
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
