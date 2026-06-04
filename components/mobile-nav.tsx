"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function MobileNav({ nav }: { nav: string[][] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        aria-expanded={open}
        aria-label="Mở menu"
        className="grid size-10 place-items-center rounded-md border border-border bg-white/70 dark:bg-white/5"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <div className="absolute left-4 right-4 top-[calc(100%+8px)] rounded-lg border border-border bg-background p-3 shadow-lg">
          <nav className="grid gap-1">
            {nav.map(([label, href]) => (
              <Link className="rounded-md px-3 py-3 text-sm font-bold hover:bg-muted" href={href} key={href} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link className="rounded-md bg-court-green px-3 py-3 text-sm font-bold text-white" href="/register" onClick={() => setOpen(false)}>
              Đăng ký tham gia
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
