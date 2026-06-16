import { createManualMatch, deleteAllMatches, deleteMatch, generateGroupMatches, generateRoundRobinMatches } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminCourts, getAdminMatches, getAdminTeams } from "@/lib/admin-data";
import { formatDate, formatTime } from "@/lib/utils";

export default async function AdminSchedulePage() {
  const [matches, teams, courts] = await Promise.all([
    getAdminMatches(),
    getAdminTeams(),
    getAdminCourts()
  ]);
  const eligibleTeams = teams.filter((team) => team.status === "Đủ điều kiện");
  const groupATeams = eligibleTeams.filter((t) => t.eventType === "Bảng A");
  const groupBTeams = eligibleTeams.filter((t) => t.eventType === "Bảng B");

  const groupAMatches = matches.filter((m) => m.eventType === "Bảng A");
  const groupBMatches = matches.filter((m) => m.eventType === "Bảng B");
  const otherMatches = matches.filter((m) => m.eventType !== "Bảng A" && m.eventType !== "Bảng B");
  const hasGroupMatches = groupAMatches.length > 0 || groupBMatches.length > 0;

  return (
    <AdminShell title="Quản lý lịch thi đấu">
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">

        {/* === THÊM TRẬN THỦ CÔNG === */}
        <Card>
          <h3 className="text-xl font-bold">Thêm trận thủ công</h3>
          <p className="mt-2 text-sm text-mutedForeground">Chọn bất kỳ hai đội gặp nhau.</p>
          <form action={createManualMatch} className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Mã trận
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="code" placeholder="Tự sinh nếu bỏ trống" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Nhãn trận
              <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="eventType">
                <option value="Bảng A">Bảng A</option>
                <option value="Bảng B">Bảng B</option>
                <option value="Tự do">Tự do</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Đội A
              <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="homeTeamId" required>
                <option value="">Chọn đội A</option>
                {eligibleTeams.map((team) => (
                  <option key={team.id} value={team.id}>[{team.eventType}] {team.name} — {team.members.join(" / ")}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Đội B
              <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="awayTeamId" required>
                <option value="">Chọn đội B</option>
                {eligibleTeams.map((team) => (
                  <option key={team.id} value={team.id}>[{team.eventType}] {team.name} — {team.members.join(" / ")}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Sân
              <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="courtId" required>
                <option value="">Chọn sân</option>
                {courts.map((court) => <option key={court.id} value={court.id}>{court.name}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Thời gian
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="startsAt" required type="datetime-local" />
            </label>
            <button className="w-fit rounded-md bg-court-green px-4 py-2 text-sm font-bold text-white" type="submit">Thêm trận</button>
          </form>
        </Card>

        {/* === BẢNG LỊCH THI ĐẤU === */}
        <div className="flex flex-col gap-6">

          {/* Thanh công cụ */}
          <Card className="p-4">
            <p className="mb-3 text-sm font-bold">Sinh lịch vòng tròn theo bảng (xóa lịch cũ của bảng đó)</p>
            <div className="flex flex-wrap gap-3">
              {/* Sinh lịch từng bảng */}
              {[
                { label: "Bảng A", count: groupATeams.length },
                { label: "Bảng B", count: groupBTeams.length }
              ].map(({ label, count }) => (
                <form action={generateGroupMatches} key={label}>
                  <input type="hidden" name="group" value={label} />
                  <button
                    className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                    disabled={count < 2}
                    title={count < 2 ? `Cần ít nhất 2 đội trong ${label}` : `Sinh lịch ngẫu nhiên ${label} (${count} đội)`}
                  >
                    🔀 Sinh lịch {label}
                    {count > 0 && <span className="ml-1 opacity-80">({count} đội · {count * (count - 1) / 2} trận)</span>}
                  </button>
                </form>
              ))}

              {/* Sinh cả 2 bảng cùng lúc */}
              <form action={generateRoundRobinMatches}>
                <button className="rounded-md border border-court-blue px-4 py-2 text-sm font-bold text-court-blue">
                  🔄 Sinh lịch cả 2 bảng
                </button>
              </form>

              {/* Xóa tất cả trận */}
              {matches.length > 0 && (
                <form action={deleteAllMatches}>
                  <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white">
                    🗑 Xóa tất cả ({matches.length} trận)
                  </button>
                </form>
              )}
            </div>
          </Card>

          {/* Bảng lịch */}
          <Card className="overflow-hidden p-0">
            {hasGroupMatches ? (
              <>
                {[
                  { label: "Bảng A", matchList: groupAMatches },
                  { label: "Bảng B", matchList: groupBMatches }
                ].map(({ label, matchList }) => matchList.length > 0 && (
                  <div key={label}>
                    <div className="flex items-center justify-between border-b border-border bg-muted/60 px-4 py-2">
                      <span className="text-sm font-black uppercase tracking-wider">{label} — {matchList.length} trận</span>
                      <form action={generateGroupMatches}>
                        <input type="hidden" name="group" value={label} />
                        <button className="rounded px-2 py-1 text-xs font-semibold text-court-blue hover:underline">
                          🔀 Xáo lại lịch {label}
                        </button>
                      </form>
                    </div>
                    <MatchTable matchList={matchList} />
                  </div>
                ))}
                {otherMatches.length > 0 && (
                  <div>
                    <div className="border-b border-border bg-muted/60 px-4 py-2">
                      <span className="text-sm font-black uppercase tracking-wider">Trận khác — {otherMatches.length} trận</span>
                    </div>
                    <MatchTable matchList={otherMatches} showLabel />
                  </div>
                )}
              </>
            ) : (
              <>
                {matches.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-mutedForeground">
                    Chưa có lịch thi đấu. Dùng các nút bên trên để sinh lịch.
                  </div>
                ) : (
                  <MatchTable matchList={matches} showLabel />
                )}
              </>
            )}
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

function MatchTable({ matchList, showLabel }: { matchList: Awaited<ReturnType<typeof getAdminMatches>>; showLabel?: boolean }) {
  const cols = ["Mã", "Ngày", "Giờ", "Sân", "Trận đấu", ...(showLabel ? ["Nhãn"] : []), "Trạng thái", "Xóa"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-muted">
          <tr>{cols.map((c) => <th className="px-4 py-3" key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {matchList.map((match) => (
            <tr className="border-t border-border hover:bg-muted/30" key={match.id}>
              <td className="px-4 py-3 font-bold">{match.code}</td>
              <td className="px-4 py-3">{formatDate(match.startsAt)}</td>
              <td className="px-4 py-3">{formatTime(match.startsAt)}</td>
              <td className="px-4 py-3">{match.court}</td>
              <td className="px-4 py-3">{match.homeTeam} vs {match.awayTeam}</td>
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
                <form action={deleteMatch}>
                  <input name="matchId" type="hidden" value={match.id} />
                  <button className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">Xóa</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
