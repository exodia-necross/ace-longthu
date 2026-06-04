"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const eventTypes = ["Đơn nam", "Đơn nữ", "Đôi nam", "Đôi nữ", "Đôi nam nữ"];

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [hasPartner, setHasPartner] = useState("Không");

  return (
    <PageShell>
      <section className="container-page py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-black">Đăng ký tham gia</h1>
          <p className="mt-2 text-mutedForeground">Thông tin sẽ được gửi đến Ban tổ chức để duyệt trước khi công bố.</p>
          {submitted ? (
            <Card className="mt-6 text-center">
              <CheckCircle2 className="mx-auto size-12 text-court-green" />
              <h2 className="mt-3 text-2xl font-bold">Đăng ký thành công</h2>
              <p className="mt-2 text-mutedForeground">Hệ thống đã ghi nhận đăng ký mẫu. Khi kết nối Supabase, form này sẽ lưu vào database và gửi email xác nhận.</p>
            </Card>
          ) : (
            <Card className="mt-6">
              <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold">Họ tên<input required className="h-10 rounded-md border border-border px-3 dark:bg-white/5" /></label>
                  <label className="grid gap-2 text-sm font-semibold">Ngày sinh<input required type="date" className="h-10 rounded-md border border-border px-3 dark:bg-white/5" /></label>
                  <label className="grid gap-2 text-sm font-semibold">Giới tính<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5"><option>Nam</option><option>Nữ</option><option>Khác</option></select></label>
                  <label className="grid gap-2 text-sm font-semibold">Số điện thoại<input required className="h-10 rounded-md border border-border px-3 dark:bg-white/5" /></label>
                  <label className="grid gap-2 text-sm font-semibold">Email<input required type="email" className="h-10 rounded-md border border-border px-3 dark:bg-white/5" /></label>
                  <label className="grid gap-2 text-sm font-semibold">Địa chỉ<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" /></label>
                  <label className="grid gap-2 text-sm font-semibold">Trình độ<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5"><option>Mới chơi</option><option>Trung bình</option><option>Khá</option><option>Giỏi</option></select></label>
                  <label className="grid gap-2 text-sm font-semibold">Tay thuận<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5"><option>Tay phải</option><option>Tay trái</option></select></label>
                </div>
                <label className="grid gap-2 text-sm font-semibold">Nội dung đăng ký<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5">{eventTypes.map((item) => <option key={item}>{item}</option>)}</select></label>
                <label className="grid gap-2 text-sm font-semibold">Có bạn đánh cặp sẵn không<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" onChange={(event) => setHasPartner(event.target.value)} value={hasPartner}><option>Có</option><option>Không</option></select></label>
                {hasPartner === "Có" && <label className="grid gap-2 text-sm font-semibold">Tên người đánh cặp<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" /></label>}
                <label className="grid gap-2 text-sm font-semibold">Ghi chú<textarea className="min-h-28 rounded-md border border-border p-3 dark:bg-white/5" /></label>
                <Button className="mt-2 w-full" type="submit">Gửi đăng ký</Button>
              </form>
            </Card>
          )}
        </div>
      </section>
    </PageShell>
  );
}
