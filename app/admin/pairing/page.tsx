import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { players, teams } from "@/lib/mock-data";
import { autoPairPlayers } from "@/lib/tournament-engine";

export default function AdminPairingPage() {
  const suggestedTeams = autoPairPlayers(players);
  return (
    <AdminShell title="Ghép cặp thi đấu">
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h3 className="text-xl font-bold">Cặp hiện có</h3>
          <div className="mt-4 space-y-3">
            {teams.map((team) => (
              <div className="rounded-md border border-border p-4" key={team.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{team.name}</p>
                    <p className="text-sm text-mutedForeground">{team.members.join(" - ")} | {team.eventType}</p>
                  </div>
                  <span className="rounded-md bg-muted px-3 py-1 text-xs font-bold">{team.status}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="rounded-md border border-border px-3 py-1 text-sm font-semibold">Đổi cặp</button>
                  <button className="rounded-md border border-border px-3 py-1 text-sm font-semibold">Tách cặp</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-bold">Gợi ý ghép tự động</h3>
          <button className="mt-4 rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Chạy ghép cặp</button>
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
