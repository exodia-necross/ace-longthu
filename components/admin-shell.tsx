import Link from "next/link";
import { Download, Settings } from "lucide-react";

export const adminNav = [
  ["Tổng quan", "/admin/dashboard"],
  ["Thành viên", "/admin/members"],
  ["Ghép cặp", "/admin/pairing"],
  ["Lịch thi đấu", "/admin/schedule"],
  ["Kết quả", "/admin/results"],
  ["Bảng xếp hạng", "/admin/ranking"],
  ["Cấu hình", "/admin/settings"],
  ["Báo cáo", "/admin/reports"]
];

export function AdminShell({ children, title, eyebrow = "Khu vực quản trị" }: { children: React.ReactNode; title: string; eyebrow?: string }) {
  return (
    <main className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-white/84 p-5 backdrop-blur dark:bg-white/5 lg:block">
        <h1 className="text-xl font-black">ACE Admin</h1>
        <nav className="mt-8 grid gap-2 text-sm font-semibold">
          {adminNav.map(([label, href]) => (
            <Link className="rounded-md px-3 py-2 hover:bg-muted" href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <section className="container-page py-8 lg:ml-64 lg:w-auto lg:max-w-none lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-court-blue">{eyebrow}</p>
            <h2 className="text-3xl font-black">{title}</h2>
          </div>
          <div className="flex gap-2">
            <Link className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-bold" href="/">
              <Settings className="size-4" /> Website
            </Link>
            <Link className="inline-flex items-center gap-2 rounded-md bg-court-green px-4 py-2 text-sm font-bold text-white" href="/api/reports?type=players">
              <Download className="size-4" /> Xuất báo cáo
            </Link>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
