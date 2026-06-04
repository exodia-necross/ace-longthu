import Link from "next/link";
import { CalendarDays, MapPin, Trophy, Users } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const { tournament, announcements, players, matches, rankings } = await getPublicData();

  return (
    <PageShell>
      <section className="court-lines relative overflow-hidden bg-court-ink text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1800&q=85')] bg-cover bg-center opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-court-ink via-court-ink/84 to-court-ink/30" />
        <div className="container-page relative grid min-h-[560px] items-center py-16">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-md bg-court-lime px-3 py-1 text-sm font-bold text-court-ink">
              {tournament.slogan}
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-6xl">{tournament.name}</h1>
            <p className="mt-5 max-w-2xl text-lg text-white/82">
              Nền tảng quản lý giải đấu cầu lông từ đăng ký, ghép cặp, sinh lịch tự động đến cập nhật kết quả và bảng xếp hạng theo thời gian thực.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="rounded-md bg-court-green px-5 py-3 font-bold text-white" href="/register">
                Đăng ký tham gia
              </Link>
              <Link className="rounded-md border border-white/40 px-5 py-3 font-bold text-white" href="/schedule">
                Xem lịch thi đấu
              </Link>
              <Link className="rounded-md border border-white/40 px-5 py-3 font-bold text-white" href="/ranking">
                Bảng xếp hạng
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Ngày khai mạc" value={formatDate(tournament.startsAt)} />
        <StatCard icon={MapPin} label="Địa điểm" value={tournament.venue || "Chưa cập nhật"} />
        <StatCard icon={Users} label="VĐV đăng ký" value={players.length} />
        <StatCard icon={Trophy} label="Trận đã lên lịch" value={matches.length} />
      </section>

      <section className="container-page grid gap-6 pb-12 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-2xl font-bold">Thông báo mới nhất</h2>
          <div className="mt-5 space-y-4">
            {announcements.map((item) => (
              <article className="rounded-md border border-border p-4" key={item.id}>
                <p className="text-xs font-semibold uppercase tracking-wide text-court-blue">{formatDate(item.createdAt)}</p>
                <h3 className="mt-1 font-bold">{item.title}</h3>
                <p className="mt-2 text-sm text-mutedForeground">{item.body}</p>
              </article>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-2xl font-bold">Top bảng xếp hạng</h2>
          <div className="mt-5 space-y-3">
            {rankings.slice(0, 4).map((row) => (
              <div className="flex items-center justify-between rounded-md bg-muted p-3" key={row.team}>
                <div>
                  <p className="font-semibold">#{row.rank} {row.team}</p>
                  <p className="text-sm text-mutedForeground">{row.wins} thắng / {row.matches} trận</p>
                </div>
                <span className="rounded-md bg-court-green px-3 py-1 text-sm font-bold text-white">{row.points} điểm</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </PageShell>
  );
}
