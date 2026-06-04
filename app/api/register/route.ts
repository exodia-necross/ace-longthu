import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseConfig } from "@/lib/supabase";
import { createSupabaseAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase-admin";

const registrationSchema = z.object({
  fullName: z.string().min(2),
  birthDate: z.string().min(8),
  gender: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  address: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  dominantHand: z.string().min(2),
  eventType: z.string().optional(),
  hasPartner: z.boolean().default(false),
  partnerName: z.string().optional(),
  note: z.string().optional(),
  tournamentId: z.string().uuid()
});

function cleanFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const formData = contentType.includes("multipart/form-data") ? await request.formData() : null;
  const body = formData ? Object.fromEntries(formData.entries()) : await request.json();
  const payload = registrationSchema.safeParse({
    ...body,
    hasPartner: body.hasPartner === true || body.hasPartner === "true"
  });

  if (!payload.success) {
    return NextResponse.json({ error: "Dữ liệu đăng ký không hợp lệ", issues: payload.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig() || !hasSupabaseAdminConfig()) {
    return NextResponse.json({ ok: true, mode: "mock", message: "Đã nhận đăng ký demo. Hãy cấu hình Supabase để lưu database." });
  }

  const supabase = createSupabaseAdminClient();
  let avatarUrl: string | null = null;
  const avatar = formData?.get("avatar");

  if (avatar instanceof File && avatar.size > 0) {
    if (!avatar.type.startsWith("image/")) {
      return NextResponse.json({ error: "Avatar phải là file ảnh." }, { status: 400 });
    }

    if (avatar.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "Avatar tối đa 2MB." }, { status: 400 });
    }

    const extension = cleanFileName(avatar.name).split(".").pop() || "jpg";
    const path = `${payload.data.tournamentId}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatar, {
        contentType: avatar.type,
        upsert: false
      });

    if (uploadError) {
      return NextResponse.json({ error: `Không thể upload avatar: ${uploadError.message}` }, { status: 500 });
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  const { error } = await supabase.from("players").insert({
    tournament_id: payload.data.tournamentId,
    full_name: payload.data.fullName,
    birth_date: payload.data.birthDate,
    gender: payload.data.gender,
    phone: payload.data.phone,
    email: payload.data.email,
    address: payload.data.address,
    level: payload.data.level,
    dominant_hand: payload.data.dominantHand,
    event_type: payload.data.eventType || "free",
    has_partner: payload.data.hasPartner,
    partner_name: payload.data.partnerName,
    note: payload.data.note,
    avatar_url: avatarUrl,
    status: "pending"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Đăng ký thành công. Vui lòng kiểm tra email xác nhận." });
}
