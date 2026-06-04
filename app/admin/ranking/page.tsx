import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminRankings } from "@/lib/admin-data";

export default async function AdminRankingPage() {
  const rankings = await getAdminRankings();

  return (
    <AdminShell title="Bảng xếp hạng">
      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-border p-4">
          <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Tính lại xếp hạng</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted">
              <tr>{["Hạng", "Đội", "Số trận", "Thắng", "Thua", "Hiệu số", "Điểm"].map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr>
            </thead>
            <tbody>
              {rankings.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-mutedForeground" colSpan={7}>Chưa có dữ liệu xếp hạng.</td>
                </tr>
              )}
              {rankings.map((row) => (
                <tr className="border-t border-border" key={row.team}>
                  <td className="px-4 py-3 font-black text-court-blue">#{row.rank}</td>
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
    </AdminShell>
  );
}
