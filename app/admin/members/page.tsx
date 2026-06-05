import { createPlayerFromAdmin, deletePlayer, updatePlayerStatus } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminPlayers } from "@/lib/admin-data";

const statusOptions = [
  ["", "Tất cả trạng thái"],
  ["Chờ duyệt", "Chờ duyệt"],
  ["Đã duyệt", "Đã duyệt"],
  ["Từ chối", "Từ chối"]
];

const levelOptions = [
  ["beginner", "Mới chơi"],
  ["intermediate", "Trung bình"],
  ["advanced", "Khá"],
  ["expert", "Giỏi"]
];

export default async function AdminMembersPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const query = (params?.q ?? "").trim().toLowerCase();
  const status = params?.status ?? "";
  const players = (await getAdminPlayers()).filter((player) => {
    const matchesQuery = !query || player.fullName.toLowerCase().includes(query) || player.email.toLowerCase().includes(query) || player.phone?.toLowerCase().includes(query);
    const matchesStatus = !status || player.status === status;
    return matchesQuery && matchesStatus;
  });

  return (
    <AdminShell title="Quản lý thành viên">
      <Card className="mt-6">
        <h3 className="text-xl font-bold">Thêm VĐV thủ công</h3>
        <form action={createPlayerFromAdmin} className="mt-4 grid gap-4 lg:grid-cols-4">
          <label className="grid gap-2 text-sm font-semibold">
            Họ tên
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="fullName" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Email
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="email" required type="email" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Số điện thoại
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="phone" required />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Ngày sinh
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="birthDate" required type="date" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Giới tính
            <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="gender">
              <option>Nam</option>
              <option>Nữ</option>
              <option>Khác</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Trình độ
            <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="level">
              {levelOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Tay thuận
            <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="dominantHand">
              <option>Tay phải</option>
              <option>Tay trái</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Trạng thái
            <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="status">
              <option value="approved">Đã duyệt</option>
              <option value="pending">Chờ duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold lg:col-span-3">
            Địa chỉ
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="address" />
          </label>
          <div className="flex items-end">
            <button className="h-10 rounded-md bg-court-blue px-4 text-sm font-bold text-white" type="submit">Thêm VĐV</button>
          </div>
        </form>
      </Card>

      <Card className="mt-6 overflow-hidden p-0">
        <form className="flex flex-wrap gap-3 border-b border-border p-4">
          <input className="h-10 rounded-md border border-border px-3 text-sm dark:bg-white/5" defaultValue={params?.q ?? ""} name="q" placeholder="Tìm theo tên, email, SĐT..." />
          <select className="h-10 rounded-md border border-border px-3 text-sm dark:bg-white/5" defaultValue={status} name="status">
            {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white" type="submit">Lọc</button>
          <a className="rounded-md border border-border px-4 py-2 text-sm font-bold" href="/admin/members">Xóa lọc</a>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-muted">
              <tr>
                {["Họ tên", "Email", "SĐT", "Giới tính", "Trình độ", "Trạng thái", "Thao tác"].map((item) => (
                  <th className="px-4 py-3" key={item}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.length === 0 && (
                <tr>
                  <td className="px-4 py-8 text-center text-mutedForeground" colSpan={7}>Không có vận động viên phù hợp.</td>
                </tr>
              )}
              {players.map((player) => {
                const isApproved = player.status === "Đã duyệt";
                const isRejected = player.status === "Từ chối";

                return (
                  <tr className="border-t border-border" key={player.id}>
                    <td className="px-4 py-3 font-bold">{player.fullName}</td>
                    <td className="px-4 py-3">{player.email}</td>
                    <td className="px-4 py-3">{player.phone}</td>
                    <td className="px-4 py-3">{player.gender}</td>
                    <td className="px-4 py-3">{player.level}</td>
                    <td className="px-4 py-3">
                      <span className={
                        isApproved
                          ? "rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700"
                          : isRejected
                            ? "rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-700"
                            : "rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700"
                      }>
                        {player.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {!isApproved && (
                          <form action={updatePlayerStatus}>
                            <input name="playerId" type="hidden" value={player.id} />
                            <input name="status" type="hidden" value="approved" />
                            <button className="rounded-md bg-court-green px-3 py-1 font-semibold text-white">Duyệt</button>
                          </form>
                        )}
                        {!isRejected && (
                          <form action={updatePlayerStatus}>
                            <input name="playerId" type="hidden" value={player.id} />
                            <input name="status" type="hidden" value="rejected" />
                            <button className="rounded-md border border-border px-3 py-1 font-semibold">Từ chối</button>
                          </form>
                        )}
                        <form action={deletePlayer}>
                          <input name="playerId" type="hidden" value={player.id} />
                          <button className="rounded-md bg-red-600 px-3 py-1 font-semibold text-white">Xóa</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminShell>
  );
}
