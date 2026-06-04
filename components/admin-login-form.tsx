"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/admin/dashboard");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Không thể đăng nhập. Kiểm tra cấu hình Supabase.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Mật khẩu
        <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </label>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      <Button disabled={loading} type="submit">{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
      <button className="rounded-md border border-border px-4 py-2 text-sm font-bold" onClick={() => router.push("/admin/dashboard")} type="button">
        Vào dashboard demo
      </button>
    </form>
  );
}
