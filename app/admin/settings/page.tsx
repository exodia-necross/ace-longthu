import { saveTournamentSettings } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { BannerSettingsForm } from "@/components/banner-settings-form";
import { Card } from "@/components/ui/card";
import { getAdminTournament, getBannerSettings } from "@/lib/admin-data";

function toDateInput(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export default async function AdminSettingsPage({
  searchParams
}: {
  searchParams?: Promise<{ banner?: string; banner_error?: string }>;
}) {
  const params = await searchParams;
  const [tournament, banners] = await Promise.all([
    getAdminTournament(),
    getBannerSettings()
  ]);

  return (
    <AdminShell title="Cấu hình giải đấu">
      <Card className="mt-6">
        <form action={saveTournamentSettings} className="grid gap-4">
          <input name="tournamentId" type="hidden" value={tournament.id} />
          <label className="grid gap-2 text-sm font-semibold">
            Tên giải
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" defaultValue={tournament.name} name="name" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Khẩu hiệu
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" defaultValue={tournament.slogan} name="slogan" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Ngày tổ chức
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" defaultValue={toDateInput(tournament.startsAt)} name="startsAt" required type="date" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Địa điểm
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" defaultValue={tournament.venue} name="venue" />
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input defaultChecked={tournament.registrationOpen} name="registrationOpen" type="checkbox" /> Mở đăng ký
          </label>
          <button className="w-fit rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white" type="submit">Lưu cấu hình</button>
        </form>
      </Card>

      <Card className="mt-6">
        <div>
          <h3 className="text-xl font-bold">Quản lý banner website</h3>
          <p className="mt-2 text-sm text-mutedForeground">Thay banner cho giải đấu mới bằng cách dán URL ảnh hoặc upload file mới. Kích thước đề xuất: banner chính 1920×700, banner phụ 1920×300.</p>
          {params?.banner === "saved" ? (
            <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              Đã lưu banner. Nếu ảnh chưa đổi ngay, hãy tải lại trang chủ.
            </p>
          ) : null}
          {params?.banner_error ? (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              Không thể lưu banner: {params.banner_error}
            </p>
          ) : null}
        </div>
        <BannerSettingsForm banners={banners} />
      </Card>
    </AdminShell>
  );
}
