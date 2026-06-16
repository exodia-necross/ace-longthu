"use client";

import { resetMatchResult, saveMatchResult } from "@/app/admin/actions";
import type { AdminMatch } from "@/lib/admin-data";
import { useState } from "react";

export function AdminResultRow({ match }: { match: AdminMatch }) {
  const isDone = match.status === "Đã kết thúc";
  const [editing, setEditing] = useState(!isDone);

  const sets = isDone && match.score ? match.score.split(", ") : [];

  if (!editing && isDone) {
    return (
      <div className="grid gap-3 rounded-md border border-border bg-green-50/60 p-4 dark:bg-green-950/10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="font-semibold">
            <span className="mr-2 rounded bg-muted px-2 py-0.5 text-xs font-bold">{match.code}</span>
            {match.homeTeam} vs {match.awayTeam}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {sets.map((s, i) => (
              <span key={i} className="rounded border border-border bg-white px-3 py-1 text-sm font-bold dark:bg-white/5">
                Hiệp {i + 1}: {s}
              </span>
            ))}
            <span className="flex items-center gap-1 rounded bg-court-green px-3 py-1 text-sm font-bold text-white">
              🏆 {match.winner}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:bg-muted"
          >
            ✏ Sửa
          </button>
          <form action={resetMatchResult}>
            <input type="hidden" name="matchId" value={match.id} />
            <button
              type="submit"
              className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
              title="Xóa kết quả, đặt lại trạng thái Sắp diễn ra"
            >
              ↺ Reset
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form
      action={async (fd) => {
        await saveMatchResult(fd);
        setEditing(false);
      }}
      className="rounded-md border border-border p-4"
    >
      <input name="matchId" type="hidden" value={match.id} />

      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="font-semibold">
          <span className="mr-2 rounded bg-muted px-2 py-0.5 text-xs font-bold">{match.code}</span>
          {match.homeTeam} vs {match.awayTeam}
        </p>
        {isDone && (
          <button type="button" onClick={() => setEditing(false)} className="text-xs text-mutedForeground hover:underline">
            Hủy
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-[140px_140px_140px_1fr_auto] sm:items-end">
        <label className="grid gap-1 text-xs font-semibold">
          Hiệp 1 *
          <input
            className="h-10 rounded-md border border-border px-3 dark:bg-white/5"
            name="set1"
            placeholder="21-17"
            defaultValue={sets[0] ?? ""}
            required
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold">
          Hiệp 2
          <input
            className="h-10 rounded-md border border-border px-3 dark:bg-white/5"
            name="set2"
            placeholder="18-21"
            defaultValue={sets[1] ?? ""}
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold">
          Hiệp 3
          <input
            className="h-10 rounded-md border border-border px-3 dark:bg-white/5"
            name="set3"
            placeholder="21-15"
            defaultValue={sets[2] ?? ""}
          />
        </label>
        <label className="grid gap-1 text-xs font-semibold">
          Đội thắng *
          <select
            className="h-10 rounded-md border border-border px-3 dark:bg-white/5"
            name="winnerTeamId"
            defaultValue={match.winner === match.homeTeam ? match.homeTeamId : match.winner === match.awayTeam ? match.awayTeamId : ""}
            required
          >
            <option value="">-- Chọn đội thắng --</option>
            <option value={match.homeTeamId}>{match.homeTeam}</option>
            <option value={match.awayTeamId}>{match.awayTeam}</option>
          </select>
        </label>
        <button className="h-10 rounded-md bg-court-green px-5 text-sm font-bold text-white">
          Lưu
        </button>
      </div>
    </form>
  );
}
