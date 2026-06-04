import { saveTournamentSettings } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminTournament } from "@/lib/admin-data";

function toDateInput(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

export default async function AdminSettingsPage() {
  const tournament = await getAdminTournament();

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
    </AdminShell>
  );
}
