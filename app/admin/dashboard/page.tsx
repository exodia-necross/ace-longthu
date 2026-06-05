import Link from "next/link";
import { CalendarDays, Trophy, Users } from "lucide-react";
import { saveMatchResult } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { getAdminMatches, getAdminPlayers, getAdminTeams } from "@/lib/admin-data";

export default async function AdminDashboardPage() {
  const players = await getAdminPlayers();
  const teams = await getAdminTeams();
  const matches = await getAdminMatches();
  const unfinishedMatches = matches.filter((match) => match.status !== "Đã kết thúc");
  const stats = {
    pendingPlayers: players.filter((player) => player.status === "Chờ duyệt").length,
    approvedPlayers: players.filter((player) => player.status === "Đã duyệt").length,
    teams: teams.length,
    scheduledMatches: matches.length,
    completedMatches: matches.filter((match) => match.status === "Đã kết thúc").length
  };

  return (
    <AdminShell title="Dashboard">
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Users} label="Chờ duyệt" value={stats.pendingPlayers} />
        <StatCard icon={Users} label="Đã duyệt" value={stats.approvedPlayers} />
        <StatCard icon={Trophy} label="Cặp đấu" value={stats.teams} />
        <StatCard icon={CalendarDays} label="Trận đấu" value={stats.scheduledMatches} />
        <StatCard icon={Trophy} label="Hoàn thành" value={stats.completedMatches} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Thành viên cần duyệt</h3>
              <p className="mt-1 text-sm text-mutedForeground">Duyệt đăng ký để VĐV có thể xuất hiện ở trang công khai và được xếp đội.</p>
            </div>
            <Link className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white" href="/admin/members">Quản lý</Link>
          </div>
          <div className="mt-4 space-y-3">
            {players.filter((player) => player.status === "Chờ duyệt").slice(0, 5).map((player) => (
              <div className="rounded-md bg-muted p-3" key={player.id}>
                <p className="font-bold">{player.fullName}</p>
                <p className="text-sm text-mutedForeground">{player.email} | {player.level}</p>
              </div>
            ))}
            {stats.pendingPlayers === 0 && <p className="text-sm text-mutedForeground">Không còn đăng ký chờ duyệt.</p>}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Lịch sắp thi đấu</h3>
              <p className="mt-1 text-sm text-mutedForeground">Các trận chưa nhập kết quả.</p>
            </div>
            <Link className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white" href="/admin/schedule">Xếp lịch</Link>
          </div>
          <div className="mt-4 space-y-3">
            {unfinishedMatches.slice(0, 5).map((match) => (
              <div className="rounded-md bg-muted p-3" key={match.id}>
                <p className="font-bold">{match.code}: {match.homeTeam} vs {match.awayTeam}</p>
                <p className="text-sm text-mutedForeground">{match.court} | {match.eventType}</p>
              </div>
            ))}
            {unfinishedMatches.length === 0 && <p className="text-sm text-mutedForeground">Chưa có trận cần xử lý.</p>}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="text-xl font-bold">Nhập kết quả nhanh</h3>
        <div className="mt-4 grid gap-3">
          {unfinishedMatches.length === 0 && <p className="text-sm text-mutedForeground">Không có trận đang chờ nhập kết quả.</p>}
          {unfinishedMatches.slice(0, 6).map((match) => (
            <form action={saveMatchResult} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[1fr_120px_120px_120px_160px_auto] md:items-center" key={match.id}>
              <input name="matchId" type="hidden" value={match.id} />
              <p className="font-semibold">{match.code} - {match.homeTeam} vs {match.awayTeam}</p>
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="set1" placeholder="21-17" required />
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="set2" placeholder="18-21" />
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="set3" placeholder="21-15" />
              <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="winnerTeamId" required>
                <option value={match.homeTeamId}>{match.homeTeam}</option>
                <option value={match.awayTeamId}>{match.awayTeam}</option>
              </select>
              <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Cập nhật</button>
            </form>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}
