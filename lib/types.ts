export type SkillLevel = "Mới chơi" | "Trung bình" | "Khá" | "Giỏi";
export type EventType = "Đơn nam" | "Đơn nữ" | "Đôi nam" | "Đôi nữ" | "Đôi nam nữ";
export type PlayerStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối";
export type MatchStatus = "Sắp diễn ra" | "Đang thi đấu" | "Đã kết thúc";

export interface Player {
  id: string;
  fullName: string;
  birthDate: string;
  gender: "Nam" | "Nữ" | "Khác";
  phone?: string;
  email: string;
  address: string;
  level: SkillLevel;
  dominantHand: "Tay phải" | "Tay trái";
  eventType: EventType;
  hasPartner: boolean;
  partnerName?: string;
  note?: string;
  status: PlayerStatus;
  avatarUrl: string;
}

export interface Team {
  id: string;
  name: string;
  members: string[];
  eventType: EventType;
  status: "Đủ điều kiện" | "Chờ ghép" | "Tạm dừng";
}

export interface Match {
  id: string;
  code: string;
  startsAt: string;
  court: string;
  eventType: EventType;
  homeTeam: string;
  awayTeam: string;
  status: MatchStatus;
  score?: string;
  winner?: string;
}

export interface RankingRow {
  rank: number;
  team: string;
  matches: number;
  wins: number;
  losses: number;
  difference: number;
  points: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}
