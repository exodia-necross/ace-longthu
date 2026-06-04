import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";

export default async function RankingPage() {
  const { rankings } = await getPublicData();
  return (
    <PageShell>
      <section className="container-page py-10">
        <h1 className="text-3xl font-black">Bảng xếp hạng</h1>
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
      </section>
    </PageShell>
  );
}
