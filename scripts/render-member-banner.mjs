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

function textBox(x, y, width, height, title, bodyLines) {
  const lines = bodyLines
    .map((line, index) => `<tspan x="${x + 28}" dy="${index === 0 ? 0 : 30}">${line}</tspan>`)
    .join("");

  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="14" fill="#061b24" fill-opacity="0.78" stroke="#2acf7c" stroke-opacity="0.8" stroke-width="2"/>
      <text x="${x + 28}" y="${y + 38}" class="box-title">${title}</text>
      <text x="${x + 28}" y="${y + 76}" class="body-small">${lines}</text>
    </g>
  `;
}

function overlaySvg() {
  return Buffer.from(`
    <svg width="1920" height="700" viewBox="0 0 1920 700" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="edgeDark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#001321" stop-opacity="0.94"/>
          <stop offset="0.24" stop-color="#001321" stop-opacity="0.56"/>
          <stop offset="0.5" stop-color="#001321" stop-opacity="0.28"/>
          <stop offset="0.76" stop-color="#001321" stop-opacity="0.54"/>
          <stop offset="1" stop-color="#001321" stop-opacity="0.94"/>
        </linearGradient>
        <linearGradient id="topDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#001321" stop-opacity="0.92"/>
          <stop offset="0.58" stop-color="#001321" stop-opacity="0.48"/>
          <stop offset="1" stop-color="#001321" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="bottomDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#001321" stop-opacity="0"/>
          <stop offset="1" stop-color="#001321" stop-opacity="0.76"/>
        </linearGradient>
        <linearGradient id="cta" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#fff16b"/>
          <stop offset="1" stop-color="#ff9f24"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.9"/>
        </filter>
        <filter id="gold" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#ffe585" flood-opacity="0.78"/>
          <feDropShadow dx="2" dy="3" stdDeviation="2" flood-color="#000" flood-opacity="0.9"/>
        </filter>
        <style>
          .title { font: 900 58px Arial, "Noto Sans", sans-serif; fill: #ffd766; filter: url(#gold); }
          .subtitle { font: 900 31px Arial, "Noto Sans", sans-serif; fill: #fff; filter: url(#shadow); }
          .tag { font: 900 24px Arial, "Noto Sans", sans-serif; fill: #ffd766; filter: url(#shadow); }
          .box-title { font: 900 27px Arial, "Noto Sans", sans-serif; fill: #86ff9f; filter: url(#shadow); }
          .panel-title { font: 900 29px Arial, "Noto Sans", sans-serif; fill: #ffd766; filter: url(#shadow); }
          .body-small { font: 800 22px Arial, "Noto Sans", sans-serif; fill: #fff; filter: url(#shadow); }
          .body-tight { font: 800 20px Arial, "Noto Sans", sans-serif; fill: #fff; filter: url(#shadow); }
          .gold-text { fill: #ffd766; }
        </style>
      </defs>

      <rect width="1920" height="700" fill="url(#edgeDark)"/>
      <rect width="1920" height="238" fill="url(#topDark)"/>
      <rect y="520" width="1920" height="180" fill="url(#bottomDark)"/>

      ${shuttle(120, 68, 0.96, 28)}
      ${shuttle(314, 188, 0.78, 22)}
      ${shuttle(1510, 122, 0.8, 14)}
      ${shuttle(1770, 64, 1.06, 18)}

      <text x="960" y="74" text-anchor="middle" class="title">GIẢI CẦU LÔNG ACE LÔNG THỦ</text>
      <text x="960" y="128" text-anchor="middle" class="subtitle">CHÀO MỪNG SINH NHẬT THÀNH VIÊN QUÝ III (THÁNG 6 - 7 - 8)</text>
      <text x="960" y="174" text-anchor="middle" class="tag">Thi Đấu - Giao Lưu - Kết Nối</text>
      <text x="960" y="211" text-anchor="middle" class="subtitle" style="font-size:25px;">Nội dung Giao Lưu Mở Rộng</text>

      <rect x="514" y="226" width="650" height="388" rx="16" fill="none" stroke="#ffd766" stroke-width="3"/>
      <rect x="514" y="226" width="650" height="388" rx="16" fill="none" stroke="#24d886" stroke-opacity="0.65" stroke-width="7"/>

      ${textBox(36, 225, 438, 184, "THÔNG TIN ĐĂNG KÝ", [
        "Thời gian đăng ký:",
        "Từ: 10/06/2026",
        "Đến: 27/06/2026",
        "Trực tuyến: Website ACE Lông Thủ"
      ])}

      ${textBox(36, 430, 438, 142, "DỰ KIẾN THAM GIA", [
        "20-30 vận động viên",
        "Toàn bộ thành viên ACE Lông Thủ",
        "Giao lưu, kết nối, thi đấu hết mình"
      ])}

      <g transform="translate(1225 225)">
        <rect x="0" y="0" width="650" height="142" rx="14" fill="#061b24" fill-opacity="0.78" stroke="#2acf7c" stroke-opacity="0.8" stroke-width="2"/>
        <text x="28" y="38" class="panel-title">THỜI GIAN THI ĐẤU</text>
        <text x="28" y="78" class="body-small">
          <tspan x="28" dy="0">29/06/2026  |  17:30 - 19:30</tspan>
          <tspan x="28" dy="31">Sân Cầu Lông GOAT</tspan>
        </text>
      </g>

      <g transform="translate(1225 388)">
        <rect x="0" y="0" width="650" height="206" rx="14" fill="#061b24" fill-opacity="0.78" stroke="#2acf7c" stroke-opacity="0.8" stroke-width="2"/>
        <text x="28" y="38" class="panel-title">CƠ CẤU GIẢI THƯỞNG</text>
        <text x="28" y="76" class="body-tight" style="font-size:19px;">
          <tspan x="28" dy="0">GIẢI NHẤT: Cúp Vô Địch + Tiền Thưởng + Quà Nhà Tài Trợ</tspan>
          <tspan x="28" dy="28">GIẢI NHÌ: Huy Chương + Quà Tặng</tspan>
          <tspan x="28" dy="28">GIẢI BA: Huy Chương + Quà Tặng</tspan>
          <tspan x="28" dy="28" class="gold-text">GIẢI PHONG CÁCH | GIẢI MAY MẮN</tspan>
          <tspan x="28" dy="28" class="gold-text">GIẢI CỔ ĐỘNG VIÊN NHIỆT TÌNH</tspan>
        </text>
      </g>

      <rect x="628" y="625" width="548" height="54" rx="27" fill="url(#cta)" stroke="#fff4b0" stroke-width="3"/>
      <text x="904" y="660" text-anchor="middle" style="font: 900 25px Arial, 'Noto Sans', sans-serif; fill: #061522;">ĐĂNG KÝ THAM GIA NGAY</text>
      <text x="1848" y="680" text-anchor="end" style="font: italic 18px Arial, 'Noto Sans', sans-serif; fill:#ffd766; filter:url(#shadow);">Kỷ niệm Quý III 2026</text>
    </svg>
  `);
}

function subOverlaySvg() {
  return Buffer.from(`
    <svg width="1920" height="300" viewBox="0 0 1920 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dark" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#021b24" stop-opacity="0.86"/>
          <stop offset="1" stop-color="#006f57" stop-opacity="0.64"/>
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
      <text x="84" y="92" class="gold">ACE LÔNG THỦ QUÝ III 2026</text>
      <text x="84" y="154" class="white">Thi Đấu - Giao Lưu - Kết Nối</text>
      <text x="84" y="211" class="body">20-30 vận động viên | Nhiều giải thưởng hấp dẫn | Quà tặng từ nhà tài trợ</text>
      <text x="84" y="263" class="white" style="font-size:30px; fill:#ffd766;">29/06/2026  |  Sân Cầu Lông GOAT</text>
    </svg>
  `);
}

const background = await sharp(sourcePath)
  .extract({ left: 0, top: 520, width: 2560, height: 933 })
  .resize(1920, 700, { fit: "cover" })
  .blur(2.5)
  .modulate({ brightness: 0.62, saturation: 1.18 })
  .png()
  .toBuffer();

const groupPhoto = await sharp(sourcePath)
  .extract({ left: 600, top: 745, width: 1160, height: 950 })
  .resize(650, 388, { fit: "cover", position: "center" })
  .modulate({ brightness: 1.04, saturation: 1.08 })
  .sharpen({ sigma: 0.4, m1: 0.8, m2: 1.4 })
  .png()
  .toBuffer();

const main = await sharp(background)
  .composite([
    { input: groupPhoto, left: 514, top: 226 },
    { input: overlaySvg(), left: 0, top: 0 }
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await Promise.all([
  sharp(main).toFile(publicMain),
  sharp(main).toFile(outputMain)
]);

const subBg = await sharp(sourcePath)
  .extract({ left: 0, top: 620, width: 2560, height: 400 })
  .resize(1920, 300, { fit: "cover" })
  .modulate({ brightness: 0.88, saturation: 1.08 })
  .png()
  .toBuffer();

const sub = await sharp(subBg)
  .composite([{ input: subOverlaySvg(), left: 0, top: 0 }])
  .png({ compressionLevel: 9 })
  .toBuffer();

await Promise.all([
  sharp(sub).toFile(publicSub),
  sharp(sub).toFile(outputSub)
]);

console.log(`Wrote ${publicMain}`);
console.log(`Wrote ${publicSub}`);
