import { CalendarDays, Trophy, Users } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { getAdminMatches, getAdminPlayers, getAdminTeams } from "@/lib/admin-data";
import { autoPairPlayers, generateRoundRobinSchedule } from "@/lib/tournament-engine";

export default async function AdminDashboardPage() {
  const players = await getAdminPlayers();
  const teams = await getAdminTeams();
  const matches = await getAdminMatches();
  const stats = {
    pendingPlayers: players.filter((player) => player.status === "Chờ duyệt").length,
    approvedPlayers: players.filter((player) => player.status === "Đã duyệt").length,
    teams: teams.length,
    scheduledMatches: matches.length,
    completedMatches: matches.filter((match) => match.status === "Đã kết thúc").length
  };
  const suggestedTeams = autoPairPlayers(players);
  const suggestedSchedule = generateRoundRobinSchedule(teams, new Date("2026-07-19T08:00:00+07:00"), ["Sân 1", "Sân 2", "Sân 3"]);

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
          <h3 className="text-xl font-bold">Ghép cặp tự động</h3>
          <p className="mt-1 text-sm text-mutedForeground">Ưu tiên cặp đã đăng ký, sau đó ghép theo trình độ. Admin vẫn có thể xếp lại thủ công.</p>
          <div className="mt-4 space-y-3">
            {suggestedTeams.map((team) => (
              <div className="rounded-md bg-muted p-3" key={team.id}>
                <p className="font-bold">{team.name}</p>
                <p className="text-sm text-mutedForeground">{team.members.join(" - ")} | {team.eventType} | {team.status}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-bold">Sinh lịch vòng tròn</h3>
          <p className="mt-1 text-sm text-mutedForeground">Sinh mã trận, phân sân và tránh trùng giờ theo slot 45 phút.</p>
          <div className="mt-4 space-y-3">
            {suggestedSchedule.slice(0, 5).map((match) => (
              <div className="rounded-md bg-muted p-3" key={match.id}>
                <p className="font-bold">{match.code}: {match.homeTeam} vs {match.awayTeam}</p>
                <p className="text-sm text-mutedForeground">{match.court} | {match.eventType}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <h3 className="text-xl font-bold">Nhập kết quả nhanh</h3>
        <div className="mt-4 grid gap-3">
          {matches.map((match) => (
            <div className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[1fr_160px_160px_auto] md:items-center" key={match.id}>
              <p className="font-semibold">{match.code} - {match.homeTeam} vs {match.awayTeam}</p>
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" placeholder="Set 1" />
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" placeholder="Set 2 / Set 3" />
              <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Cập nhật</button>
            </div>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}
