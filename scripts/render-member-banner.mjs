import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "public", "banners", "members-source.jpg");
const publicMain = path.join(root, "public", "banners", "ace-long-thu-banner-main.png");
const publicSub = path.join(root, "public", "banners", "ace-long-thu-banner-sub.png");
const outputsRoot = path.resolve(root, "..", "..", "outputs");
const outputMain = path.join(outputsRoot, "ace-long-thu-banner-main.png");
const outputSub = path.join(outputsRoot, "ace-long-thu-banner-sub.png");

const esc = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const tspan = (lines, x, dy = 28) =>
  lines.map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : dy}">${esc(line)}</tspan>`).join("");

function shuttle(x, y, scale, rotate) {
  return `
    <g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})" opacity="0.95">
      <path d="M0 22 L78 -18 L56 40 Z" fill="#f8fbff" stroke="#d8eaff" stroke-width="3"/>
      <path d="M13 19 L87 -7 L67 48 Z" fill="#edf7ff" stroke="#d8eaff" stroke-width="3"/>
      <path d="M27 18 L94 5 L79 55 Z" fill="#ffffff" stroke="#d8eaff" stroke-width="3"/>
      <line x1="16" y1="19" x2="72" y2="-6" stroke="#bcd7ec" stroke-width="2"/>
      <line x1="29" y1="20" x2="80" y2="11" stroke="#bcd7ec" stroke-width="2"/>
      <circle cx="0" cy="28" r="15" fill="#ffd766"/>
    </g>
  `;
}

