import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

const pathsToRevalidate = [
  "/",
  "/admin/settings",
  "/players",
  "/schedule",
  "/ranking",
  "/teams",
  "/results"
];

function cleanFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function settingsUrl(request: Request, params: Record<string, string>) {
  const url = new URL("/admin/settings", request.url);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return url;
}

function normalizeBannerUrl(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith("/banners/") && !/\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(trimmed)) {
    return `${trimmed}.png`;
  }

  return trimmed;
}

async function ensureAdmin() {
  if (!hasSupabaseAdminConfig()) return;

  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) throw new Error("Bạn cần đăng nhập admin.");

  const adminClient = createSupabaseAdminClient();
  const { data: profile } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !["admin", "organizer"].includes(profile.role)) {
    throw new Error("Tài khoản này không có quyền chỉnh banner.");
  }
}

async function ensureBannerBucket() {
  const supabase = createSupabaseAdminClient();
  const { data: bucket } = await supabase.storage.getBucket("banners");
  if (bucket) return;

  const { error } = await supabase.storage.createBucket("banners", { public: true });
  if (error && !error.message.toLowerCase().includes("already exists")) {
    throw new Error(`Không thể tạo bucket banners: ${error.message}`);
  }
}

async function uploadBannerFile(file: File, prefix: string) {
  if (!file.name || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error("Banner phải là file ảnh.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Banner tối đa 10MB.");

  await ensureBannerBucket();

  const supabase = createSupabaseAdminClient();
  const extension = cleanFileName(file.name).split(".").pop() || "png";
  const path = `${prefix}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("banners").upload(path, buffer, {
    contentType: file.type,
    upsert: false
  });

  if (error) throw new Error(`Không thể upload banner: ${error.message}`);

  const { data } = supabase.storage.from("banners").getPublicUrl(path);
  return data.publicUrl;
}

export async function POST(request: Request) {
  const wantsJson = request.headers.get("accept")?.includes("application/json");

  try {
    await ensureAdmin();

    const formData = await request.formData();
    const currentMainBannerUrl = String(formData.get("currentMainBannerUrl") ?? "");
    const currentSubBannerUrl = String(formData.get("currentSubBannerUrl") ?? "");
    const mainBannerUrl = String(formData.get("mainBannerUrl") ?? "");
    const subBannerUrl = String(formData.get("subBannerUrl") ?? "");
    const altText = String(formData.get("altText") ?? "").trim() || "Banner Giải cầu lông ACE Lông Thủ";
    const mainBannerFile = formData.get("mainBannerFile");
    const subBannerFile = formData.get("subBannerFile");

    const uploadedMainUrl = mainBannerFile instanceof File ? await uploadBannerFile(mainBannerFile, "main") : null;
    const uploadedSubUrl = subBannerFile instanceof File ? await uploadBannerFile(subBannerFile, "sub") : null;

    const supabase = createSupabaseAdminClient();
    const savedBanners = {
      mainBannerUrl: uploadedMainUrl || normalizeBannerUrl(mainBannerUrl, currentMainBannerUrl || "/banners/ace-long-thu-banner-main.png"),
      subBannerUrl: uploadedSubUrl || normalizeBannerUrl(subBannerUrl, currentSubBannerUrl || "/banners/ace-long-thu-banner-sub.png"),
      altText
    };

    const { error } = await supabase.from("settings").upsert({
      key: "site_banners",
      value: savedBanners,
      updated_at: new Date().toISOString()
    });

    if (error) throw new Error(error.message);

    pathsToRevalidate.forEach((path) => revalidatePath(path));
    if (wantsJson) {
      return NextResponse.json({ ok: true, banners: savedBanners });
    }
    return NextResponse.redirect(settingsUrl(request, { banner: "saved" }), 303);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    if (wantsJson) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.redirect(settingsUrl(request, { banner_error: message }), 303);
  }
}
