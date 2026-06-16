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
  const KNOCKOUT = ["Bán kết", "Tranh hạng 3", "Chung kết"];
  const groupAMatches = filteredMatches.filter((m) => m.eventType === "Bảng A");
  const groupBMatches = filteredMatches.filter((m) => m.eventType === "Bảng B");
  const semiMatches = filteredMatches.filter((m) => m.eventType === "Bán kết");
  const thirdMatches = filteredMatches.filter((m) => m.eventType === "Tranh hạng 3");
  const finalMatches = filteredMatches.filter((m) => m.eventType === "Chung kết");
  const otherMatches = filteredMatches.filter((m) => m.eventType !== "Bảng A" && m.eventType !== "Bảng B" && !KNOCKOUT.includes(m.eventType));
  const hasGroupMatches = !isFiltered && (groupAMatches.length > 0 || groupBMatches.length > 0);
  const hasKnockout = !isFiltered && (semiMatches.length > 0 || thirdMatches.length > 0 || finalMatches.length > 0);

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
            {/* Vòng bảng */}
            {[
              { label: "Bảng A", matchList: groupAMatches, sub: "vòng tròn" },
              { label: "Bảng B", matchList: groupBMatches, sub: "vòng tròn" }
            ].map(({ label: groupLabel, matchList, sub }) => matchList.length > 0 && (
              <div key={groupLabel}>
                <h2 className="mb-3 text-xl font-black">{groupLabel} <span className="text-sm font-normal text-mutedForeground">— {matchList.length} trận {sub}</span></h2>
                <PublicMatchTable matchList={matchList} />
              </div>
            ))}

            {/* Vòng loại trực tiếp */}
            {hasKnockout && (
              <div>
                <h2 className="mb-4 text-xl font-black">Vòng loại trực tiếp</h2>
                <div className="space-y-6">
                  {[
                    { label: "Bán kết", matchList: semiMatches, desc: "Nhất A vs Nhì B · Nhất B vs Nhì A", accent: "bg-orange-50 dark:bg-orange-950/20" },
                    { label: "Tranh hạng 3", matchList: thirdMatches, desc: "2 đội thua bán kết", accent: "bg-gray-50 dark:bg-gray-900/20" },
                    { label: "🏆 Chung kết", matchList: finalMatches, desc: "2 đội thắng bán kết", accent: "bg-yellow-50 dark:bg-yellow-950/20" }
                  ].map(({ label, matchList, desc, accent }) => matchList.length > 0 && (
                    <div key={label}>
                      <div className={`mb-2 flex items-baseline gap-2 rounded-t-lg border border-b-0 border-border px-4 py-3 ${accent}`}>
                        <span className="font-black">{label}</span>
                        <span className="text-xs text-mutedForeground">{desc}</span>
                      </div>
                      <PublicMatchTable matchList={matchList} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {otherMatches.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-black">Trận khác</h2>
                <PublicMatchTable matchList={otherMatches} showLabel />
              </div>
            )}
          </div>
        ) : (
          <Card className="mt-6 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-muted">
                  <tr>{["Mã trận", "Ngày", "Giờ", "Sân", "Trận đấu", "Nhãn", "Trạng thái"].map((h) => <th className="px-4 py-3" key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredMatches.length === 0 && (
                    <tr><td className="px-4 py-8 text-center text-mutedForeground" colSpan={7}>Không có trận phù hợp.</td></tr>
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

type PublicMatch = { id: string; code: string; startsAt: string; court: string; homeTeam: string; awayTeam: string; status: string; eventType: string };

function PublicMatchTable({ matchList, showLabel }: { matchList: PublicMatch[]; showLabel?: boolean }) {
  const headers = ["Mã trận", "Ngày", "Giờ", "Sân", "Trận đấu", ...(showLabel ? ["Nhãn"] : []), "Trạng thái"];
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-muted">
            <tr>{headers.map((h) => <th className="px-4 py-3" key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {matchList.map((match) => (
              <tr className={`border-t border-border ${match.status === "Đã kết thúc" ? "bg-green-50/50 dark:bg-green-950/10" : ""}`} key={match.id}>
                <td className="px-4 py-3 font-semibold">{match.code}</td>
                <td className="px-4 py-3">{formatDate(match.startsAt)}</td>
                <td className="px-4 py-3">{formatTime(match.startsAt)}</td>
                <td className="px-4 py-3">{match.court}</td>
                <td className="px-4 py-3 font-medium">{match.homeTeam} vs {match.awayTeam}</td>
                {showLabel && <td className="px-4 py-3">{match.eventType}</td>}
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    match.status === "Đã kết thúc" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : match.status === "Đang thi đấu" ? "bg-yellow-100 text-yellow-700"
                    : "bg-muted text-mutedForeground"
                  }`}>{match.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
