import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";

export default async function RankingPage() {
  const { rankings } = await getPublicData();

  const groupARankings = rankings.filter((r) => r.group === "Bảng A");
  const groupBRankings = rankings.filter((r) => r.group === "Bảng B");
  const otherRankings = rankings.filter((r) => !r.group);
  const hasGroups = groupARankings.length > 0 || groupBRankings.length > 0;

  return (
    <PageShell>
      <section className="container-page py-10">
        <h1 className="text-3xl font-black">Bảng xếp hạng</h1>

        {hasGroups ? (
          <div className="mt-6 space-y-8">
            {[
              { label: "Bảng A", rows: groupARankings },
              { label: "Bảng B", rows: groupBRankings }
            ].map(({ label, rows }) => rows.length > 0 && (
              <div key={label}>
                <div className="mb-3 flex items-baseline gap-3">
                  <h2 className="text-xl font-black">{label}</h2>
                  <span className="text-sm text-mutedForeground">Top 2 vào vòng tiếp theo</span>
                </div>
                <Card className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {["Hạng", "Đội", "Số trận", "Thắng", "Thua", "Hiệu số", "Điểm"].map((header) => (
                            <th className="px-4 py-3" key={header}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => {
                          const advances = row.rank <= 2;
                          return (
                            <tr className={`border-t border-border ${advances ? "bg-green-50 dark:bg-green-950/20" : ""}`} key={row.team}>
                              <td className="px-4 py-3">
                                <span className={`text-lg font-black ${advances ? "text-court-green" : "text-court-blue"}`}>#{row.rank}</span>
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
                  </div>
                </Card>
              </div>
            ))}
            {otherRankings.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-black">Xếp hạng khác</h2>
                <Card className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                      <thead className="bg-muted">
                        <tr>{["Hạng", "Đội", "Số trận", "Thắng", "Thua", "Hiệu số", "Điểm"].map((h) => <th className="px-4 py-3" key={h}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {otherRankings.map((row) => (
                          <tr className="border-t border-border" key={row.team}>
                            <td className="px-4 py-3 text-lg font-black text-court-blue">#{row.rank}</td>
                            <td className="px-4 py-3 font-bold">{row.team}</td>
                            <td className="px-4 py-3">{row.matches}</td>
                            <td className="px-4 py-3">{row.wins}</td>
                            <td className="px-4 py-3">{row.losses}</td>
                            <td className="px-4 py-3">{row.difference}</td>
                            <td className="px-4 py-3 font-bold">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <Card className="mt-6 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {["Hạng", "Đội", "Số trận", "Thắng", "Thua", "Hiệu số", "Điểm"].map((header) => (
                      <th className="px-4 py-3" key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rankings.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-mutedForeground" colSpan={7}>Chưa có dữ liệu xếp hạng.</td>
                    </tr>
                  )}
                  {rankings.map((row) => (
                    <tr className="border-t border-border" key={row.team}>
                      <td className="px-4 py-3 text-lg font-black text-court-blue">#{row.rank}</td>
                      <td className="px-4 py-3 font-bold">{row.team}</td>
                      <td className="px-4 py-3">{row.matches}</td>
                      <td className="px-4 py-3">{row.wins}</td>
                      <td className="px-4 py-3">{row.losses}</td>
                      <td className="px-4 py-3">{row.difference}</td>
                      <td className="px-4 py-3 font-bold">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>
    </PageShell>
  );
}
