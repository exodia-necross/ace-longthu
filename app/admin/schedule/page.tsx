import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminMatches } from "@/lib/admin-data";
import { formatDate, formatTime } from "@/lib/utils";

export default async function AdminSchedulePage() {
  const matches = await getAdminMatches();

  return (
    <AdminShell title="Quản lý lịch thi đấu">
      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex flex-wrap gap-3 border-b border-border p-4">
          <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Sinh lịch tự động</button>
          <button className="rounded-md border border-border px-4 py-2 text-sm font-bold">Thêm trận</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-muted">
              <tr>{["Mã", "Ngày", "Giờ", "Sân", "Trận", "Nội dung", "Trạng thái"].map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr>
            </thead>
            <tbody>
              {matches.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-mutedForeground" colSpan={7}>Chưa có lịch thi đấu.</td>
                </tr>
              )}
              {matches.map((match) => (
                <tr className="border-t border-border" key={match.id}>
                  <td className="px-4 py-3 font-bold">{match.code}</td>
                  <td className="px-4 py-3">{formatDate(match.startsAt)}</td>
                  <td className="px-4 py-3">{formatTime(match.startsAt)}</td>
                  <td className="px-4 py-3">{match.court}</td>
                  <td className="px-4 py-3">{match.homeTeam} vs {match.awayTeam}</td>
                  <td className="px-4 py-3">{match.eventType}</td>
                  <td className="px-4 py-3">{match.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
