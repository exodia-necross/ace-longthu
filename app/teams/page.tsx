import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";

const GROUP_ORDER: Record<string, number> = { "Bảng A": 0, "Bảng B": 1 };

export default async function TeamsPage() {
  const { teams } = await getPublicData();

  const sorted = [...teams].sort((a, b) => {
    const ga = GROUP_ORDER[a.eventType] ?? 99;
    const gb = GROUP_ORDER[b.eventType] ?? 99;
    if (ga !== gb) return ga - gb;
    return a.name.localeCompare(b.name, "vi");
  });

  const groupA = sorted.filter((t) => t.eventType === "Bảng A");
  const groupB = sorted.filter((t) => t.eventType === "Bảng B");
  const others = sorted.filter((t) => t.eventType !== "Bảng A" && t.eventType !== "Bảng B");
  const hasGroups = groupA.length > 0 || groupB.length > 0;

  return (
    <PageShell>
      <section className="container-page py-10">
        <h1 className="text-3xl font-black">Cặp đấu</h1>

        {hasGroups ? (
          <div className="mt-6 space-y-10">
            {[
              { label: "Bảng A", list: groupA },
              { label: "Bảng B", list: groupB }
            ].map(({ label, list }) => list.length > 0 && (
              <div key={label}>
                <h2 className="mb-4 text-lg font-black uppercase tracking-wider text-mutedForeground">{label} — {list.length} đội</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {list.map((team) => (
                    <Card key={team.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold">{team.name}</h3>
                          <p className="mt-2 text-sm text-mutedForeground">{team.members.join(" - ")}</p>
                          <p className="mt-3 font-semibold text-court-blue">{team.eventType}</p>
                        </div>
                        <span className="rounded-md bg-court-green px-3 py-1 text-xs font-bold text-white">{team.status}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            {others.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-black uppercase tracking-wider text-mutedForeground">Khác — {others.length} đội</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {others.map((team) => (
                    <Card key={team.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold">{team.name}</h3>
                          <p className="mt-2 text-sm text-mutedForeground">{team.members.join(" - ")}</p>
                          <p className="mt-3 font-semibold text-court-blue">{team.eventType}</p>
                        </div>
                        <span className="rounded-md bg-court-green px-3 py-1 text-xs font-bold text-white">{team.status}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {sorted.map((team) => (
              <Card key={team.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold">{team.name}</h3>
                    <p className="mt-2 text-sm text-mutedForeground">{team.members.join(" - ")}</p>
                    <p className="mt-3 font-semibold text-court-blue">{team.eventType}</p>
                  </div>
                  <span className="rounded-md bg-court-green px-3 py-1 text-xs font-bold text-white">{team.status}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
