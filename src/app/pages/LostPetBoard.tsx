import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ChevronLeft,
  Bell,
  User,
  MapPin,
  MessageCircle,
  Send,
  X,
  Bot,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { globalPetsData } from "./PetInfo";
import type { ReportData } from "./lostPetUtils";

/* ─── 타입 정의 ─── */
interface ChatMessage {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMine: boolean;
}

interface AiMessage {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
}

interface LostPetBoardLocationState {
  petId?: string;
}

/* ─── 초기 채팅 데이터 ─── */
const initialMessages: ChatMessage[] = [
  { id: 1, sender: "이민준", text: "홍대 걷다가 비슷한 강아지 봤어요. 어제 오후 4시쯤 와우산로 쪽에서요!", time: "14:03", isMine: false },
  { id: 2, sender: "나", text: "정말요?! 어느 방향으로 가던가요?", time: "14:05", isMine: true },
  { id: 3, sender: "이민준", text: "홍익초등학교 방향으로 가는 것 같았어요. 혼자 어슬렁거리고 있었어요.", time: "14:06", isMine: false },
  { id: 4, sender: "김서연", text: "저도 오늘 아침 합정역 근처에서 봤어요. 파란 하네스 맞죠?", time: "14:20", isMine: false },
  { id: 5, sender: "나", text: "네 파란 하네스 맞아요! 지금 합정 쪽으로 가볼게요 감사해요", time: "14:22", isMine: true },
];

/* ─── AI 더미 응답 데이터 ─── */
const AI_DUMMY_RESPONSES: Record<string, string> = {
  default: "실종된 반려동물을 찾는 데 도움이 필요하시면 말씀해 주세요. 전단지 제작, 수색 방법, 신고 기관 등 안내해 드릴 수 있어요.",
  전단지: "전단지에는 반드시 📌 반려동물 이름, 품종, 나이, 색상 / 📌 실종 날짜·장소 / 📌 연락처 / 📌 선명한 사진을 포함해야 해요. 주변 동물병원, 편의점, 지역 커뮤니티 게시판에 부착하면 효과적입니다.",
  수색: "실종 직후 6시간이 가장 중요해요. 실종 장소 반경 500m 내를 중심으로 수색하되, 반려동물이 좋아하는 간식이나 장난감 냄새로 유인하면 도움이 됩니다. 새벽·해질녘에 활동이 많으니 이 시간대를 공략하세요.",
  신고: "다음 기관에 신고하세요:\n① 동물보호관리시스템 (www.animal.go.kr)\n② 지역 동물보호센터\n③ 관할 경찰서 (분실물 접수)\n④ 네이버 카페 '유기동물 찾기' 등 온라인 커뮤니티",
  sns: "SNS 활용 팁: 인스타그램·카카오톡 오픈채팅에 #실종동물 #[지역명]강아지찾아요 해시태그를 활용하세요. 지역 맘카페나 당근마켓에도 게시하면 빠른 제보를 받을 수 있어요.",
  동물병원: "근처 동물병원과 유기동물 보호소에 반드시 방문하거나 연락해 두세요. 반려동물이 발견되면 가장 먼저 동물병원으로 데려가는 경우가 많습니다. 사진을 가져가서 공유해 두시면 좋아요.",
  cctv: "실종 장소 주변 CCTV 확인을 요청해 보세요. 편의점, 카페, 아파트 관리사무소 등에 협조를 요청하면 이동 경로를 파악하는 데 큰 도움이 됩니다. 관할 파출소에 요청하면 더 넓은 범위의 CCTV를 확인할 수 있어요.",
};

function getAiResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("전단지") || lower.includes("포스터")) return AI_DUMMY_RESPONSES["전단지"];
  if (lower.includes("수색") || lower.includes("찾는") || lower.includes("어디")) return AI_DUMMY_RESPONSES["수색"];
  if (lower.includes("신고") || lower.includes("기관") || lower.includes("접수")) return AI_DUMMY_RESPONSES["신고"];
  if (lower.includes("sns") || lower.includes("인스타") || lower.includes("카카오") || lower.includes("커뮤니티")) return AI_DUMMY_RESPONSES["sns"];
  if (lower.includes("병원") || lower.includes("보호소")) return AI_DUMMY_RESPONSES["동물병원"];
  if (lower.includes("cctv") || lower.includes("카메라") || lower.includes("영상")) return AI_DUMMY_RESPONSES["cctv"];
  return AI_DUMMY_RESPONSES["default"];
}

