import { assignGroupsRandomly, assignTeamToGroup, createManualTeam, deleteTeam, generateTeamsFromApprovedPlayers } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { getAdminPlayers, getAdminTeams } from "@/lib/admin-data";

export default async function AdminPairingPage() {
  const players = await getAdminPlayers();
  const approvedPlayers = players.filter((player) => player.status === "Đã duyệt");
  const teams = await getAdminTeams();

  const eligibleTeams = teams.filter((t) => t.status === "Đủ điều kiện");
  const groupA = eligibleTeams.filter((t) => t.eventType === "Bảng A");
  const groupB = eligibleTeams.filter((t) => t.eventType === "Bảng B");
  const hasGroups = groupA.length > 0 || groupB.length > 0;

  return (
    <AdminShell title="Ghép cặp thi đấu">
      <div className="mt-6 grid gap-6">

        {/* === PHÂN BẢNG === */}
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">Phân bảng thi đấu</h3>
              <p className="mt-1 text-sm text-mutedForeground">
                Chia {eligibleTeams.length} đội vào Bảng A / B thi đấu vòng tròn.
                Top 2 mỗi bảng (điểm → hiệu số) vào vòng tiếp theo.
              </p>
            </div>
            <form action={assignGroupsRandomly}>
              <button className="rounded-md bg-court-green px-4 py-2 text-sm font-bold text-white">
                🎲 Chia bảng ngẫu nhiên
              </button>
            </form>
          </div>

          {/* Bảng A + B hiển thị song song */}
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              { label: "Bảng A", groupTeams: groupA, color: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30" },
              { label: "Bảng B", groupTeams: groupB, color: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30" }
            ].map(({ label, groupTeams, color }) => (
              <div className={`rounded-lg border p-4 ${color}`} key={label}>
                <p className="mb-3 text-xs font-black uppercase tracking-widest text-mutedForeground">
                  {label} — {groupTeams.length} đội
                </p>
                {groupTeams.length === 0
                  ? <p className="text-sm italic text-mutedForeground">Chưa có đội</p>
                  : (
                    <div className="space-y-2">
                      {groupTeams.map((team, i) => (
                        <div className="flex items-center gap-2" key={team.id}>
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black shadow dark:bg-white/10">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">{team.name}</p>
                            <p className="truncate text-xs text-mutedForeground">{team.members.join(" - ")}</p>
                          </div>
                          {/* Chuyển bảng nhanh */}
                          <form action={assignTeamToGroup}>
                            <input type="hidden" name="teamId" value={team.id} />
                            <input type="hidden" name="group" value={label === "Bảng A" ? "Bảng B" : "Bảng A"} />
                            <button
                              className="rounded bg-white px-2 py-1 text-xs font-semibold shadow hover:bg-gray-100 dark:bg-white/10 dark:hover:bg-white/20"
                              title={`Chuyển sang ${label === "Bảng A" ? "Bảng B" : "Bảng A"}`}
                            >
                              → {label === "Bảng A" ? "B" : "A"}
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Đội chưa được chia bảng */}
          {eligibleTeams.filter((t) => t.eventType !== "Bảng A" && t.eventType !== "Bảng B").length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-mutedForeground">Chưa vào bảng nào</p>
              <div className="space-y-2">
                {eligibleTeams
                  .filter((t) => t.eventType !== "Bảng A" && t.eventType !== "Bảng B")
                  .map((team) => (
                    <div className="flex items-center gap-3 rounded-md border border-dashed border-border p-3" key={team.id}>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{team.name}</p>
                        <p className="truncate text-xs text-mutedForeground">{team.members.join(" - ")}</p>
                      </div>
                      <div className="flex gap-2">
                        {["Bảng A", "Bảng B"].map((g) => (
                          <form action={assignTeamToGroup} key={g}>
                            <input type="hidden" name="teamId" value={team.id} />
                            <input type="hidden" name="group" value={g} />
                            <button className="rounded bg-court-blue px-2 py-1 text-xs font-bold text-white">
                              + {g}
                            </button>
                          </form>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {!hasGroups && eligibleTeams.length === 0 && (
            <div className="mt-4 rounded-md border border-dashed border-border p-6 text-center text-sm text-mutedForeground">
              Chưa có đội đủ điều kiện. Tạo đội bên dưới rồi mới chia bảng.
            </div>
          )}
        </Card>

        {/* === ĐỘI HIỆN CÓ + TẠO THỦ CÔNG === */}
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Đội/cặp hiện có</h3>
                <p className="mt-2 text-sm text-mutedForeground">Quản lý tất cả đội, gán bảng thủ công hoặc xóa.</p>
              </div>
              <form action={generateTeamsFromApprovedPlayers}>
                <button className="rounded-md bg-court-blue px-4 py-2 text-sm font-bold text-white">Ghép theo trình độ</button>
              </form>
            </div>
            <div className="mt-4 space-y-3">
              {teams.length === 0 && <p className="text-sm text-mutedForeground">Chưa có đội/cặp thi đấu trong database.</p>}
              {teams.map((team) => (
                <div className="rounded-md border border-border p-3" key={team.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{team.name}</p>
                      <p className="text-sm text-mutedForeground">{team.members.join(" - ") || "Chưa có thành viên"}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {/* Dropdown gán bảng */}
                      {team.status === "Đủ điều kiện" && (
                        <form action={assignTeamToGroup} className="flex items-center gap-1">
                          <input type="hidden" name="teamId" value={team.id} />
                          <select
                            name="group"
                            defaultValue={team.eventType === "Bảng A" || team.eventType === "Bảng B" ? team.eventType : ""}
                            className="h-7 rounded border border-border px-1 text-xs dark:bg-white/5"
                          >
                            <option value="">-- Bảng --</option>
                            <option value="Bảng A">Bảng A</option>
                            <option value="Bảng B">Bảng B</option>
                          </select>
                          <button className="rounded bg-court-blue px-2 py-1 text-xs font-bold text-white">Gán</button>
                        </form>
                      )}
                      <span className={`rounded-md px-2 py-1 text-xs font-bold ${
                        team.eventType === "Bảng A" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : team.eventType === "Bảng B" ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                        : "bg-muted"
                      }`}>
                        {team.eventType}
                      </span>
                      <form action={deleteTeam}>
                        <input name="teamId" type="hidden" value={team.id} />
                        <button className="rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white">Xóa</button>
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
                <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="eventType" placeholder="Ví dụ: Tự do, Bảng A, Bảng B..." defaultValue="Tự do" />
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
                <span className="text-xs font-normal text-mutedForeground">Giữ Ctrl để chọn nhiều người.</span>
              </label>
              <button className="w-fit rounded-md bg-court-green px-4 py-2 text-sm font-bold text-white" type="submit">Tạo thủ công</button>
            </form>
          </Card>

          <Card className="xl:col-span-2">
            <h3 className="text-xl font-bold">Danh sách vận động viên đã duyệt</h3>
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
      </div>
    </AdminShell>
  );
}
