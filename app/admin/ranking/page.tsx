import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { recalculateRankings } from "@/app/admin/actions";
import { getAdminRankings } from "@/lib/admin-data";

function RankingTable({ rows, showAdvance }: { rows: Awaited<ReturnType<typeof getAdminRankings>>; showAdvance?: boolean }) {
  return (
    <table className="w-full min-w-[560px] text-left text-sm">
      <thead className="bg-muted">
        <tr>{["Hạng", "Đội", "Số trận", "Thắng", "Thua", "Hiệu số", "Điểm"].map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td className="px-4 py-8 text-center text-mutedForeground" colSpan={7}>Chưa có dữ liệu xếp hạng.</td>
          </tr>
        )}
        {rows.map((row) => {
          const advances = showAdvance && row.rank <= 2;
          return (
            <tr className={`border-t border-border ${advances ? "bg-green-50 dark:bg-green-950/20" : ""}`} key={`${row.group}-${row.team}`}>
              <td className="px-4 py-3">
                <span className={`font-black ${advances ? "text-court-green" : "text-court-blue"}`}>#{row.rank}</span>
                {advances && <span className="ml-2 rounded bg-court-green px-1.5 py-0.5 text-[10px] font-bold text-white">Vào tiếp</span>}
              </td>
              <td className="px-4 py-3 font-bold">{row.team}</td>
              <td className="px-4 py-3">{row.matches}</td>
              <td className="px-4 py-3">{row.wins}</td>
              <td className="px-4 py-3">{row.losses}</td>
              <td className="px-4 py-3">{row.difference}</td>
              <td className="px-4 py-3 font-bold">{row.points}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default async function AdminRankingPage() {
  const rankings = await getAdminRankings();

  const groupARankings = rankings.filter((r) => r.group === "Bảng A");
  const groupBRankings = rankings.filter((r) => r.group === "Bảng B");
  const otherRankings = rankings.filter((r) => !r.group);
  const hasGroups = groupARankings.length > 0 || groupBRankings.length > 0;

  return (
    <AdminShell title="Bảng xếp hạng">
      <div className="mt-6 space-y-6">
        <div className="flex gap-3">
          <form action={recalculateRankings}>
            <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Tính lại xếp hạng</button>
          </form>
        </div>

        {hasGroups ? (
          <>
            {[
              { label: "Bảng A", rows: groupARankings },
              { label: "Bảng B", rows: groupBRankings }
            ].map(({ label, rows }) => rows.length > 0 && (
              <Card className="overflow-hidden p-0" key={label}>
                <div className="border-b border-border bg-muted/60 px-4 py-3">
                  <h3 className="font-black uppercase tracking-wider">{label}</h3>
                  <p className="text-xs text-mutedForeground">Top 2 sẽ vào vòng tiếp theo (xét thắng/thua → hiệu số nếu bằng điểm)</p>
                </div>
                <div className="overflow-x-auto">
                  <RankingTable rows={rows} showAdvance />
                </div>
              </Card>
            ))}
            {otherRankings.length > 0 && (
              <Card className="overflow-hidden p-0">
                <div className="border-b border-border bg-muted/60 px-4 py-3">
                  <h3 className="font-black uppercase tracking-wider">Xếp hạng khác</h3>
                </div>
                <div className="overflow-x-auto">
                  <RankingTable rows={otherRankings} />
                </div>
              </Card>
            )}
          </>
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <RankingTable rows={rankings} />
            </div>
          </Card>
        )}
      </div>
    </AdminShell>
  );
}
