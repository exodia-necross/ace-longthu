import { createManualMatch, deleteAllMatches, generateFinalAndThirdPlace, generateGroupMatches, generateRoundRobinMatches, generateSemiFinals } from "@/app/admin/actions";
import { AdminMatchRow } from "@/components/admin-match-row";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminCourts, getAdminMatches, getAdminTeams } from "@/lib/admin-data";

export default async function AdminSchedulePage() {
  const [matches, teams, courts] = await Promise.all([
    getAdminMatches(),
    getAdminTeams(),
    getAdminCourts()
  ]);
  const eligibleTeams = teams.filter((team) => team.status === "Đủ điều kiện");
  const groupATeams = eligibleTeams.filter((t) => t.eventType === "Bảng A");
  const groupBTeams = eligibleTeams.filter((t) => t.eventType === "Bảng B");

  const KNOCKOUT_TYPES = ["Bán kết", "Tranh hạng 3", "Chung kết"];
  const groupAMatches = matches.filter((m) => m.eventType === "Bảng A");
  const groupBMatches = matches.filter((m) => m.eventType === "Bảng B");
  const semiMatches = matches.filter((m) => m.eventType === "Bán kết");
  const thirdMatches = matches.filter((m) => m.eventType === "Tranh hạng 3");
  const finalMatches = matches.filter((m) => m.eventType === "Chung kết");
  const otherMatches = matches.filter((m) => m.eventType !== "Bảng A" && m.eventType !== "Bảng B" && !KNOCKOUT_TYPES.includes(m.eventType));
  const hasGroupMatches = groupAMatches.length > 0 || groupBMatches.length > 0;
  const hasKnockout = semiMatches.length > 0 || thirdMatches.length > 0 || finalMatches.length > 0;
  const semisCompleted = semiMatches.length === 2 && semiMatches.every((m) => m.status === "Đã kết thúc");

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

          {/* Thanh công cụ — Vòng bảng */}
          <Card className="p-4">
            <p className="mb-3 text-sm font-bold text-mutedForeground uppercase tracking-wider text-xs">Vòng bảng</p>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Bảng A", count: groupATeams.length },
                { label: "Bảng B", count: groupBTeams.length }
              ].map(({ label, count }) => (
                <form action={generateGroupMatches} key={label}>
                  <input type="hidden" name="group" value={label} />
                  <button
                    className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                    disabled={count < 2}
                  >
                    🔀 Sinh lịch {label}
                    {count > 0 && <span className="ml-1 opacity-80">({count} đội · {count * (count - 1) / 2} trận)</span>}
                  </button>
                </form>
              ))}
              <form action={generateRoundRobinMatches}>
                <button className="rounded-md border border-court-blue px-4 py-2 text-sm font-bold text-court-blue">
                  🔄 Sinh lịch cả 2 bảng
                </button>
              </form>
              {matches.length > 0 && (
                <form action={deleteAllMatches}>
                  <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white">
                    🗑 Xóa tất cả ({matches.length} trận)
                  </button>
                </form>
              )}
            </div>
          </Card>

          {/* Thanh công cụ — Vòng loại trực tiếp */}
          <Card className="p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-mutedForeground">Vòng loại trực tiếp</p>
            <p className="mb-3 text-xs text-mutedForeground">Nhất A đấu Nhì B · Nhất B đấu Nhì A → Chung kết + Tranh hạng 3</p>
            <div className="flex flex-wrap items-center gap-3">
              <form action={generateSemiFinals}>
                <button className="rounded-md bg-orange-500 px-4 py-2 text-sm font-bold text-white">
                  🏆 Sinh lịch bán kết
                </button>
              </form>
              <form action={generateFinalAndThirdPlace}>
                <button
                  className="rounded-md px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
                  style={{ backgroundColor: semisCompleted ? "#7c3aed" : "#a78bfa" }}
                  disabled={!semisCompleted}
                  title={semisCompleted ? "Sinh lịch chung kết & tranh hạng 3" : "Cần hoàn thành cả 2 trận bán kết trước"}
                >
                  🥇 Sinh lịch chung kết &amp; hạng 3
                </button>
              </form>
              {!semisCompleted && semiMatches.length > 0 && (
                <span className="text-xs text-orange-600">
                  ({semiMatches.filter((m) => m.status === "Đã kết thúc").length}/2 bán kết đã xong)
                </span>
              )}
            </div>
          </Card>

          {/* Bảng lịch */}
          {/* Vòng bảng */}
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
                          🔀 Xáo lại {label}
                        </button>
                      </form>
                    </div>
                    <MatchTable matchList={matchList} courts={courts} />
                  </div>
                ))}
                {otherMatches.length > 0 && (
                  <div>
                    <div className="border-b border-border bg-muted/60 px-4 py-2">
                      <span className="text-sm font-black uppercase tracking-wider">Trận khác — {otherMatches.length} trận</span>
                    </div>
                    <MatchTable matchList={otherMatches} courts={courts} showLabel />
                  </div>
                )}
              </>
            ) : matches.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-mutedForeground">
                Chưa có lịch thi đấu. Dùng các nút bên trên để sinh lịch.
              </div>
            ) : (
              <MatchTable matchList={matches} courts={courts} showLabel />
            )}
          </Card>

          {/* Vòng loại trực tiếp */}
          {hasKnockout && (
            <Card className="overflow-hidden p-0">
              <div className="border-b border-border bg-orange-50 px-4 py-3 dark:bg-orange-950/20">
                <p className="font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">Vòng loại trực tiếp</p>
              </div>
              {[
                { label: "Bán kết", matchList: semiMatches, desc: "Nhất A vs Nhì B · Nhất B vs Nhì A" },
                { label: "Tranh hạng 3", matchList: thirdMatches, desc: "2 đội thua bán kết" },
                { label: "Chung kết", matchList: finalMatches, desc: "2 đội thắng bán kết" }
              ].map(({ label, matchList, desc }) => matchList.length > 0 && (
                <div key={label}>
                  <div className="border-b border-border bg-muted/40 px-4 py-2">
                    <span className="text-sm font-black uppercase tracking-wider">{label}</span>
                    <span className="ml-2 text-xs text-mutedForeground">{desc}</span>
                  </div>
                  <MatchTable matchList={matchList} courts={courts} />
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function MatchTable({ matchList, courts, showLabel }: { matchList: Awaited<ReturnType<typeof getAdminMatches>>; courts: Awaited<ReturnType<typeof getAdminCourts>>; showLabel?: boolean }) {
  const cols = ["Mã", "Ngày", "Giờ", "Sân", "Trận đấu", ...(showLabel ? ["Nhãn"] : []), "Trạng thái", "Thao tác"];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead className="bg-muted">
          <tr>{cols.map((c) => <th className="px-4 py-3" key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {matchList.map((match) => (
            <AdminMatchRow key={match.id} match={match} courts={courts} showLabel={showLabel} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
