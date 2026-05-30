import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import type { ReportData } from "./lostPetUtils";

export interface PetBasicInfo {
  species: string;
  breed: string;
    gender: string;
  age: string;
  weight: string;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r = 12
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const paragraphs = text.split("\n");
  for (const para of paragraphs) {
    if (!para.trim()) { lines.push(""); continue; }
    let current = "";
    for (const char of para) {
      const test = current + char;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
  }
  return lines.slice(0, 10);
}

async function generateLostPetPoster(report: ReportData, petInfo: PetBasicInfo): Promise<string> {
  const W = 794;
  const H = 1123;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const PRIMARY      = "#17B5EA";
  const PRIMARY_SOFT = "#E9F8FD";
  const RED          = "#E53935";
  const WHITE        = "#FFFFFF";
  const DARK         = "#1A1A2E";
  const GRAY_TEXT    = "#555555";
  const GRAY_LIGHT   = "#F7F7F7";
  const GRAY_BORDER  = "#E0E0E0";

  ctx.fillStyle = PRIMARY_SOFT;
  ctx.fillRect(0, 0, W, H);

  const cardX = 24;
  const cardY = 24;
  const cardW = W - 48;
  const cardH = H - 48;
  ctx.fillStyle = WHITE;
  ctx.shadowColor = "rgba(0,0,0,0.08)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, cardX, cardY, cardW, cardH, 24);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const contentX = cardX + 30;
  const contentW = cardW - 60;

  // ── 하단 레이아웃 상수 ──
  const footerH = 70;
  const footerY = cardY + cardH - footerH;
  const contactGap = 18;          // 연락처 텍스트 ↔ 빨간 영역 사이 여백
  const contactAreaH = 72;        // 연락처 텍스트 영역 높이
  const contactY = footerY - contactGap - contactAreaH;

  // ══════════════════════════════════════
  // ── 헤더: 중앙 정렬, 가로 90% ──
  // ══════════════════════════════════════
  const targetHeaderWidth = contentW * 0.90;
  const labelText = "실종!";
  const titleText = `${petInfo.species}를 찾습니다`;
  const headerY = cardY + 24;

  let headerFontSize = 48;
  for (let fs = 80; fs >= 24; fs--) {
    ctx.font = `bold ${fs}px sans-serif`;
    const labelPadH = Math.round(fs * 0.45);
    const labelW = ctx.measureText(labelText).width + labelPadH * 2;
    const titleW = ctx.measureText(titleText).width;
    if (labelW + 16 + titleW <= targetHeaderWidth) {
      headerFontSize = fs;
      break;
    }
  }

  ctx.font = `bold ${headerFontSize}px sans-serif`;
  const headerH = Math.round(headerFontSize * 1.35);
  const labelPadH = Math.round(headerFontSize * 0.45);
  const labelW = ctx.measureText(labelText).width + labelPadH * 2;
  const titleW = ctx.measureText(titleText).width;
  const totalHeaderW = labelW + 16 + titleW;
  const headerStartX = contentX + (contentW - totalHeaderW) / 2;

  ctx.fillStyle = RED;
  roundRect(ctx, headerStartX, headerY, labelW, headerH, 10);
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(labelText, headerStartX + labelW / 2, headerY + headerH / 2);

  ctx.fillStyle = DARK;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(titleText, headerStartX + labelW + 16, headerY + headerH / 2);
  ctx.textBaseline = "alphabetic";

  let y = headerY + headerH + 14;

  // ── 구분선 ──
  ctx.strokeStyle = GRAY_BORDER;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(contentX, y);
  ctx.lineTo(contentX + contentW, y);
  ctx.stroke();
  y += 12;

  // ── 사진 영역 ──
  const photos = report.photos.filter(Boolean);
  const photoAreaH = 320;

  const drawRoundedImage = async (
    src: string, x: number, y: number, w: number, h: number, r: number
  ) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.save();
        roundRect(ctx, x, y, w, h, r);
        ctx.clip();
        const iw = img.naturalWidth, ih = img.naturalHeight;
        const scale = Math.max(w / iw, h / ih);
        const sw = w / scale, sh = h / scale;
        const sx = (iw - sw) / 2, sy = (ih - sh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        ctx.restore();
        resolve();
      };
      img.onerror = () => {
        ctx.save();
        ctx.fillStyle = GRAY_LIGHT;
        roundRect(ctx, x, y, w, h, r);
        ctx.fill();
        ctx.fillStyle = "#AAA";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("사진 없음", x + w / 2, y + h / 2 + 5);
        ctx.textAlign = "left";
        ctx.restore();
        resolve();
      };
      img.src = src;
    });
  };

  const photoGap = 10;
  if (photos.length === 0) {
    ctx.fillStyle = GRAY_LIGHT;
    roundRect(ctx, contentX, y, contentW, photoAreaH, 16);
    ctx.fill();
    ctx.strokeStyle = GRAY_BORDER;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    roundRect(ctx, contentX, y, contentW, photoAreaH, 16);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#AAA";
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("📷  사진이 등록되지 않았습니다", W / 2, y + photoAreaH / 2 + 6);
    ctx.textAlign = "left";
  } else if (photos.length === 1) {
    await drawRoundedImage(photos[0], contentX, y, contentW, photoAreaH, 16);
  } else if (photos.length === 2) {
    const hw = (contentW - photoGap) / 2;
    await drawRoundedImage(photos[0], contentX, y, hw, photoAreaH, 16);
    await drawRoundedImage(photos[1], contentX + hw + photoGap, y, hw, photoAreaH, 16);
  } else {
    const lw = (contentW - photoGap) * 0.55;
    const rw = (contentW - photoGap) * 0.45;
    const rh = (photoAreaH - photoGap) / 2;
    await drawRoundedImage(photos[0], contentX, y, lw, photoAreaH, 16);
    await drawRoundedImage(photos[1], contentX + lw + photoGap, y, rw, rh, 16);
    await drawRoundedImage(photos[2], contentX + lw + photoGap, y + rh + photoGap, rw, rh, 16);
  }
  y += photoAreaH + 14;

  // ══════════════════════════════════════
  // ── 정보 섹션 — 가용 높이에 맞게 자동 조정 ──
  // ══════════════════════════════════════
  const infoAvailH = contactY - y - 10;

  const descText = report.description || "특이사항 없음";
  const noteText = report.extraNote || "";
  const hasNote = !!noteText;

  const measureLines = (text: string, fontSize: number) => {
    ctx.font = `${fontSize}px sans-serif`;
    return wrapText(ctx, text, contentW - 14).length;
  };

  let bestFS = 20;
  let bestRowH = 28;
  let bestSecH = 30;
  let bestDivG = 8;
  let bestSecG = 6;

  for (let fs = 30; fs >= 14; fs--) {
    const rowH = Math.round(fs * 1.45);
    const secH = Math.round(fs * 1.6);
    const divG = Math.round(fs * 0.4);
    const secG = Math.round(fs * 0.3);

    const descLines = measureLines(descText, fs);
    const noteLines = hasNote ? measureLines(noteText, fs) : 0;

const extraGap = Math.round(fs * 0.8);
    const totalH =
      secH + rowH * 2 + secG + divG +                                             // 펫정보
      secH + extraGap + divG +                                                     // 실종 일시
      secH + extraGap + secG + divG +                                              // 실종 위치
      secH + Math.max(descLines * rowH + 4, rowH) + secG + divG +                // 상태/특징
      (hasNote ? secH + noteLines * rowH + secG + divG : 0);                     // 추가말

    if (totalH <= infoAvailH) {
      bestFS = fs;
      bestRowH = rowH;
      bestSecH = secH;
      bestDivG = divG;
      bestSecG = secG;
      break;
    }
  }

  const SECTION_FONT = Math.round(bestFS * 1.15);
  const ROW_FONT = bestFS;
  const ROW_HEIGHT = bestRowH;
  const SECTION_GAP = bestSecG;
  const DIVIDER_GAP = bestDivG;
  const COL2_X = contentX + contentW / 2;

  // 라벨~값 간격: 한글 라벨 최대 너비("실종 위치") + 고정 패딩
  // 라벨 너비를 실제 측정해서 값 시작 X를 결정
  const getLabelValX = (label: string) => {
    ctx.font = `${ROW_FONT}px sans-serif`;
    const lw = ctx.measureText(label).width;
    return contentX + 14 + lw + Math.round(bestFS * 1.2); // 라벨 너비 + 넉넉한 간격
  };

  const drawSectionTitle = (title: string, yPos: number) => {
    ctx.fillStyle = PRIMARY;
    roundRect(ctx, contentX, yPos, 5, Math.round(SECTION_FONT * 1.0), 2);
    ctx.fill();
    ctx.fillStyle = DARK;
    ctx.font = `bold ${SECTION_FONT}px sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText(title, contentX + 14, yPos + SECTION_FONT);
    return yPos + bestSecH;
  };

  // 일반 행: 라벨~값 간격은 getLabelValX 로 동적 결정
  const drawInfoRow = (label: string, value: string, yPos: number) => {
    ctx.fillStyle = "#888888";
    ctx.font = `${ROW_FONT}px sans-serif`;
    ctx.fillText(label, contentX + 14, yPos + ROW_FONT);
    ctx.fillStyle = DARK;
    ctx.font = `bold ${ROW_FONT}px sans-serif`;
    const valX = getLabelValX(label);
    ctx.fillText(value, valX, yPos + ROW_FONT);
    return yPos + ROW_HEIGHT;
  };

  const drawInfoRowDouble = (
    label1: string, value1: string,
    label2: string, value2: string,
    yPos: number
  ) => {
    const VAL_OFFSET = Math.round(bestFS * 4.5);
    ctx.fillStyle = "#888888";
    ctx.font = `${ROW_FONT}px sans-serif`;
    ctx.fillText(label1, contentX + 14, yPos + ROW_FONT);
    ctx.fillStyle = DARK;
    ctx.font = `bold ${ROW_FONT}px sans-serif`;
    ctx.fillText(value1, contentX + 14 + VAL_OFFSET, yPos + ROW_FONT);

    ctx.fillStyle = "#888888";
    ctx.font = `${ROW_FONT}px sans-serif`;
    ctx.fillText(label2, COL2_X, yPos + ROW_FONT);
    ctx.fillStyle = DARK;
    ctx.font = `bold ${ROW_FONT}px sans-serif`;
    ctx.fillText(value2, COL2_X + VAL_OFFSET, yPos + ROW_FONT);

    return yPos + ROW_HEIGHT;
  };

  const drawDivider = (yPos: number) => {
    ctx.strokeStyle = GRAY_BORDER;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(contentX, yPos);
    ctx.lineTo(contentX + contentW, yPos);
    ctx.stroke();
    return yPos + DIVIDER_GAP;
  };

  // 항목 간 추가 여백 (모든 섹션에서 동일하게 사용)
  const lostRowExtraGap = Math.round(bestFS * 0.8);

// ── 펫 정보 ──
y = drawSectionTitle(`실종 ${petInfo.species} 정보`, y);
y = drawInfoRowDouble("품종", petInfo.breed || "미기재", "성별", petInfo.gender || "미기재", y);  // ← 변경
y = drawInfoRowDouble("나이", petInfo.age || "미기재", "몸무게", petInfo.weight || "미기재", y);
y += lostRowExtraGap;
y = drawDivider(y);

  // ── 실종 일시 (제목과 값 한 줄, 값은 회색 일반 폰트) ──
  const lostDateTimeValX = getLabelValX("실종 일시");
  ctx.fillStyle = PRIMARY;
  roundRect(ctx, contentX, y, 5, Math.round(SECTION_FONT * 1.0), 2);
  ctx.fill();
  ctx.fillStyle = DARK;
  ctx.font = `bold ${SECTION_FONT}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("실종 일시", contentX + 14, y + SECTION_FONT);
  ctx.fillStyle = GRAY_TEXT;
  ctx.font = `${ROW_FONT}px sans-serif`;
  ctx.fillText(report.lostDateTime || "미기재", lostDateTimeValX, y + SECTION_FONT);
  y += bestSecH + lostRowExtraGap;
  y = drawDivider(y);

  // ── 실종 위치 (제목과 값 한 줄, 값은 회색 일반 폰트) ──
  const lostAddressValX = getLabelValX("실종 위치");
  ctx.fillStyle = PRIMARY;
  roundRect(ctx, contentX, y, 5, Math.round(SECTION_FONT * 1.0), 2);
  ctx.fill();
  ctx.fillStyle = DARK;
  ctx.font = `bold ${SECTION_FONT}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("실종 위치", contentX + 14, y + SECTION_FONT);
  ctx.fillStyle = GRAY_TEXT;
  ctx.font = `${ROW_FONT}px sans-serif`;
  ctx.fillText(report.addressInput || "미기재", lostAddressValX, y + SECTION_FONT);
  y += bestSecH + lostRowExtraGap;
  y = drawDivider(y);

  // ── 실종 당시 상태 및 특징 ──
  y = drawSectionTitle("실종 당시 상태 및 특징", y);
  ctx.fillStyle = GRAY_TEXT;
  ctx.font = `${ROW_FONT}px sans-serif`;
  const descLines = wrapText(ctx, descText, contentW - 14);
  descLines.forEach((line, i) => {
    ctx.fillText(line, contentX + 14, y + ROW_FONT + i * ROW_HEIGHT);
  });
  y += Math.max(descLines.length * ROW_HEIGHT + 4, ROW_HEIGHT);
  y += lostRowExtraGap;
  y = drawDivider(y);

  // ── 추가로 하고 싶은 말 ──
  if (hasNote) {
    y = drawSectionTitle("추가로 하고 싶은 말", y);
    ctx.fillStyle = GRAY_TEXT;
    ctx.font = `${ROW_FONT}px sans-serif`;
    const noteLines = wrapText(ctx, noteText, contentW - 14);
    noteLines.forEach((line, i) => {
      ctx.fillText(line, contentX + 14, y + ROW_FONT + i * ROW_HEIGHT);
    });
    y += Math.max(noteLines.length * ROW_HEIGHT + 4, ROW_HEIGHT);
    y += lostRowExtraGap;
    y = drawDivider(y);
  }

  // ══════════════════════════════════════
  // ── 연락처: 빨간 영역과 간격(contactGap) 두고, 중앙, 가로 80%, 빨간색 ──
  // ══════════════════════════════════════
  const phoneNumber = report.contactNumber || "앱에서 제보해 주세요";
  const contactFullText = `연락처: ${phoneNumber}`;
  const targetContactW = contentW * 0.80;

  let contactFS = 40;
  for (let fs = 72; fs >= 18; fs--) {
    ctx.font = `bold ${fs}px sans-serif`;
    if (ctx.measureText(contactFullText).width <= targetContactW) {
      contactFS = fs;
      break;
    }
  }

  ctx.font = `bold ${contactFS}px sans-serif`;
  const contactTextW = ctx.measureText(contactFullText).width;
  const contactTextX = contentX + (contentW - contactTextW) / 2;
  ctx.fillStyle = RED;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(contactFullText, contactTextX, contactY + contactAreaH / 2);
  ctx.textBaseline = "alphabetic";

  // ── 하단 빨간 푸터 ──
  ctx.fillStyle = RED;
  ctx.beginPath();
  ctx.moveTo(cardX, footerY);
  ctx.lineTo(cardX + cardW, footerY);
  ctx.lineTo(cardX + cardW, cardY + cardH - 24);
  ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - 24, cardY + cardH);
  ctx.lineTo(cardX + 24, cardY + cardH);
  ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - 24);
  ctx.lineTo(cardX, footerY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = WHITE;
  ctx.font = "bold 26px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("발견하시면 제보 부탁드립니다!", W / 2, footerY + footerH / 2);
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
}

interface LostPetPosterProps {
  report: ReportData;
  petInfo: PetBasicInfo;
  onClose: () => void;
}

export default function LostPetPoster({ report, petInfo, onClose }: LostPetPosterProps) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);

  useEffect(() => {
    generateLostPetPoster(report, petInfo).then((url) => {
      setPosterUrl(url);
      setGenerating(false);
    });
  }, []);

  const handleDownload = () => {
    if (!posterUrl) return;
    const a = document.createElement("a");
    a.href = posterUrl;
    a.download = `실종포스터_${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#1A1A2E]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <X size={22} className="text-white" />
        </button>
        <span className="font-bold text-[16px] text-white">실종 포스터</span>
        <div className="w-8" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center py-4 px-4 gap-4">
        {generating ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-white/20 border-t-[#17B5EA] rounded-full animate-spin" />
            <p className="text-white/70 text-sm font-medium">포스터를 생성하고 있습니다...</p>
          </div>
        ) : posterUrl ? (
          <>
            <img
              src={posterUrl}
              alt="실종 포스터"
              className="w-full max-w-sm rounded-2xl shadow-2xl border border-white/10"
            />
            <button
              onClick={handleDownload}
              className="w-full max-w-sm h-14 rounded-2xl font-bold text-[16px] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #17B5EA, #0E8FBB)" }}
            >
              <Download size={20} />
              포스터 다운로드
            </button>
            <p className="text-white/40 text-xs text-center">
              SNS, 카카오톡 등에 공유해서 더 많은 분들께 알려보세요
            </p>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <p className="text-white/50 text-sm">포스터 생성에 실패했습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}