import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";

const nav = [
  ["Vận động viên", "/players"],
  ["Cặp đấu", "/teams"],
  ["Lịch thi đấu", "/schedule"],
  ["Kết quả", "/results"],
  ["Bảng xếp hạng", "/ranking"]
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/86 backdrop-blur">
      <div className="container-page relative flex min-h-16 items-center justify-between gap-3">
        <Link className="flex min-w-0 items-center gap-2 font-bold" href="/">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-court-blue text-white">
            <ShieldCheck className="size-5" />
          </span>
          <span className="truncate">ACE Lông Thủ</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-mutedForeground lg:flex">
          {nav.map(([label, href]) => (
            <Link className="hover:text-court-blue" href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link className="hidden rounded-md bg-court-green px-4 py-2 text-sm font-semibold text-white sm:inline-flex" href="/register">
            Đăng ký
          </Link>
          <MobileNav nav={nav} />
        </div>
      </div>
    </header>
  );
}
