import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { tournament } from "@/lib/mock-data";

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Cấu hình giải đấu">
      <Card className="mt-6">
        <form className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">Tên giải<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" defaultValue={tournament.name} /></label>
          <label className="grid gap-2 text-sm font-semibold">Khẩu hiệu<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" defaultValue={tournament.slogan} /></label>
          <label className="grid gap-2 text-sm font-semibold">Ngày tổ chức<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" defaultValue="2026-07-19" type="date" /></label>
          <label className="grid gap-2 text-sm font-semibold">Địa điểm<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" defaultValue={tournament.venue} /></label>
          <label className="flex items-center gap-3 text-sm font-semibold"><input defaultChecked={tournament.registrationOpen} type="checkbox" /> Mở đăng ký</label>
          <button className="w-fit rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white" type="button">Lưu cấu hình</button>
        </form>
      </Card>
    </AdminShell>
  );
}
