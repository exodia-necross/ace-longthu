import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { deletePlayer, updatePlayerStatus } from "@/app/admin/actions";
import { getAdminPlayers } from "@/lib/admin-data";

export default async function AdminMembersPage() {
  const players = await getAdminPlayers();

  return (
    <AdminShell title="Quản lý thành viên">
      <Card className="mt-6 overflow-hidden p-0">
        <div className="flex flex-wrap gap-3 border-b border-border p-4">
          <input className="h-10 rounded-md border border-border px-3 text-sm dark:bg-white/5" placeholder="Tìm theo tên, email..." />
          <select className="h-10 rounded-md border border-border px-3 text-sm dark:bg-white/5">
            <option>Tất cả trạng thái</option>
            <option>Chờ duyệt</option>
            <option>Đã duyệt</option>
            <option>Từ chối</option>
          </select>
          <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Thêm VĐV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-muted">
              <tr>{["Họ tên", "Email", "Giới tính", "Trình độ", "Nội dung", "Trạng thái", "Thao tác"].map((item) => <th className="px-4 py-3" key={item}>{item}</th>)}</tr>
            </thead>
            <tbody>
              {players.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-mutedForeground" colSpan={7}>Chưa có vận động viên đăng ký.</td>
                </tr>
              )}
              {players.map((player) => (
                <tr className="border-t border-border" key={player.id}>
                  <td className="px-4 py-3 font-bold">{player.fullName}</td>
                  <td className="px-4 py-3">{player.email}</td>
                  <td className="px-4 py-3">{player.gender}</td>
                  <td className="px-4 py-3">{player.level}</td>
                  <td className="px-4 py-3">{player.eventType}</td>
                  <td className="px-4 py-3">{player.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <form action={updatePlayerStatus}>
                        <input name="playerId" type="hidden" value={player.id} />
                        <input name="status" type="hidden" value="approved" />
                        <button className="rounded-md bg-court-green px-3 py-1 font-semibold text-white">Duyệt</button>
                      </form>
                      <form action={updatePlayerStatus}>
                        <input name="playerId" type="hidden" value={player.id} />
                        <input name="status" type="hidden" value="rejected" />
                        <button className="rounded-md border border-border px-3 py-1 font-semibold">Từ chối</button>
                      </form>
                      <form action={deletePlayer}>
                        <input name="playerId" type="hidden" value={player.id} />
                        <button className="rounded-md bg-red-600 px-3 py-1 font-semibold text-white">Xóa</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
