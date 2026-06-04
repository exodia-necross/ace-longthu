import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { saveMatchResult } from "@/app/admin/actions";
import { getAdminMatches } from "@/lib/admin-data";

export default async function AdminResultsPage() {
  const matches = await getAdminMatches();

  return (
    <AdminShell title="Nhập kết quả">
      <Card className="mt-6">
        <div className="grid gap-3">
          {matches.length === 0 && <p className="text-sm text-mutedForeground">Chưa có trận đấu để nhập kết quả.</p>}
          {matches.map((match) => (
            <form action={saveMatchResult} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[1fr_140px_140px_140px_160px_auto] md:items-center" key={match.id}>
              <input name="matchId" type="hidden" value={match.id} />
              <p className="font-semibold">{match.code} - {match.homeTeam} vs {match.awayTeam}</p>
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="set1" placeholder="21-17" required />
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="set2" placeholder="18-21" />
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="set3" placeholder="21-15" />
              <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="winnerTeamId" required>
                <option value={match.homeTeamId}>{match.homeTeam}</option>
                <option value={match.awayTeamId}>{match.awayTeam}</option>
              </select>
              <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Lưu</button>
            </form>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}
