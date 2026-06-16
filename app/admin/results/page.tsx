import { AdminShell } from "@/components/admin-shell";
import { AdminResultRow } from "@/components/admin-result-row";
import { Card } from "@/components/ui/card";
import { getAdminMatches } from "@/lib/admin-data";
import { formatDate, formatTime } from "@/lib/utils";

const SECTION_ORDER = ["Bảng A", "Bảng B", "Bán kết", "Tranh hạng 3", "Chung kết"];

export default async function AdminResultsPage() {
  const matches = await getAdminMatches();

  if (matches.length === 0) {
    return (
      <AdminShell title="Nhập kết quả">
        <Card className="mt-6">
          <p className="text-sm text-mutedForeground">Chưa có trận đấu để nhập kết quả.</p>
        </Card>
      </AdminShell>
    );
  }

  // Group matches by eventType
  const grouped = new Map<string, typeof matches>();
  for (const match of matches) {
    const key = match.eventType;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(match);
  }

  // Sort sections: known order first, then others alphabetically
  const sections = [...grouped.keys()].sort((a, b) => {
    const ia = SECTION_ORDER.indexOf(a);
    const ib = SECTION_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "vi");
  });

  const totalDone = matches.filter((m) => m.status === "Đã kết thúc").length;

  return (
    <AdminShell title="Nhập kết quả">
      <div className="mt-6 space-y-8">
        {/* Summary */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="rounded-md bg-muted px-3 py-1.5 font-semibold">
            Tổng: {matches.length} trận
          </span>
          <span className="rounded-md bg-green-100 px-3 py-1.5 font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
            ✓ Đã có kết quả: {totalDone}
          </span>
          <span className="rounded-md bg-orange-100 px-3 py-1.5 font-semibold text-orange-700 dark:bg-orange-900/30">
            ○ Chưa nhập: {matches.length - totalDone}
          </span>
        </div>

        {sections.map((section) => {
          const sectionMatches = grouped.get(section)!.sort((a, b) =>
            new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
          );
          const doneCnt = sectionMatches.filter((m) => m.status === "Đã kết thúc").length;

          return (
            <div key={section}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-lg font-black">{section}</h2>
                <span className="text-sm text-mutedForeground">
                  {doneCnt}/{sectionMatches.length} trận có kết quả
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-court-green transition-all"
                    style={{ width: `${sectionMatches.length ? (doneCnt / sectionMatches.length) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                {sectionMatches.map((match) => (
                  <div key={match.id}>
                    <div className="mb-1 flex items-center gap-2 px-1">
                      <span className="text-xs text-mutedForeground">
                        {formatDate(match.startsAt)} {formatTime(match.startsAt)} · {match.court}
                      </span>
                    </div>
                    <AdminResultRow match={match} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