function infoBox({ x, y, w, h, title, lines }) {
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="rgba(3,18,31,0.78)" stroke="rgba(126,231,135,0.7)" stroke-width="1.5"/>
      <text x="${x + 22}" y="${y + 34}" class="box-title">${esc(title)}</text>
      <text x="${x + 22}" y="${y + 69}" class="box-body">${tspan(lines, x + 22, 29)}</text>
    </g>
  `;
}

function mainBaseSvg() {
  return Buffer.from(`
    <svg width="1920" height="700" viewBox="0 0 1920 700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#01121f" stop-opacity="0.94"/>
          <stop offset="0.45" stop-color="#022b35" stop-opacity="0.58"/>
          <stop offset="1" stop-color="#006f57" stop-opacity="0.62"/>
        </linearGradient>
        <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#000" stop-opacity="0.82"/>
          <stop offset="1" stop-color="#000" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="cta" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff06a"/>
          <stop offset="1" stop-color="#ff9e24"/>
        </linearGradient>
      </defs>

      <rect width="1920" height="700" fill="url(#dark)"/>
      <rect width="1920" height="240" fill="url(#top)"/>
      <g opacity="0.23" stroke="#9df6ff" stroke-width="2">
        ${Array.from({ length: 9 }, (_, i) => `<line x1="${i * 240}" y1="0" x2="${i * 240}" y2="700"/>`).join("")}
        ${[120, 280, 440, 600, 676].map((y) => `<line x1="0" y1="${y}" x2="1920" y2="${y}"/>`).join("")}
      </g>
      <g opacity="0.46" stroke="#fff" stroke-width="8">
        <line x1="1430" y1="0" x2="1220" y2="700"/>
        <line x1="1850" y1="30" x2="1570" y2="700"/>
        <line x1="55" y1="700" x2="320" y2="260"/>
      </g>
    </svg>
  `);
}

function mainOverlaySvg() {
  return Buffer.from(`
    <svg width="1920" height="700" viewBox="0 0 1920 700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cta" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff06a"/>
          <stop offset="1" stop-color="#ff9e24"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.85"/>
        </filter>
        <filter id="gold-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ffe585" flood-opacity="0.75"/>
          <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.9"/>
        </filter>
        <style>
          .font { font-family: Arial, "Noto Sans", sans-serif; }
          .title { font: 900 58px Arial, "Noto Sans", sans-serif; fill: #ffd766; filter: url(#gold-glow); letter-spacing: 0; }
          .subtitle { font: 900 34px Arial, "Noto Sans", sans-serif; fill: #fff; filter: url(#shadow); letter-spacing: 0; }
          .tag { font: 900 24px Arial, "Noto Sans", sans-serif; fill: #ffd766; filter: url(#shadow); }
          .tag-white { font: 900 24px Arial, "Noto Sans", sans-serif; fill: #fff; filter: url(#shadow); }
          .box-title { font: 900 23px Arial, "Noto Sans", sans-serif; fill: #7ee787; filter: url(#shadow); }
          .box-body { font: 800 22px Arial, "Noto Sans", sans-serif; fill: #fff; filter: url(#shadow); }
          .small { font: 800 20px Arial, "Noto Sans", sans-serif; fill: #fff; filter: url(#shadow); }
        </style>
      </defs>

      ${shuttle(98, 72, 1.04, 35)}
      ${shuttle(1702, 82, 0.95, 18)}
      ${shuttle(1360, 182, 0.82, -25)}
      ${shuttle(520, 575, 0.72, 20)}
      ${shuttle(1508, 505, 0.68, -35)}

      <text x="960" y="68" text-anchor="middle" class="title">GIẢI CẦU LÔNG ACE LÔNG THỦ</text>
      <text x="960" y="123" text-anchor="middle" class="subtitle">CHÀO MỪNG SINH NHẬT THÀNH VIÊN QUÝ III (THÁNG 6 - 7 - 8)</text>
      <text x="960" y="166" text-anchor="middle" class="tag">Thi Đấu - Giao Lưu - Kết Nối</text>
      <text x="960" y="202" text-anchor="middle" class="tag-white">Nội dung Giao Lưu Mở Rộng</text>

      ${infoBox({
        x: 42,
        y: 225,
        w: 500,
        h: 180,
        title: "THÔNG TIN ĐĂNG KÝ",
        lines: [
          "Thời gian đăng ký:",
          "Từ: 10/06/2026",
          "Đến: 27/06/2026",
          "Trực tuyến: Website ACE Lông Thủ",
          "Đối tượng: Toàn bộ thành viên"
        ]
      })}
      ${infoBox({
        x: 42,
        y: 425,
        w: 500,
        h: 150,
        title: "DỰ KIẾN THAM GIA",
        lines: ["20-30 vận động viên", "Giao lưu, kết nối, thi đấu hết mình"]
      })}
      ${infoBox({
        x: 1248,
        y: 220,
        w: 620,
        h: 205,
        title: "CƠ CẤU GIẢI THƯỞNG",
        lines: [
          "GIẢI NHẤT: Cúp Vô Địch + Tiền Thưởng",
          "+ Quà Nhà Tài Trợ",
          "GIẢI NHÌ: Huy Chương + Quà Tặng",
          "GIẢI BA: Huy Chương + Quà Tặng"
        ]
      })}
      ${infoBox({
        x: 1248,
        y: 445,
        w: 620,
        h: 130,
        title: "GIẢI PHỤ",
        lines: [
          "GIẢI PHONG CÁCH | GIẢI MAY MẮN",
          "GIẢI CỔ ĐỘNG VIÊN NHIỆT TÌNH",
          "Quà tặng từ nhà tài trợ"
        ]
      })}

      <rect x="610" y="492" width="640" height="95" rx="18" fill="rgba(3,26,40,0.82)" stroke="rgba(255,215,102,0.68)" stroke-width="1.5"/>
      <text x="930" y="532" text-anchor="middle" class="tag">THỜI GIAN THI ĐẤU</text>
      <text x="930" y="568" text-anchor="middle" class="box-body">29/06/2026  |  17:30 - 19:30  |  Sân Cầu Lông GOAT</text>

      <rect x="625" y="610" width="670" height="58" rx="29" fill="url(#cta)" stroke="#fff4b0" stroke-width="3"/>
      <text x="960" y="649" text-anchor="middle" style="font: 900 31px Arial, 'Noto Sans', sans-serif; fill: #061522;">ĐĂNG KÝ THAM GIA NGAY</text>
      <text x="960" y="693" text-anchor="middle" class="small">Gắn kết đam mê cầu lông - Lan tỏa tinh thần thể thao</text>
      <text x="1860" y="683" text-anchor="end" style="font: italic 18px Arial, 'Noto Sans', sans-serif; fill: #ddebff; filter: url(#shadow);">Kỷ niệm Quý III 2026</text>
    </svg>
  `);
}

function subOverlaySvg() {
  return Buffer.from(`
    <svg width="1920" height="300" viewBox="0 0 1920 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#021b24" stop-opacity="0.94"/>
          <stop offset="1" stop-color="#006f57" stop-opacity="0.78"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.85"/>
        </filter>
        <style>
          .gold { font: 900 50px Arial, "Noto Sans", sans-serif; fill: #ffd766; filter: url(#shadow); }
          .white { font: 900 34px Arial, "Noto Sans", sans-serif; fill: #fff; filter: url(#shadow); }
          .body { font: 800 25px Arial, "Noto Sans", sans-serif; fill: #fff; filter: url(#shadow); }
        </style>
      </defs>
      <rect width="1920" height="300" fill="url(#dark)"/>
      ${shuttle(1580, 72, 1.1, 12)}
      ${shuttle(1730, 185, 0.8, -20)}
      <text x="84" y="92" class="gold">ACE LÔNG THỦ QUÝ III 2026</text>
      <text x="84" y="154" class="white">Thi Đấu - Giao Lưu - Kết Nối</text>
      <text x="84" y="211" class="body">20-30 vận động viên | Nhiều giải thưởng hấp dẫn | Quà tặng từ nhà tài trợ</text>
      <text x="84" y="263" class="white" style="font-size:30px; fill:#ffd766;">29/06/2026  |  Sân Cầu Lông GOAT</text>
    </svg>
  `);
}

const background = await sharp(sourcePath)
  .extract({ left: 0, top: 410, width: 2560, height: 930 })
  .resize(1920, 700, { fit: "cover" })
  .png()
  .toBuffer();

const members = await sharp(sourcePath)
  .extract({ left: 690, top: 665, width: 1125, height: 1125 })
  .resize(690, 690, { fit: "cover" })
  .png()
  .toBuffer();

const memberGlow = Buffer.from(`
  <svg width="780" height="570" viewBox="0 0 780 570" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="g" cx="50%" cy="50%" r="60%">
        <stop offset="0" stop-color="#ffd75a" stop-opacity="0.28"/>
        <stop offset="1" stop-color="#ffd75a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="780" height="570" fill="url(#g)"/>
  </svg>
`);

const main = await sharp(background)
  .composite([
    { input: mainBaseSvg(), left: 0, top: 0 },
    { input: members, left: 600, top: 150 },
    { input: memberGlow, left: 560, top: 130, blend: "screen" },
    { input: mainOverlaySvg(), left: 0, top: 0 }
  ])
  .png()
  .toBuffer();

await Promise.all([
  sharp(main).toFile(publicMain),
  sharp(main).toFile(outputMain)
]);

const subBg = await sharp(sourcePath)
  .extract({ left: 0, top: 620, width: 2560, height: 400 })
  .resize(1920, 300, { fit: "cover" })
  .png()
  .toBuffer();

const sub = await sharp(subBg)
  .composite([{ input: subOverlaySvg(), left: 0, top: 0 }])
  .png()
  .toBuffer();

await Promise.all([
  sharp(sub).toFile(publicSub),
  sharp(sub).toFile(outputSub)
]);

console.log(`Wrote ${publicMain}`);
console.log(`Wrote ${publicSub}`);
