"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tournamentId = "00000000-0000-0000-0000-000000000001";

const levels = [
  ["beginner", "Mới chơi"],
  ["intermediate", "Trung bình"],
  ["advanced", "Khá"],
  ["expert", "Giỏi"]
];

const eventTypes = [
  ["mens_single", "Đơn nam"],
  ["womens_single", "Đơn nữ"],
  ["mens_double", "Đôi nam"],
  ["womens_double", "Đôi nữ"],
  ["mixed_double", "Đôi nam nữ"]
];

export default function RegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [hasPartner, setHasPartner] = useState("Không");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    formData.set("tournamentId", tournamentId);
    formData.set("hasPartner", hasPartner === "Có" ? "true" : "false");

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Không thể gửi đăng ký");
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không thể gửi đăng ký");
    } finally {
      setLoading(false);
    }
  }

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
              <p className="mt-2 text-mutedForeground">Hệ thống đã lưu đăng ký. Ban tổ chức sẽ duyệt trước khi hiển thị công khai.</p>
            </Card>
          ) : (
            <Card className="mt-6">
              <form className="grid gap-4" encType="multipart/form-data" onSubmit={handleSubmit}>
                <label className="grid gap-2 text-sm font-semibold">
                  Avatar
                  <input accept="image/png,image/jpeg,image/webp" className="rounded-md border border-border p-3 text-sm dark:bg-white/5" name="avatar" type="file" />
                  <span className="text-xs font-normal text-mutedForeground">Ảnh JPG, PNG hoặc WEBP, tối đa 2MB.</span>
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold">Họ tên<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="fullName" required /></label>
                  <label className="grid gap-2 text-sm font-semibold">Ngày sinh<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="birthDate" required type="date" /></label>
                  <label className="grid gap-2 text-sm font-semibold">Giới tính<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="gender"><option>Nam</option><option>Nữ</option><option>Khác</option></select></label>
                  <label className="grid gap-2 text-sm font-semibold">Số điện thoại<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="phone" required /></label>
                  <label className="grid gap-2 text-sm font-semibold">Email<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="email" required type="email" /></label>
                  <label className="grid gap-2 text-sm font-semibold">Địa chỉ<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="address" /></label>
                  <label className="grid gap-2 text-sm font-semibold">Trình độ<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="level">{levels.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                  <label className="grid gap-2 text-sm font-semibold">Tay thuận<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="dominantHand"><option>Tay phải</option><option>Tay trái</option></select></label>
                </div>
                <label className="grid gap-2 text-sm font-semibold">Nội dung đăng ký<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="eventType">{eventTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="grid gap-2 text-sm font-semibold">Có bạn đánh cặp sẵn không<select className="h-10 rounded-md border border-border px-3 dark:bg-white/5" onChange={(event) => setHasPartner(event.target.value)} value={hasPartner}><option>Có</option><option>Không</option></select></label>
                {hasPartner === "Có" && <label className="grid gap-2 text-sm font-semibold">Tên người đánh cặp<input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" name="partnerName" /></label>}
                <label className="grid gap-2 text-sm font-semibold">Ghi chú<textarea className="min-h-28 rounded-md border border-border p-3 dark:bg-white/5" name="note" /></label>
                {error && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
                <Button className="mt-2 w-full" disabled={loading} type="submit">{loading ? "Đang gửi..." : "Gửi đăng ký"}</Button>
              </form>
            </Card>
          )}
        </div>
      </section>
    </PageShell>
  );
}
