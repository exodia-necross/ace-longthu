import { createManualTeam, deleteTeam, generateTeamsFromApprovedPlayers } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminPlayers, getAdminTeams } from "@/lib/admin-data";

export default async function AdminPairingPage() {
  const players = await getAdminPlayers();
  const approvedPlayers = players.filter((player) => player.status === "Đã duyệt");
  const teams = await getAdminTeams();

  return (
    <AdminShell title="Ghép cặp thi đấu">
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold">Đội/cặp hiện có</h3>
              <p className="mt-2 text-sm text-mutedForeground">Có thể tạo đội đơn, đội đôi hoặc nhóm bất kỳ để admin xếp trận tự do.</p>
            </div>
            <form action={generateTeamsFromApprovedPlayers}>
              <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Ghép theo trình độ</button>
            </form>
          </div>
          <div className="mt-4 space-y-3">
            {teams.length === 0 && <p className="text-sm text-mutedForeground">Chưa có đội/cặp thi đấu trong database.</p>}
            {teams.map((team) => (
              <div className="rounded-md border border-border p-4" key={team.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{team.name}</p>
                    <p className="text-sm text-mutedForeground">{team.members.join(" - ") || "Chưa có thành viên"}</p>
                    <p className="mt-1 text-xs font-semibold text-court-blue">{team.eventType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-3 py-1 text-xs font-bold">{team.status}</span>
                    <form action={deleteTeam}>
                      <input name="teamId" type="hidden" value={team.id} />
                      <button className="rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white">Xóa</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-bold">Tạo đội/cặp thủ công</h3>
          <form action={createManualTeam} className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Tên đội/cặp
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="name" placeholder="Ví dụ: Khoa / Hà hoặc Hà solo" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Nhãn đội/cặp
              <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="eventType" placeholder="Ví dụ: Tự do, Trình khá, Đội nam/nữ..." defaultValue="Tự do" />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Trạng thái
              <select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="status">
                <option value="approved">Đủ điều kiện</option>
                <option value="pending">Chờ ghép</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Chọn vận động viên đã duyệt
              <select className="min-h-36 rounded-md border border-border p-3 dark:bg-white/5" multiple name="playerIds" required>
                {approvedPlayers.map((player) => (
                  <option key={player.id} value={player.id}>{player.fullName} - {player.level}</option>
                ))}
              </select>
              <span className="text-xs font-normal text-mutedForeground">Giữ Ctrl để chọn nhiều người. Có thể chọn 1 người cho đánh đơn hoặc nhiều người cho đánh đôi/nhóm.</span>
            </label>
            <button className="w-fit rounded-md bg-court-green px-4 py-2 text-sm font-bold text-white" type="submit">Tạo thủ công</button>
          </form>
        </Card>

        <Card className="xl:col-span-2">
          <h3 className="text-xl font-bold">Danh sách vận động viên đã duyệt</h3>
          <p className="mt-2 text-sm text-mutedForeground">Dùng danh sách này để tự chọn người vào đội/cặp theo trình độ, không bị khóa theo đơn/đôi/nam/nữ.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {approvedPlayers.length === 0 && <p className="text-sm text-mutedForeground">Chưa có vận động viên đã duyệt.</p>}
            {approvedPlayers.map((player) => (
              <div className="rounded-md bg-muted p-4" key={player.id}>
                <p className="font-bold">{player.fullName}</p>
                <p className="text-sm text-mutedForeground">{player.gender} | {player.level}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
