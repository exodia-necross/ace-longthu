import type { Announcement, Match, Player, RankingRow, Team } from "@/lib/types";

export const tournament = {
  name: "GIẢI CẦU LÔNG ACE LÔNG THỦ",
  slogan: "Nơi kết nối đam mê - Thi đấu hết mình",
  startsAt: "2026-07-19T08:00:00+07:00",
  venue: "Nhà thi đấu ACE Sports Center, Quận 7, TP. Hồ Chí Minh",
  registrationOpen: true
};

export const announcements: Announcement[] = [
  {
    id: "a1",
    title: "Mở cổng đăng ký mùa giải 2026",
    body: "Ban tổ chức nhận đăng ký đến 23:59 ngày 12/07/2026. Các vận động viên vui lòng nhập đúng nội dung thi đấu.",
    createdAt: "2026-06-01T09:00:00+07:00"
  },
  {
    id: "a2",
    title: "Lịch thi đấu dự kiến",
    body: "Các trận vòng bảng bắt đầu lúc 08:00. Vòng loại trực tiếp diễn ra trong buổi chiều cùng ngày.",
    createdAt: "2026-06-03T12:30:00+07:00"
  }
];

export const players: Player[] = [
  {
    id: "p1",
    fullName: "Nguyễn Minh Khang",
    birthDate: "1994-03-12",
    gender: "Nam",
    email: "khang@example.com",
    address: "TP. Hồ Chí Minh",
    level: "Giỏi",
    dominantHand: "Tay phải",
    eventType: "Đôi nam",
    hasPartner: true,
    partnerName: "Trần Hoàng Nam",
    status: "Đã duyệt",
    avatarUrl: "https://images.unsplash.com/photo-1571019613914-85f342c6a11e?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "p2",
    fullName: "Trần Hoàng Nam",
    birthDate: "1992-09-09",
    gender: "Nam",
    email: "nam@example.com",
    address: "Bình Dương",
    level: "Giỏi",
    dominantHand: "Tay trái",
    eventType: "Đôi nam",
    hasPartner: true,
    partnerName: "Nguyễn Minh Khang",
    status: "Đã duyệt",
    avatarUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "p3",
    fullName: "Lê Thảo Vy",
    birthDate: "1998-05-22",
    gender: "Nữ",
    email: "vy@example.com",
    address: "Đồng Nai",
    level: "Khá",
    dominantHand: "Tay phải",
    eventType: "Đơn nữ",
    hasPartner: false,
    status: "Đã duyệt",
    avatarUrl: "https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: "p4",
    fullName: "Phạm Quốc Bảo",
    birthDate: "1996-11-02",
    gender: "Nam",
    email: "bao@example.com",
    address: "TP. Hồ Chí Minh",
    level: "Trung bình",
    dominantHand: "Tay phải",
    eventType: "Đôi nam nữ",
    hasPartner: false,
    status: "Chờ duyệt",
    avatarUrl: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=300&q=80"
  }
];

export const teams: Team[] = [
  { id: "t1", name: "ACE Smash", members: ["Nguyễn Minh Khang", "Trần Hoàng Nam"], eventType: "Đôi nam", status: "Đủ điều kiện" },
  { id: "t2", name: "Green Drive", members: ["Lê Thảo Vy"], eventType: "Đơn nữ", status: "Đủ điều kiện" },
  { id: "t3", name: "Net Masters", members: ["Phạm Quốc Bảo", "Chờ ghép"], eventType: "Đôi nam nữ", status: "Chờ ghép" }
];

export const matches: Match[] = [
  { id: "m1", code: "DM-001", startsAt: "2026-07-19T08:00:00+07:00", court: "Sân 1", eventType: "Đôi nam", homeTeam: "ACE Smash", awayTeam: "Net Force", status: "Sắp diễn ra" },
  { id: "m2", code: "DN-002", startsAt: "2026-07-19T08:45:00+07:00", court: "Sân 2", eventType: "Đơn nữ", homeTeam: "Green Drive", awayTeam: "Sky Drop", status: "Sắp diễn ra" },
  { id: "m3", code: "MX-003", startsAt: "2026-07-19T10:15:00+07:00", court: "Sân 3", eventType: "Đôi nam nữ", homeTeam: "Net Masters", awayTeam: "Blue Rally", status: "Đã kết thúc", score: "21-17, 18-21, 21-15", winner: "Net Masters" }
];

export const rankings: RankingRow[] = [
  { rank: 1, team: "Net Masters", matches: 3, wins: 3, losses: 0, difference: 21, points: 9 },
  { rank: 2, team: "ACE Smash", matches: 3, wins: 2, losses: 1, difference: 12, points: 6 },
  { rank: 3, team: "Green Drive", matches: 2, wins: 1, losses: 1, difference: 4, points: 3 },
  { rank: 4, team: "Blue Rally", matches: 3, wins: 0, losses: 3, difference: -18, points: 0 }
];