/* ─── AI 빠른 질문 버튼 ─── */
const QUICK_QUESTIONS = [
  "전단지 만드는 방법",
  "수색 팁 알려줘",
  "어디에 신고하나요?",
  "SNS 활용법",
  "동물병원·보호소",
  "CCTV 확인 방법",
];

/* ─── 헬퍼: 현재 시각 문자열 ─── */
function currentTimeString(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

/* ─── 지도 콘텐츠 컴포넌트 ─── */
function MapContent({ location }: { location: string }) {
  return (
    <div
      className="w-full h-full relative flex items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)" }}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="relative flex flex-col items-center z-10">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-bounce"
          style={{ background: "#FF5A5F" }}
        >
          <span className="text-xl">🐾</span>
        </div>
        <div
          className="mt-2 px-3 py-1 rounded-full text-xs font-semibold text-white shadow"
          style={{ background: "#FF5A5F" }}
        >
          추정 위치
        </div>
        <p className="text-[11px] mt-1 font-medium text-center px-4" style={{ color: "#555" }}>
          {location}
        </p>
      </div>
    </div>
  );
}

/* ─── 실종 사진 섹션 컴포넌트 ─── */
function LostPetPhotos({ photos, petName }: { photos: string[]; petName: string }) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  return (
    <>
      <div className="card p-4">
        <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>
          실종 당시 사진
        </p>
        <div className={`grid gap-2 ${photos.length === 1 ? "grid-cols-1" : photos.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {photos.map((photo, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className="relative overflow-hidden rounded-xl"
              style={{
                aspectRatio: photos.length === 1 ? "16/9" : "1/1",
                border: "1px solid var(--border)",
              }}
            >
              <img
                src={photo}
                alt={`${petName} 실종 사진 ${idx + 1}`}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </button>
          ))}
        </div>
        <p className="text-[11px] mt-2" style={{ color: "var(--text-3)" }}>
          사진을 탭하면 크게 볼 수 있어요
        </p>
      </div>

      {/* 사진 확대 팝업 */}
      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setSelectedIdx(null)}
        >
          <div
            className="relative max-w-sm w-full rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[selectedIdx]}
              alt={`${petName} 실종 사진`}
              className="w-full object-contain rounded-2xl"
              style={{ maxHeight: "70vh" }}
            />
            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.6)" }}
            >
              <X size={16} className="text-white" />
            </button>
            {photos.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      background: i === selectedIdx ? "white" : "rgba(255,255,255,0.4)",
                      transform: i === selectedIdx ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─── AI 실종 도우미 컴포넌트 ─── */
function AiLostHelper({ petName }: { petName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 1,
      role: "ai",
      text: `안녕하세요! 저는 AI 실종 도우미예요 🐾\n${petName}(이)를 찾는 데 도움을 드릴게요. 아래 버튼을 누르거나 궁금한 점을 직접 입력해 주세요!`,
      time: currentTimeString(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, isOpen]);

  const sendAiMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: AiMessage = {
      id: Date.now(),
      role: "user",
      text: trimmed,
      time: currentTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      const aiReply: AiMessage = {
        id: Date.now() + 1,
        role: "ai",
        text: getAiResponse(trimmed),
        time: currentTimeString(),
      };
      setMessages((prev) => [...prev, aiReply]);
      setIsTyping(false);
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAiMessage(inputText);
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* 헤더 */}
      <button
        className="w-full px-4 pt-4 pb-3 flex items-center justify-between"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>
            AI 실종 도우미
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
          >
            AI
          </span>
        </div>
        {isOpen ? (
          <ChevronUp size={18} style={{ color: "var(--text-3)" }} />
        ) : (
          <ChevronDown size={18} style={{ color: "var(--text-3)" }} />
        )}
      </button>

      {!isOpen && (
        <div className="px-4 pb-4">
          <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
            전단지 제작, 수색 방법, 신고 기관 안내 등 실종 상황을 도와드려요
          </p>
        </div>
      )}

      {isOpen && (
        <>
          {/* 빠른 질문 버튼 */}
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendAiMessage(q)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all active:scale-95"
                style={{
                  borderColor: "#c4b5fd",
                  color: "#7c3aed",
                  background: "#f5f3ff",
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* 채팅 메시지 목록 */}
          <div
            className="px-4 py-3 space-y-3 overflow-y-auto"
            style={{
              maxHeight: "260px",
              background: "var(--bg-app)",
              borderTop: "1px solid var(--border)",
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="flex items-center gap-1 mb-1">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                    >
                      <Bot size={11} className="text-white" />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: "#7c3aed" }}>
                      AI 도우미
                    </span>
                  </div>
                )}
                <div className="flex items-end gap-1.5">
                  {msg.role === "user" && (
                    <span className="text-[10px] mb-0.5" style={{ color: "var(--text-3)" }}>
                      {msg.time}
                    </span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl max-w-[80%] text-[12px] leading-relaxed shadow-sm whitespace-pre-line ${
                      msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background: "var(--primary)",
                            color: "white",
                          }
                        : {
                            background: "white",
                            color: "var(--text-1)",
                            border: "1px solid #e9d5ff",
                          }
                    }
                  >
                    {msg.text}
                  </div>
                  {msg.role === "ai" && (
                    <span className="text-[10px] mb-0.5" style={{ color: "var(--text-3)" }}>
                      {msg.time}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* 타이핑 인디케이터 */}
            {isTyping && (
              <div className="flex items-start">
                <div className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-sm bg-white shadow-sm"
                  style={{ border: "1px solid #e9d5ff" }}>
                  <span className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "#a78bfa",
                          animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                        }}
                      />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 입력창 */}
          <div
            className="px-3 py-3 flex items-center gap-2"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="AI 도우미에게 물어보세요..."
              className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none"
              style={{
                background: "var(--bg-app)",
                border: "1px solid var(--border)",
                color: "var(--text-1)",
              }}
            />
            <button
              onClick={() => sendAiMessage(inputText)}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity"
              style={{
                background: inputText.trim()
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "var(--border)",
              }}
              disabled={!inputText.trim()}
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── 메인 컴포넌트 ─── */
export default function LostPetBoard() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LostPetBoardLocationState) ?? {};

  const petId = state.petId ?? "buddy";
  const petData = globalPetsData[petId];
  const report = petData?.lostReport;

  /* 반려동물 기본 정보 */
  const name = petData?.name ?? "-";
  const species = petData?.species ?? "-";
  const breed = petData?.breed ?? "-";
  const gender = petData?.gender ?? "-";
  const age = petData?.age ?? "-";
  const weight = petData?.weight ?? "-";

  /* 실종 신고 정보 */
  const lostDateTime = report?.lostDateTime ?? "-";
  const lostLocation = report?.addressInput ?? "-";
  const contactNumber = report?.contactNumber ?? "-";
  const description = report?.description ?? "-";
  const extraNote = report?.extraNote ?? "";
  const photos = report?.photos ?? [];

  /* 채팅 상태 */
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [mapPopupOpen, setMapPopupOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "나", text, time: currentTimeString(), isMine: true },
    ]);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* 기본 정보 항목 */
  const basicInfoItems: [string, string][] = [
    ["품종", breed],
    ["성별", gender],
    ["나이", age],
    ["몸무게", weight],
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col">
      {/* ── TopBar ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-1 rounded-full hover:bg-[var(--bg-app)] transition-colors"
        >
          <ChevronLeft size={22} style={{ color: "var(--text-1)" }} />
        </button>
        <span className="text-[16px] font-bold" style={{ color: "var(--text-1)" }}>
          실종 게시판
        </span>
        <div className="flex gap-3">
          <Bell size={20} style={{ color: "var(--text-2)" }} />
          <User size={20} style={{ color: "var(--text-2)" }} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="mx-4 mt-4 space-y-4">

          {/* 상태 헤더 */}
          <div
            className="rounded-2xl overflow-hidden shadow-sm"
            style={{ background: "linear-gradient(135deg, #FF5A5F 0%, #c0392b 100%)" }}
          >
            <div className="px-5 py-4">
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                실종중
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-white font-bold text-[18px]">{name}</p>
                <p className="text-white/80 text-sm">{species}</p>
              </div>
            </div>
          </div>

          {/* 기본 정보 카드 */}
          <div className="card p-4">
            <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>
              기본 정보
            </p>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              {basicInfoItems.map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-3)" }}>{label}</p>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--text-1)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 실종 정보 카드 */}
          <div className="card p-4">
            <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>
              실종 정보
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-[12px] min-w-[52px]" style={{ color: "var(--text-3)" }}>실종 일시</span>
                <span className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{lostDateTime}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[12px] min-w-[52px]" style={{ color: "var(--text-3)" }}>실종 장소</span>
                <span className="text-[13px] font-medium" style={{ color: "var(--text-1)" }}>{lostLocation}</span>
              </div>
            </div>
          </div>

          {/* 연락처 카드 */}
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <p className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>연락처</p>
              <p className="text-[13px]" style={{ color: "var(--primary)" }}>{contactNumber}</p>
            </div>
            {contactNumber !== "-" && (
              <a
                href={`tel:${contactNumber}`}
                className="mt-3 w-full flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--primary)" }}
              >
                전화하기
              </a>
            )}
          </div>

          {/* 실종 당시 상태 및 특징 */}
          <div className="card p-4">
            <p className="text-[14px] font-bold mb-2" style={{ color: "var(--text-1)" }}>
              실종 당시 상태 및 특징
            </p>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-1)" }}>{description}</p>
          </div>

          {/* 추가 메모 */}
          {extraNote && (
            <div className="card p-4">
              <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-1)" }}>{extraNote}</p>
            </div>
          )}

          {/* 실종 당시 사진 */}
          <LostPetPhotos photos={photos} petName={name} />

          {/* 현재 추정 위치 */}
          <div className="card overflow-hidden">
            <div className="px-4 pt-4 pb-3 flex items-center gap-2">
              <MapPin size={16} style={{ color: "var(--primary)" }} />
              <span className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>
                현재 추정 위치
              </span>
            </div>
            <div className="h-[120px] cursor-pointer" onClick={() => setMapPopupOpen(true)}>
              <MapContent location={lostLocation} />
            </div>
          </div>

          {/* AI 실종 도우미 */}
          <AiLostHelper petName={name} />

          {/* 실시간 채팅 */}
          <div className="card overflow-hidden">
            {/* 채팅 헤더 */}
            <div className="px-4 pt-4 pb-3 border-b border-[var(--border)] flex items-center gap-2">
              <MessageCircle size={16} style={{ color: "var(--primary)" }} />
              <span className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>
                실시간 제보 채팅
              </span>
            </div>

            {/* 채팅 메시지 목록 */}
            <div className="px-4 py-3 space-y-3 max-h-72 overflow-y-auto bg-[var(--bg-app)]">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isMine ? "items-end" : "items-start"}`}>
                  {!msg.isMine && (
                    <span className="text-[10px] mb-1 font-semibold" style={{ color: "var(--text-3)" }}>
                      {msg.sender}
                    </span>
                  )}
                  <div className="flex items-end gap-1.5">
                    {msg.isMine && (
                      <span className="text-[10px] mb-0.5" style={{ color: "var(--text-3)" }}>{msg.time}</span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[75%] text-[13px] leading-snug shadow-sm ${
                        msg.isMine ? "rounded-br-sm text-white" : "rounded-bl-sm"
                      }`}
                      style={{
                        background: msg.isMine ? "var(--primary)" : "white",
                        color: msg.isMine ? "white" : "var(--text-1)",
                        border: msg.isMine ? "none" : "1px solid var(--border)",
                      }}
                    >
                      {msg.text}
                    </div>
                    {!msg.isMine && (
                      <span className="text-[10px] mb-0.5" style={{ color: "var(--text-3)" }}>{msg.time}</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* 채팅 입력 */}
            <div className="px-3 py-3 border-t border-[var(--border)] flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="제보 내용을 입력하세요..."
                className="flex-1 px-3 py-2 rounded-xl text-[13px] outline-none"
                style={{
                  background: "var(--bg-app)",
                  border: "1px solid var(--border)",
                  color: "var(--text-1)",
                }}
              />
              <button
                onClick={sendMessage}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity"
                style={{ background: inputText.trim() ? "var(--primary)" : "var(--border)" }}
                disabled={!inputText.trim()}
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── 지도 팝업 ── */}
      {mapPopupOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setMapPopupOpen(false)}
        >
          <div
            className="relative w-[90%] max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white flex flex-col"
            style={{ height: "min(420px, 75vh)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 팝업 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <MapPin size={15} style={{ color: "var(--primary)" }} />
                <span className="text-[14px] font-bold" style={{ color: "var(--text-1)" }}>
                  현재 추정 위치
                </span>
              </div>
              <button onClick={() => setMapPopupOpen(false)}>
                <X size={20} style={{ color: "var(--text-2)" }} />
              </button>
            </div>

            {/* 지도 영역 */}
            <div className="flex-1 overflow-hidden">
              <MapContent location={lostLocation} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
