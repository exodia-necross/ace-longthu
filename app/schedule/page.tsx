import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";

export default async function SchedulePage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { matches } = await getPublicData();
  const date = params?.date ?? "";
  const court = params?.court ?? "";
  const label = params?.label ?? "";
  const dates = [...new Set(matches.map((match) => new Date(match.startsAt).toISOString().slice(0, 10)))];
  const courts = [...new Set(matches.map((match) => match.court))];
  const labels = [...new Set(matches.map((match) => match.eventType))];
  const filteredMatches = matches.filter((match) => {
    const matchDate = new Date(match.startsAt).toISOString().slice(0, 10);
    return (!date || matchDate === date) && (!court || match.court === court) && (!label || match.eventType === label);
  });

  const isFiltered = !!(date || court || label);
  const groupAMatches = filteredMatches.filter((m) => m.eventType === "Bảng A");
  const groupBMatches = filteredMatches.filter((m) => m.eventType === "Bảng B");
  const otherMatches = filteredMatches.filter((m) => m.eventType !== "Bảng A" && m.eventType !== "Bảng B");
  const hasGroupMatches = !isFiltered && (groupAMatches.length > 0 || groupBMatches.length > 0);

  return (
    <PageShell>
      <section className="container-page py-10">
        <h1 className="text-3xl font-black">Lịch thi đấu</h1>
        <form className="mt-5 flex flex-wrap gap-2">
          <select className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5" defaultValue={date} name="date">
            <option value="">Tất cả ngày</option>
            {dates.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5" defaultValue={court} name="court">
            <option value="">Tất cả sân</option>
            {courts.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5" defaultValue={label} name="label">
            <option value="">Tất cả nhãn</option>
            {labels.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <button className="rounded-md bg-court-blue px-4 text-sm font-bold text-white" type="submit">Lọc</button>
          {isFiltered && (
            <a className="flex h-10 items-center rounded-md border border-border px-4 text-sm font-semibold" href="/schedule">Xóa lọc</a>
          )}
        </form>

        {hasGroupMatches ? (
          <div className="mt-6 space-y-8">
            {[
              { label: "Bảng A", matchList: groupAMatches },
              { label: "Bảng B", matchList: groupBMatches }
            ].map(({ label: groupLabel, matchList }) => matchList.length > 0 && (
              <div key={groupLabel}>
                <h2 className="mb-3 text-xl font-black">{groupLabel} <span className="text-sm font-normal text-mutedForeground">— {matchList.length} trận vòng tròn</span></h2>
                <Card className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {["Mã trận", "Ngày", "Giờ", "Sân", "Trận đấu", "Trạng thái"].map((header) => (
                            <th className="px-4 py-3" key={header}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matchList.map((match) => (
                          <tr className="border-t border-border" key={match.id}>
                            <td className="px-4 py-3 font-semibold">{match.code}</td>
                            <td className="px-4 py-3">{formatDate(match.startsAt)}</td>
                            <td className="px-4 py-3">{formatTime(match.startsAt)}</td>
                            <td className="px-4 py-3">{match.court}</td>
                            <td className="px-4 py-3">{match.homeTeam} vs {match.awayTeam}</td>
                            <td className="px-4 py-3">{match.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            ))}
            {otherMatches.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-black">Trận khác</h2>
                <Card className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-muted">
                        <tr>
                          {["Mã trận", "Ngày", "Giờ", "Sân", "Trận đấu", "Nhãn", "Trạng thái"].map((header) => (
                            <th className="px-4 py-3" key={header}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {otherMatches.map((match) => (
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
              </div>
            )}
          </div>
        ) : (
          <Card className="mt-6 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-muted">
                  <tr>
                    {["Mã trận", "Ngày", "Giờ", "Sân", "Trận đấu", "Nhãn", "Trạng thái"].map((header) => (
                      <th className="px-4 py-3" key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMatches.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-mutedForeground" colSpan={7}>Không có trận phù hợp.</td>
                    </tr>
                  )}
                  {filteredMatches.map((match) => (
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
        )}
      </section>
    </PageShell>
  );
}
