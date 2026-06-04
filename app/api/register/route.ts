import { NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabaseConfig } from "@/lib/supabase";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const registrationSchema = z.object({
  fullName: z.string().min(2),
  birthDate: z.string().min(8),
  gender: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  address: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  dominantHand: z.string().min(2),
  eventType: z.enum(["mens_single", "womens_single", "mens_double", "womens_double", "mixed_double"]),
  hasPartner: z.boolean().default(false),
  partnerName: z.string().optional(),
  note: z.string().optional(),
  tournamentId: z.string().uuid()
});

export async function POST(request: Request) {
  const payload = registrationSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Dữ liệu đăng ký không hợp lệ", issues: payload.error.flatten() }, { status: 400 });
  }

  if (!hasSupabaseConfig()) {
    return NextResponse.json({ ok: true, mode: "mock", message: "Đã nhận đăng ký demo. Hãy cấu hình Supabase để lưu database." });
  }

  const supabase = await createServerSupabaseClient();
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
    event_type: payload.data.eventType,
    has_partner: payload.data.hasPartner,
    partner_name: payload.data.partnerName,
    note: payload.data.note,
    status: "pending"
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Đăng ký thành công. Vui lòng kiểm tra email xác nhận." });
}
