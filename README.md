# GIẢI CẦU LÔNG ACE LÔNG THỦ

Website quản lý giải cầu lông chuyên nghiệp dùng Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase Auth, PostgreSQL/RLS và Vercel.

## Tính năng

- Public website: trang chủ, đăng ký, vận động viên, cặp đấu, lịch thi đấu, kết quả, bảng xếp hạng.
- Admin dashboard: tổng quan, duyệt thành viên, ghép cặp tự động, sinh lịch, nhập kết quả, xuất báo cáo.
- Thuật toán mẫu: ghép cặp theo bạn đăng ký sẵn, trình độ, giới tính và nội dung; sinh lịch vòng tròn theo sân và slot thời gian.
- Database Supabase: schema SQL đầy đủ, khóa chính, khóa ngoại, index, timestamp, RLS.
- SEO metadata, responsive mobile-first, giao diện light/dark-ready, hỗ trợ UTF-8 tiếng Việt.

## Cài đặt local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`.

## Biến môi trường

Sao chép `.env.example` thành `.env.local`, sau đó điền thông tin Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=
RECAPTCHA_SECRET_KEY=
```

Khi chưa có Supabase, website vẫn chạy bằng mock data để xem giao diện và luồng nghiệp vụ.

## Supabase

1. Tạo project Supabase mới.
2. Vào SQL Editor và chạy `supabase/schema.sql`.
3. Chạy `supabase/seed.sql` để có dữ liệu mẫu.
4. Tạo admin trong Supabase Auth.
5. Insert profile admin vào bảng `users` với `role = 'admin'`.
6. Cấu hình Storage bucket `avatars` nếu muốn upload ảnh vận động viên.

## Deploy Vercel

1. Push source code lên GitHub.
2. Import repository vào Vercel.
3. Thêm toàn bộ biến môi trường trong `.env.example`.
4. Deploy.
5. Trong Supabase Auth, thêm Vercel domain vào Site URL và Redirect URLs.

## Báo cáo

Script `scripts/export-reports.ts` minh họa xuất Excel từ dữ liệu hiện có. Khi kết nối Supabase thật, thay mock data bằng query từ database.

## Ghi chú production

- Bật Google reCAPTCHA cho form đăng ký.
- Thêm rate-limit ở API route nhận đăng ký.
- Gửi email xác nhận bằng Supabase Edge Function, Resend hoặc provider SMTP.
- Dùng Supabase Realtime cho lịch thi đấu, kết quả và bảng xếp hạng live.
