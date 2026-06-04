import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";

export default async function TeamsPage() {
  const { teams } = await getPublicData();
  return (
    <PageShell>
      <section className="container-page py-10">
        <h1 className="text-3xl font-black">Cặp đấu</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {teams.map((team) => (
            <Card key={team.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{team.name}</h2>
                  <p className="mt-2 text-sm text-mutedForeground">{team.members.join(" - ")}</p>
                  <p className="mt-3 font-semibold text-court-blue">{team.eventType}</p>
                </div>
                <span className="rounded-md bg-court-green px-3 py-1 text-xs font-bold text-white">{team.status}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
