import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";

export default async function ResultsPage() {
  const { matches } = await getPublicData();
  const completed = matches.filter((match) => match.status === "Đã kết thúc");
  return (
    <PageShell>
      <section className="container-page py-10">
        <h1 className="text-3xl font-black">Kết quả</h1>
        <div className="mt-6 grid gap-4">
          {completed.map((match) => (
            <Card key={match.id}>
              <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="text-sm font-semibold text-court-blue">{match.code} - {match.eventType}</p>
                  <h2 className="text-xl font-bold">{match.homeTeam} vs {match.awayTeam}</h2>
                </div>
                <p className="font-mono text-lg font-bold">{match.score}</p>
                <p className="rounded-md bg-court-green px-3 py-2 text-sm font-bold text-white">Thắng: {match.winner}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
