import { createManualMatch, deleteMatch, generateRoundRobinMatches } from "@/app/admin/actions";
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

  return (
    <AdminShell title="Quản lý lịch thi đấu">
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h3 className="text-xl font-bold">Thêm trận thủ công</h3>
          <p className="mt-2 text-sm text-mutedForeground">Có thể chọn bất kỳ đội/cặp nào gặp nhau, không cần cùng loại đơn/đôi/nam/nữ.</p>
          <form action={createManualMatch} className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Mã trận
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="code" placeholder="Tự sinh nếu bỏ trống" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Nhãn trận
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="eventType" placeholder="Ví dụ: Kèo tự do, Vòng bảng, Trình khá..." defaultValue="Tự do" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Đội A
              <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="homeTeamId" required>
                <option value="">Chọn đội A</option>
                {eligibleTeams.map((team) => <option key={team.id} value={team.id}>{team.name} - {team.members.join(" / ")}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Đội B
              <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="awayTeamId" required>
                <option value="">Chọn đội B</option>
                {eligibleTeams.map((team) => <option key={team.id} value={team.id}>{team.name} - {team.members.join(" / ")}</option>)}
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

        <Card className="overflow-hidden p-0">
          <div className="flex flex-wrap gap-3 border-b border-border p-4">
            <form action={generateRoundRobinMatches}>
              <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Sinh lịch tự động tự do</button>
            </form>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="bg-muted">
                <tr>{["Mã", "Ngày", "Giờ", "Sân", "Trận", "Nhãn", "Trạng thái", "Thao tác"].map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr>
              </thead>
              <tbody>
                {matches.length === 0 && (
                  <tr>
                    <td className="px-4 py-8 text-center text-mutedForeground" colSpan={8}>Chưa có lịch thi đấu.</td>
                  </tr>
                )}
                {matches.map((match) => (
                  <tr className="border-t border-border" key={match.id}>
                    <td className="px-4 py-3 font-bold">{match.code}</td>
                    <td className="px-4 py-3">{formatDate(match.startsAt)}</td>
                    <td className="px-4 py-3">{formatTime(match.startsAt)}</td>
                    <td className="px-4 py-3">{match.court}</td>
                    <td className="px-4 py-3">{match.homeTeam} vs {match.awayTeam}</td>
                    <td className="px-4 py-3">{match.eventType}</td>
                    <td className="px-4 py-3">{match.status}</td>
                    <td className="px-4 py-3">
                      <form action={deleteMatch}>
                        <input name="matchId" type="hidden" value={match.id} />
                        <button className="rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white">Xóa</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
