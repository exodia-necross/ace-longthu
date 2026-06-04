import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";

export default async function SchedulePage() {
  const { matches } = await getPublicData();
  return (
    <PageShell>
      <section className="container-page py-10">
        <h1 className="text-3xl font-black">Lịch thi đấu</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <select className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5"><option>Theo ngày</option></select>
          <select className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5"><option>Theo sân</option></select>
          <select className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5"><option>Theo nội dung</option></select>
        </div>
        <Card className="mt-6 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  {["Mã trận", "Ngày", "Giờ", "Sân", "Trận đấu", "Nội dung", "Trạng thái"].map((header) => (
                    <th className="px-4 py-3" key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr className="border-t border-border" key={match.id}>
                    <td className="px-4 py-3 font-semibold">{match.code}</td>
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
      </section>
    </PageShell>
  );
}
