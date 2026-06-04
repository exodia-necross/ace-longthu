import Image from "next/image";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";

export default async function PlayersPage() {
  const { players } = await getPublicData();

  return (
    <PageShell>
      <section className="container-page py-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black">Vận động viên</h1>
            <p className="mt-2 text-mutedForeground">Danh sách công khai không hiển thị số điện thoại để bảo vệ riêng tư.</p>
          </div>
          <div className="flex gap-2">
            <input className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5" placeholder="Tìm kiếm..." />
            <select className="h-10 rounded-md border border-border bg-white px-3 text-sm dark:bg-white/5">
              <option>Tất cả trình độ</option>
              <option>Mới chơi</option>
              <option>Trung bình</option>
              <option>Khá</option>
              <option>Giỏi</option>
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <Card key={player.id}>
              <div className="flex gap-4">
                <Image alt={player.fullName} className="size-16 rounded-md object-cover" height={80} src={player.avatarUrl} width={80} />
                <div>
                  <h2 className="font-bold">{player.fullName}</h2>
                  <p className="text-sm text-mutedForeground">{player.gender} - {player.level}</p>
                  <p className="mt-2 text-sm font-semibold text-court-blue">{player.eventType}</p>
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
