"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { BannerSettings } from "@/lib/admin-data";

type BannerSettingsFormProps = {
  banners: BannerSettings;
};

function cleanFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeBannerUrl(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("/banners/") && !/\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(trimmed)) {
    return `${trimmed}.png`;
  }
  return trimmed;
}

export function BannerSettingsForm({ banners }: BannerSettingsFormProps) {
  const router = useRouter();
  const mainFileRef = useRef<HTMLInputElement>(null);
  const subFileRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState(banners.altText);
  const [mainBannerUrl, setMainBannerUrl] = useState(banners.mainBannerUrl);
  const [subBannerUrl, setSubBannerUrl] = useState(banners.subBannerUrl);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function uploadFile(file: File | undefined, prefix: string) {
    if (!file || file.size === 0) return null;
    if (!file.type.startsWith("image/")) throw new Error("Banner phải là file ảnh.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Banner tối đa 10MB.");

    const supabase = createClient();
    const extension = cleanFileName(file.name).split(".").pop() || "png";
    const path = `${prefix}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("banners").upload(path, file, {
      contentType: file.type,
      upsert: false
    });

    if (uploadError) {
      throw new Error(`Không thể upload banner: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("banners").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const uploadedMainUrl = await uploadFile(mainFileRef.current?.files?.[0], "main");
      const uploadedSubUrl = await uploadFile(subFileRef.current?.files?.[0], "sub");

      const formData = new FormData();
      formData.set("currentMainBannerUrl", banners.mainBannerUrl);
      formData.set("currentSubBannerUrl", banners.subBannerUrl);
      formData.set("mainBannerUrl", uploadedMainUrl || normalizeBannerUrl(mainBannerUrl, banners.mainBannerUrl));
      formData.set("subBannerUrl", uploadedSubUrl || normalizeBannerUrl(subBannerUrl, banners.subBannerUrl));
      formData.set("altText", altText);

      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Không thể lưu banner.");
      }

      setMainBannerUrl(result.banners.mainBannerUrl);
      setSubBannerUrl(result.banners.subBannerUrl);
      setAltText(result.banners.altText);
      if (mainFileRef.current) mainFileRef.current.value = "";
      if (subFileRef.current) subFileRef.current.value = "";
      setMessage("Đã lưu banner. Trang chủ sẽ dùng ảnh mới sau khi tải lại.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu banner.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mt-5 grid gap-5" onSubmit={handleSubmit}>
      {message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>
      ) : null}

      <label className="grid gap-2 text-sm font-semibold">
        Mô tả ảnh
        <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" onChange={(event) => setAltText(event.target.value)} value={altText} />
      </label>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="grid gap-3">
          <p className="text-sm font-bold">Banner chính</p>
          <div className="overflow-hidden rounded-md border border-border bg-muted">
            <img alt={altText} className="aspect-[1920/700] w-full object-cover" src={normalizeBannerUrl(mainBannerUrl, banners.mainBannerUrl)} />
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            URL banner chính
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" onChange={(event) => setMainBannerUrl(event.target.value)} placeholder="https://..." value={mainBannerUrl} />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Hoặc upload banner chính mới
            <input accept="image/png,image/jpeg,image/webp" className="rounded-md border border-border p-3 text-sm dark:bg-white/5" ref={mainFileRef} type="file" />
          </label>
        </div>

        <div className="grid gap-3">
          <p className="text-sm font-bold">Banner phụ</p>
          <div className="overflow-hidden rounded-md border border-border bg-muted">
            <img alt={altText} className="aspect-[1920/300] w-full object-cover" src={normalizeBannerUrl(subBannerUrl, banners.subBannerUrl)} />
          </div>
          <label className="grid gap-2 text-sm font-semibold">
            URL banner phụ
            <input className="h-10 rounded-md border border-border px-3 dark:bg-white/5" onChange={(event) => setSubBannerUrl(event.target.value)} placeholder="https://..." value={subBannerUrl} />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            Hoặc upload banner phụ mới
            <input accept="image/png,image/jpeg,image/webp" className="rounded-md border border-border p-3 text-sm dark:bg-white/5" ref={subFileRef} type="file" />
          </label>
        </div>
      </div>

      <button className="w-fit rounded-md bg-court-green px-4 py-2 text-sm font-bold text-white disabled:opacity-60" disabled={saving} type="submit">
        {saving ? "Đang lưu..." : "Lưu banner"}
      </button>
    </form>
  );
}
