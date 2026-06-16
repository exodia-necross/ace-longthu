"use client";

import { deleteMatch, updateMatch } from "@/app/admin/actions";
import type { AdminCourt, AdminMatch } from "@/lib/admin-data";
import { formatDate, formatTime } from "@/lib/utils";
import { useState } from "react";

function toDatetimeLocal(iso: string) {
  // Convert UTC → UTC+7 for datetime-local input
  const d = new Date(new Date(iso).getTime() + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function AdminMatchRow({
  match,
  courts,
  showLabel
}: {
  match: AdminMatch;
  courts: AdminCourt[];
  showLabel?: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <tr className="border-t border-border hover:bg-muted/30">
        <td className="px-4 py-3 font-bold">{match.code}</td>
        <td className="px-4 py-3">{formatDate(match.startsAt)}</td>
        <td className="px-4 py-3">{formatTime(match.startsAt)}</td>
        <td className="px-4 py-3">{match.court}</td>
        <td className="px-4 py-3 font-medium">{match.homeTeam} vs {match.awayTeam}</td>
        {showLabel && <td className="px-4 py-3">{match.eventType}</td>}
        <td className="px-4 py-3">
          <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
            match.status === "Đã kết thúc" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            : match.status === "Đang thi đấu" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
            : "bg-muted text-mutedForeground"
          }`}>
            {match.status}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-1">
            <button
              onClick={() => setEditing(true)}
              className="rounded bg-court-blue px-2 py-1 text-xs font-bold text-white"
            >
              ✏ Sửa
            </button>
            <form action={deleteMatch}>
              <input name="matchId" type="hidden" value={match.id} />
              <button className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">Xóa</button>
            </form>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-border bg-blue-50 dark:bg-blue-950/20">
      <td colSpan={showLabel ? 8 : 7} className="px-4 py-3">
        <form
          action={async (fd) => {
            await updateMatch(fd);
            setEditing(false);
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <input type="hidden" name="matchId" value={match.id} />

          <label className="grid gap-1 text-xs font-semibold">
            Mã trận
            <input
              name="code"
              defaultValue={match.code}
              className="h-8 w-28 rounded border border-border px-2 text-sm dark:bg-white/5"
            />
          </label>

          <label className="grid gap-1 text-xs font-semibold">
            Sân
            <select
              name="courtId"
              className="h-8 rounded border border-border px-2 text-sm dark:bg-white/5"
            >
              {courts.map((c) => (
                <option key={c.id} value={c.id} selected={c.name === match.court}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-semibold">
            Ngày &amp; Giờ
            <input
              name="startsAt"
              type="datetime-local"
              defaultValue={toDatetimeLocal(match.startsAt)}
              className="h-8 rounded border border-border px-2 text-sm dark:bg-white/5"
            />
          </label>

          {showLabel && (
            <label className="grid gap-1 text-xs font-semibold">
              Nhãn
              <select name="eventType" defaultValue={match.eventType} className="h-8 rounded border border-border px-2 text-sm dark:bg-white/5">
                <option value="Bảng A">Bảng A</option>
                <option value="Bảng B">Bảng B</option>
                <option value="Tự do">Tự do</option>
              </select>
            </label>
          )}

          <div className="flex gap-2">
            <button type="submit" className="rounded bg-court-green px-3 py-1.5 text-xs font-bold text-white">
              ✓ Lưu
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-border px-3 py-1.5 text-xs font-semibold"
            >
              Hủy
            </button>
          </div>

          <span className="text-xs text-mutedForeground">
            {match.homeTeam} vs {match.awayTeam}
          </span>
        </form>
      </td>
    </tr>
  );
}
