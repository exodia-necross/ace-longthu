import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { matches } from "@/lib/mock-data";

export default function AdminResultsPage() {
  return (
    <AdminShell title="Nhập kết quả">
      <Card className="mt-6">
        <div className="grid gap-3">
          {matches.map((match) => (
            <div className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[1fr_140px_140px_140px_auto] md:items-center" key={match.id}>
              <p className="font-semibold">{match.code} - {match.homeTeam} vs {match.awayTeam}</p>
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" placeholder="Set 1" />
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" placeholder="Set 2" />
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" placeholder="Set 3" />
              <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Lưu</button>
            </div>
          ))}
        </div>
      </Card>
    </AdminShell>
  );
}
