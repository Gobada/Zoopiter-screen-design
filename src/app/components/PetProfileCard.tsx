import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import { DefaultPetSVG } from "./DefaultPetSVG";

export const CARD_H = 95;
export const OVERFLOW = 25;
export const DOG_W = 140;

// ──────────────────────────────────────────
// 말풍선 문구 설정
// 상태별 문구를 여기서 직접 수정하세요
// ──────────────────────────────────────────
const PET_SPEECH_CONFIG: Record<string, string[]> = {
  "집":  ["집에 있어요 🏠", "오늘 산책 갈까요? 🐾", "간식 언제 줄래요? 🍖", "심심해요~ 놀아줄래요!"],
  "외출": ["나 없어요 🐕", "빨리 와요, 기다려요!", "배가 좀 고파요 🌟"],
  "돌봄": ["돌봄 중이에요 🐾", "잘 지내고 있어요!"],
  "실종": ["어디 있는지 몰라요 😰", "빨리 찾아주세요..."],
};
const PET_SPEECH_DEFAULT = ["안녕하세요! 🐾", "반가워요 🐶"];

// 타이핑 속도 설정 (ms) — 여기서 속도를 조절하세요
const TYPING_SPEED = 110;
const DELETING_SPEED = 35;
const PAUSE_AFTER_TYPED = 2500;
const PAUSE_BEFORE_NEXT = 400;
// ──────────────────────────────────────────

function usePetSpeech(status: string) {
  const phrases = PET_SPEECH_CONFIG[status] ?? PET_SPEECH_DEFAULT;
  const [displayText, setDisplayText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIdx % phrases.length];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === currentPhrase) {
      timeout = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPED);
    } else if (isDeleting && displayText === "") {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIdx((i) => (i + 1) % phrases.length);
      }, PAUSE_BEFORE_NEXT);
    } else if (isDeleting) {
      timeout = setTimeout(
        () => setDisplayText((t) => t.slice(0, -1)),
        DELETING_SPEED
      );
    } else {
      timeout = setTimeout(
        () => setDisplayText(currentPhrase.slice(0, displayText.length + 1)),
        TYPING_SPEED
      );
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIdx, phrases]);

  useEffect(() => {
    setDisplayText("");
    setIsDeleting(false);
    setPhraseIdx(0);
  }, [status]);

  return displayText;
}

interface PetProfileCardProps {
  cardColor: string;
  status: string;
  imageUrl: string | null;
  isProcessing?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  overlays?: React.ReactNode;
  showSpeech?: boolean;
}

export function PetProfileCard({
  cardColor,
  status,
  imageUrl,
  isProcessing = false,
  onClick,
  children,
  overlays,
  showSpeech = true,
}: PetProfileCardProps) {
  const speechText = usePetSpeech(status);

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        height: `${CARD_H + OVERFLOW}px`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* 카드 배경 */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: `${CARD_H}px`,
          background: cardColor,
          borderRadius: "var(--r-12)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          transition: "background 0.3s ease",
        }}
      >
        {/* 왼쪽 콘텐츠 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            paddingLeft: `${DOG_W + 14}px`,
            paddingRight: "16px",
            borderRadius: "var(--r-12)",
          }}
        >
          <div style={{ flex: 1 }}>{children}</div>
        </div>
      </div>

      {/* 펫 이미지 */}
      <div
        style={{
          position: "absolute",
          top: 0, left: "8px",
          width: `${DOG_W}px`,
          height: `${CARD_H + OVERFLOW}px`,
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        {isProcessing ? (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "9999px", background: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <Loader style={{ width: "20px", height: "20px", color: "var(--primary)", animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "9px", marginTop: "4px", color: "var(--text-2)" }}>처리 중...</span>
            </div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="pet"
            style={{
              width: "100%", height: "100%",
              objectFit: "contain", objectPosition: "bottom",
              filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.2))",
              transform: "scale(1)",
              transformOrigin: "bottom",
              transition: "all 0.3s ease",
            }}
          />
        ) : (
          <DefaultPetSVG
            style={{ width: "100%", height: "100%", transformOrigin: "bottom", transition: "all 0.3s ease" }}
          />
        )}
      </div>

      {/* 말풍선 (꼬리 없음, 한 줄 고정) */}
      {showSpeech && speechText && (
        <div
          style={{
            position: "absolute",
            top: "2px",
            left: `${DOG_W - 6}px`,
            zIndex: 20,
            pointerEvents: "none",
            filter: "var(--bubble-drop-shadow)",
          }}
        >
          <div
            style={{
              background: "var(--bubble-bg)",
              borderRadius: "var(--bubble-radius)",
              padding: "7px 13px",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "var(--bubble-text)",
                lineHeight: 1.35,
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {speechText}
              <span
                style={{
                  display: "inline-block",
                  width: "1.5px",
                  height: "12px",
                  background: "var(--bubble-cursor)",
                  verticalAlign: "middle",
                  marginLeft: "1px",
                  animation: "petCursorBlink 0.9s step-end infinite",
                }}
              />
            </span>
          </div>
        </div>
      )}

      {/* 오버레이 슬롯 */}
      {overlays}
    </div>
  );
}
