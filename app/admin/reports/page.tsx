import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";

const reports = [
  ["Danh sách vận động viên", "/api/reports?type=players"],
  ["Danh sách cặp đấu", "/api/reports?type=teams"],
  ["Lịch thi đấu", "/api/reports?type=matches"],
  ["Bảng xếp hạng", "/api/reports?type=rankings"]
];

export default function AdminReportsPage() {
  return (
    <AdminShell title="Báo cáo">
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reports.map(([label, href]) => (
          <Card key={label}>
            <h3 className="font-bold">{label}</h3>
            <p className="mt-2 text-sm text-mutedForeground">Xuất CSV để kiểm tra, in ấn hoặc nhập Excel.</p>
            <Link className="mt-4 inline-flex rounded-md bg-court-green px-4 py-2 text-sm font-bold text-white" href={href}>Tải CSV</Link>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
