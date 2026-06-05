import Link from "next/link";
import { CalendarDays, MapPin, Trophy, Users } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { getPublicData } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function HomePage() {
  const { tournament, banners, announcements, players, matches, rankings } = await getPublicData();

  return (
    <PageShell>
      <section className="bg-court-ink py-4 sm:py-6">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-md border border-white/15 bg-court-ink shadow-xl">
            <img
              src={banners.mainBannerUrl}
              alt={banners.altText}
              className="aspect-[1920/700] w-full object-cover"
            />
            <Link
              href="/register"
              className="absolute bottom-4 right-4 hidden rounded-md bg-yellow-400 px-5 py-3 text-sm font-black text-court-ink shadow-lg transition hover:bg-court-lime sm:inline-flex"
            >
              Đăng ký tham gia
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CalendarDays} label="Ngày khai mạc" value={formatDate(tournament.startsAt)} />
        <StatCard icon={MapPin} label="Địa điểm" value={tournament.venue || "Chưa cập nhật"} />
        <StatCard icon={Users} label="VĐV đăng ký" value={players.length} />
        <StatCard icon={Trophy} label="Trận đã lên lịch" value={matches.length} />
      </section>

      {banners.subBannerUrl ? (
        <section className="container-page pb-10">
          <img
            src={banners.subBannerUrl}
            alt={`${banners.altText} - thông tin phụ`}
            className="aspect-[1920/300] w-full rounded-md border border-border object-cover shadow-sm"
          />
        </section>
      ) : null}

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
