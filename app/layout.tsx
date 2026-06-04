import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GIẢI CẦU LÔNG ACE LÔNG THỦ",
  description: "Website quản lý giải cầu lông chuyên nghiệp: đăng ký, lịch thi đấu, kết quả và bảng xếp hạng.",
  openGraph: {
    title: "GIẢI CẦU LÔNG ACE LÔNG THỦ",
    description: "Nơi kết nối đam mê - Thi đấu hết mình",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
