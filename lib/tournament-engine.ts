import type { Match, Player, Team } from "@/lib/types";

const levelScore = {
  "Mới chơi": 1,
  "Trung bình": 2,
  "Khá": 3,
  "Giỏi": 4
};

export function autoPairPlayers(players: Player[]): Team[] {
  const approved = players
    .filter((player) => player.status === "Đã duyệt")
    .sort((a, b) => levelScore[a.level] - levelScore[b.level]);
  const teams: Team[] = [];
  const used = new Set<string>();

  for (const player of approved) {
    if (used.has(player.id)) continue;

    const requestedPartner = approved.find(
      (candidate) =>
        candidate.fullName === player.partnerName &&
        candidate.partnerName === player.fullName
    );

    if (requestedPartner && !used.has(requestedPartner.id)) {
      used.add(player.id);
      used.add(requestedPartner.id);
      teams.push({
        id: `team-${teams.length + 1}`,
        name: `${player.fullName.split(" ").at(-1)} / ${requestedPartner.fullName.split(" ").at(-1)}`,
        members: [player.fullName, requestedPartner.fullName],
        eventType: "Tự do",
        status: "Đủ điều kiện"
      });
      continue;
    }

    const partner = approved
      .filter((candidate) => candidate.id !== player.id && !used.has(candidate.id))
      .sort((a, b) => Math.abs(levelScore[a.level] - levelScore[player.level]) - Math.abs(levelScore[b.level] - levelScore[player.level]))[0];

    used.add(player.id);
    if (partner) {
      used.add(partner.id);
      teams.push({
        id: `team-${teams.length + 1}`,
        name: `${player.fullName.split(" ").at(-1)} / ${partner.fullName.split(" ").at(-1)}`,
        members: [player.fullName, partner.fullName],
        eventType: "Tự do",
        status: "Đủ điều kiện"
      });
    } else {
      teams.push({
        id: `team-${teams.length + 1}`,
        name: player.fullName,
        members: [player.fullName],
        eventType: "Tự do",
        status: "Chờ ghép"
      });
    }
  }

  return teams;
}

export function generateRoundRobinSchedule(teams: Team[], startAt: Date, courts: string[]): Match[] {
  const matches: Match[] = [];
  let slot = 0;

  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      const startsAt = new Date(startAt.getTime() + slot * 45 * 60 * 1000);
      matches.push({
        id: `match-${matches.length + 1}`,
        code: `RR-${String(matches.length + 1).padStart(3, "0")}`,
        startsAt: startsAt.toISOString(),
        court: courts[slot % courts.length],
        eventType: "Tự do",
        homeTeam: teams[i].name,
        awayTeam: teams[j].name,
        status: "Sắp diễn ra"
      });
      slot += 1;
    }
  }

  return matches;
}
