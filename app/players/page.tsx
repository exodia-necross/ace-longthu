import Image from "next/image";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";

export default async function PlayersPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const { players } = await getPublicData();
  const query = (params?.q ?? "").trim().toLowerCase();
  const level = params?.level ?? "";
  const filteredPlayers = players.filter((player) => {
    const matchesQuery = !query || player.fullName.toLowerCase().includes(query);
    const matchesLevel = !level || player.level === level;
    return matchesQuery && matchesLevel;
  });

  return (
    <PageShell>
      <section className="container-page py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black">Vận động viên</h1>
            <p className="mt-2 text-mutedForeground">Danh sách công khai không hiển thị số điện thoại để bảo vệ riêng tư.</p>
          </div>
          <form className="flex flex-wrap gap-2">
            <input className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5" defaultValue={params?.q ?? ""} name="q" placeholder="Tìm kiếm..." />
            <select className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5" defaultValue={level} name="level">
              <option value="">Tất cả trình độ</option>
              <option>Mới chơi</option>
              <option>Trung bình</option>
              <option>Khá</option>
              <option>Giỏi</option>
            </select>
            <button className="rounded-md bg-court-blue px-4 text-sm font-bold text-white" type="submit">Lọc</button>
          </form>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.length === 0 && <p className="text-sm text-mutedForeground">Không tìm thấy vận động viên phù hợp.</p>}
          {filteredPlayers.map((player) => (
            <Card key={player.id}>
              <div className="flex gap-4">
                <Image alt={player.fullName} className="size-16 rounded-md object-cover" height={80} src={player.avatarUrl} width={80} />
                <div>
                  <h2 className="font-bold">{player.fullName}</h2>
                  <p className="text-sm text-mutedForeground">{player.gender} - {player.level}</p>
                  <span className="mt-3 inline-flex rounded-md bg-muted px-2 py-1 text-xs">{player.status}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
