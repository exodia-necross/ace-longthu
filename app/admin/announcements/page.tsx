import { deleteAnnouncement, saveAnnouncement } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminAnnouncements, getAdminTournament } from "@/lib/admin-data";
import { formatDate } from "@/lib/utils";

export default async function AdminAnnouncementsPage() {
  const [tournament, announcements] = await Promise.all([
    getAdminTournament(),
    getAdminAnnouncements()
  ]);

  return (
    <AdminShell title="Chỉnh sửa thông báo">
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h3 className="text-xl font-bold">Thêm thông báo mới</h3>
          <form action={saveAnnouncement} className="mt-4 grid gap-4">
            <input name="tournamentId" type="hidden" value={tournament.id} />
            <label className="grid gap-2 text-sm font-semibold">
              Tiêu đề
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="title" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Nội dung
              <textarea className="min-h-32 rounded-md border border-border p-3 dark:bg-white/5" name="body" required />
            </label>
            <label className="flex items-center gap-3 text-sm font-semibold">
              <input defaultChecked name="isPublic" type="checkbox" /> Hiển thị công khai
            </label>
            <button className="w-fit rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white" type="submit">Thêm thông báo</button>
          </form>
        </Card>

        <Card>
          <h3 className="text-xl font-bold">Danh sách thông báo</h3>
          <div className="mt-4 grid gap-4">
            {announcements.length === 0 && <p className="text-sm text-mutedForeground">Chưa có thông báo.</p>}
            {announcements.map((announcement) => (
              <div className="rounded-md border border-border p-4" key={announcement.id}>
                <form action={saveAnnouncement} className="grid gap-3">
                  <input name="announcementId" type="hidden" value={announcement.id} />
                  <input name="tournamentId" type="hidden" value={tournament.id} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase text-court-blue">{formatDate(announcement.createdAt)}</p>
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <input defaultChecked={announcement.isPublic !== false} name="isPublic" type="checkbox" /> Công khai
                    </label>
                  </div>
                  <input className="h-10 rounded-md border border-border px-3 font-bold dark:bg-white/5" defaultValue={announcement.title} name="title" required />
                  <textarea className="min-h-24 rounded-md border border-border p-3 dark:bg-white/5" defaultValue={announcement.body} name="body" required />
                  <div className="flex gap-2">
                    <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white" type="submit">Lưu</button>
                    <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white" form={`delete-${announcement.id}`} type="submit">Xóa</button>
                  </div>
                </form>
                <form action={deleteAnnouncement} id={`delete-${announcement.id}`}>
                  <input name="announcementId" type="hidden" value={announcement.id} />
                </form>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
