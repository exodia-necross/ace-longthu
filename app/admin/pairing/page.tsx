import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminPlayers, getAdminTeams } from "@/lib/admin-data";
import { autoPairPlayers } from "@/lib/tournament-engine";

export default async function AdminPairingPage() {
  const players = await getAdminPlayers();
  const teams = await getAdminTeams();
  const suggestedTeams = autoPairPlayers(players);

  return (
    <AdminShell title="Ghép cặp thi đấu">
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-xl font-bold">Cặp hiện có</h3>
          <div className="mt-4 space-y-3">
            {teams.length === 0 && <p className="text-sm text-mutedForeground">Chưa có cặp thi đấu trong database.</p>}
            {teams.map((team) => (
              <div className="rounded-md border border-border p-4" key={team.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{team.name}</p>
                    <p className="text-sm text-mutedForeground">{team.members.join(" - ") || "Chưa có thành viên"} | {team.eventType}</p>
                  </div>
                  <span className="rounded-md bg-muted px-3 py-1 text-xs font-bold">{team.status}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-bold">Gợi ý ghép tự động</h3>
          <p className="mt-2 text-sm text-mutedForeground">Gợi ý dựa trên danh sách vận động viên đã duyệt.</p>
          <div className="mt-4 space-y-3">
            {suggestedTeams.map((team) => (
              <div className="rounded-md bg-muted p-4" key={team.id}>
                <p className="font-bold">{team.name}</p>
                <p className="text-sm text-mutedForeground">{team.members.join(" - ")} | {team.eventType} | {team.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
