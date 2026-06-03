import { TopBar } from "../components/TopBar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  MapPin,
  Phone,
  X,
  Camera,
  Calendar,
  ListChecks,
  UtensilsCrossed,
  Pill,
  Footprints,
  Gamepad2,
  Scissors,
  Stethoscope,
  Package,
  Syringe,
  ClipboardCheck,
  HeartPulse,
  Users,
  Home,
} from "lucide-react";
import { useNavigate, useParams } from "react-router";
import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { PetProfileCard, OVERFLOW } from "../components/PetProfileCard";
import type { ReportData } from "./lostPetUtils";
import { getTop3Tasks, toggleTask as storeToggleTask, CATEGORY_INFO } from "./petCareStore";

const PET_INFO_SPEECH = ["여기에서 저를 관리할 수 있어요.", "저를 잘 보살펴 주세요!"];

// 카테고리 아이콘 매핑 (단색 라인 아이콘)
const TASK_CATEGORY_ICON: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }>> = {
  ListChecks, UtensilsCrossed, Pill, Footprints, Gamepad2,
  Scissors, Stethoscope, Package, Syringe, ClipboardCheck,
  HeartPulse, Calendar,
};

export const globalPetStates: Record<
  string,
  { removedImageUrl: string | null; cardColor: string }
> = {
  buddy: { removedImageUrl: null, cardColor: "#BBDEFB" },
  bappe: { removedImageUrl: null, cardColor: "#F8BBD0" },
};

export const globalPetsData: Record<
  string,
  {
    name: string;
    age: string;
    breed: string;
    species: string;
    gender: string;
    weight: string;
    neutered: string;
    dummyColor: string;
    photos: string[];
    lostReport?: ReportData;
  }
> = {
  buddy: {
    name: "주피",
    age: "3살",
    breed: "말티즈",
    species: "강아지",
    gender: "수컷",
    weight: "5kg",
    neutered: "완료",
    dummyColor: "#90CAF9",
    photos: [
      "https://images.unsplash.com/photo-1558788353-f76d92427f16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzQ2OTgzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1766947910755-8c84dcce0271?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwdXBweSUyMGZhY2V8ZW58MXx8fHwxNzc0Njk4MzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1586796314073-c9b40efb3d15?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbWFsbCUyMGRvZ3xlbnwxfHx8fDE3NzQ2OTgzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnb2xkZW4lMjByZXRyaWV2ZXJ8ZW58MXx8fHwxNzc0Njc4OTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1561754050-9a1ee0470c73?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBidWxsZG9nfGVufDF8fHx8MTc3NDY5ODM0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1713575029300-cdb14999ff65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3JnaSUyMGRvZ3xlbnwxfHx8fDE3NzQ2NDk2MDF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
  bappe: {
    name: "주비",
    age: "2살",
    breed: "포메라니안",
    species: "강아지",
    gender: "암컷",
    weight: "3kg",
    neutered: "완료",
    dummyColor: "#F48FB1",
    photos: [
      "https://images.unsplash.com/photo-1631048905843-88f82fba8fd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFnbGUlMjBkb2d8ZW58MXx8fHwxNzc0Njk4NDM2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1578133507770-a35cc3c786e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaGliYSUyMGludXxlbnwxfHx8fDE3NzQ2ODM3MzV8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1590419690008-905895e8fe0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodXNreSUyMGRvZ3xlbnwxfHx8fDE3NzQ2OTg0Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1651273427958-bf78352e39be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb29kbGUlMjBkb2d8ZW58MXx8fHwxNzc0Njk4NDM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1561495376-dc9c7c5b8726?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWJyYWRvciUyMHB1cHB5fGVufDF8fHx8MTc3NDY5ODQzOHww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1610041518868-f9284e7eecfe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlodWFodWElMjBkb2d8ZW58MXx8fHwxNzc0Njk4NDM4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  },
};

export const globalPetStatus: Record<string, string> = {
  buddy: "집",
  bappe: "집",
};

export const globalPets: { id: string; name: string }[] = [
  { id: "buddy", name: "주피" },
  { id: "bappe", name: "주비" },
];

const DUMMY_COLORS = [
  "#90CAF9",
  "#F48FB1",
  "#A5D6A7",
  "#FFE082",
  "#CE93D8",
  "#80DEEA",
];

async function removeBackgroundToBase64(
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("image_file", file);
  formData.append("size", "auto");

  const response = await fetch(
    "https://api.remove.bg/v1.0/removebg",
    {
      method: "POST",
      headers: { "X-Api-Key": "VwkgLBw4nN8v7MXkk4MDz6n4" },
      body: formData,
    },
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(
      err?.errors?.[0]?.title ?? "Remove.bg API 오류",
    );
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function DummyDogSVG({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 120 150"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      <ellipse
        cx="32"
        cy="55"
        rx="14"
        ry="20"
        transform="rotate(-12 32 55)"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <ellipse
        cx="88"
        cy="55"
        rx="14"
        ry="20"
        transform="rotate(12 88 55)"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <circle
        cx="60"
        cy="68"
        r="30"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <rect
        x="48"
        y="92"
        width="24"
        height="16"
        rx="10"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <ellipse
        cx="60"
        cy="118"
        rx="28"
        ry="26"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <rect
        x="37"
        y="130"
        width="14"
        height="18"
        rx="7"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <rect
        x="69"
        y="130"
        width="14"
        height="18"
        rx="7"
        fill="white"
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <path
        d="M86 108 Q108 90 103 74 Q99 62 91 66"
        fill="none"
        stroke="#CCCCCC"
        strokeWidth="2"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <circle cx="48" cy="65" r="3" fill="#CCCCCC" />
      <circle cx="72" cy="65" r="3" fill="#CCCCCC" />
      <ellipse cx="60" cy="75" rx="5" ry="3.5" fill="#CCCCCC" />
      <line
        x1="60"
        y1="107"
        x2="60"
        y2="129"
        stroke="#CCCCCC"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="49"
        y1="118"
        x2="71"
        y2="118"
        stroke="#CCCCCC"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function CareLogCard({ isActive: initialActive }: { isActive: boolean }) {
  const [isActive, setIsActive] = useState(initialActive);
  const [isExpanded, setIsExpanded] = useState(false);
  const [careText, setCareText] = useState("");
  const [careFeed, setCareFeed] = useState<{
    type: "text" | "photo";
    content: string;
    time: string;
    author: "주관리자" | "돌보미";
  }[]>([
    { type: "text", content: "오늘 산책 잘 했어요 🐾", time: "방금", author: "돌보미" },
    { type: "text", content: "밥 잘 먹었어요 😊", time: "1시간 전", author: "돌보미" },
    { type: "photo", content: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400", time: "2시간 전", author: "돌보미" },
    { type: "text", content: "잘 부탁드려요.", time: "3시간 전", author: "주관리자" },
  ]);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setShowCamera(true);
    setCapturedPhoto(null);
    setTimeout(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        streamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      } catch { alert("카메라 접근 권한이 필요해요."); setShowCamera(false); }
    }, 100);
  };
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    setCapturedPhoto(canvasRef.current.toDataURL("image/jpeg"));
    streamRef.current?.getTracks().forEach(t => t.stop());
  };
  const registerPhoto = () => {
    if (!capturedPhoto) return;
    setCareFeed(prev => [{ type: "photo", content: capturedPhoto!, time: "방금", author: "주관리자" }, ...prev]);
    setCapturedPhoto(null); setShowCamera(false);
  };
  const submitText = () => {
    if (!careText.trim()) return;
    setCareFeed(prev => [{ type: "text", content: careText, time: "방금", author: "주관리자" }, ...prev]);
    setCareText("");
  };
  const handleDelete = (idx: number) => {
    setCareFeed(prev => prev.filter((_, i) => i !== idx));
    setDeleteTarget(null);
  };

  return (
    <div className="card p-4">
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isExpanded ? "12px" : "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)" }}>BNB 케어 일지</span>
          <button
            onClick={() => setIsActive(v => !v)}
            style={{
              fontSize: "11px", padding: "3px 10px", borderRadius: "9999px", cursor: "pointer",
              background: isActive ? "#EBF5FF" : "var(--bg-app)",
              color: isActive ? "var(--primary)" : "var(--text-3)",
              border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
              fontWeight: 600,
            }}
          >
            {isActive ? "활성화 (test)" : "비활성화 (test)"}
          </button>
        </div>
        <button
          onClick={() => setIsExpanded(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
        >
          <ChevronDown size={20} color="var(--text-3)"
            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          />
        </button>
      </div>

      {isExpanded && (
        <>
          {!isActive ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <p style={{ fontSize: "13px", color: "var(--text-3)", lineHeight: 1.6 }}>
                펫BNB 예약 기간에만 활성화됩니다.<br />
                돌봄 관리자가 케어 일지를 작성할 수 있어요.
              </p>
            </div>
          ) : (
            <>
              {/* 케어 메모 입력 */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                <input
                  value={careText}
                  onChange={e => setCareText(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && submitText()}
                  placeholder="케어 메모 입력..."
                  style={{
                    flex: 1, padding: "10px 12px", borderRadius: "10px",
                    border: "1.5px solid var(--border)", fontSize: "13px", color: "var(--text-1)",
                    outline: "none",
                  }}
                />
                <button
                  onClick={submitText}
                  disabled={!careText.trim()}
                  style={{
                    padding: "10px 16px", borderRadius: "10px",
                    background: "var(--primary)", border: "none",
                    cursor: "pointer", fontSize: "13px", color: "white", fontWeight: 600,
                    opacity: careText.trim() ? 1 : 0.4,
                  }}
                >등록</button>
              </div>

              {/* 사진 올리기 버튼 - 메모 입력란 바로 아래 */}
              <button
                onClick={startCamera}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  padding: "11px", borderRadius: "10px", marginBottom: "12px",
                  background: "#EBF5FF", border: "1.5px solid #BFDBFE",
                  cursor: "pointer", fontSize: "13px", fontWeight: 600, color: "var(--primary)",
                }}
              >
                <Camera size={16} color="var(--primary)" strokeWidth={1.5} />
                사진 올리기
              </button>

              {/* 피드 */}
              <div style={{ marginBottom: "4px" }}>
                {careFeed.map((item, idx) => (
                  <div key={idx} style={{
                    display: "flex", gap: "8px", marginBottom: "10px",
                    alignItems: item.type === "photo" ? "flex-start" : "center",
                    padding: "8px 10px", borderRadius: "10px", background: "var(--bg-app)",
                  }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: "52px", height: "22px", fontSize: "10px", fontWeight: 700,
                      borderRadius: "9999px", flexShrink: 0,
                      background: item.author === "주관리자" ? "#EBF5FF" : "#FFF0F5",
                      color: item.author === "주관리자" ? "var(--primary)" : "#F45C98",
                    }}>
                      {item.author}
                    </span>
                    <div style={{ flex: 1 }}>
                      {item.type === "photo"
                        ? <img src={item.content} alt="care" style={{ width: "100%", maxWidth: "200px", borderRadius: "8px", objectFit: "cover", display: "block" }} />
                        : <p style={{ fontSize: "13px", color: "var(--text-1)", margin: 0 }}>{item.content}</p>}
                      <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{item.time}</span>
                    </div>
                    <button onClick={() => setDeleteTarget(idx)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", flexShrink: 0 }}>
                      <X size={14} color="var(--text-3)" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* 카메라 모달 */}
      {showCamera && (
        <div style={{ position: "fixed", inset: 0, background: "black", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {!capturedPhoto ? (
            <>
              <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: "70vh", objectFit: "cover" }} />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setShowCamera(false); }}
                  style={{ padding: "12px 24px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: "15px", cursor: "pointer" }}>
                  취소
                </button>
                <button onClick={capturePhoto}
                  style={{ width: "64px", height: "64px", borderRadius: "9999px", background: "white", border: "4px solid rgba(255,255,255,0.5)", cursor: "pointer" }} />
              </div>
            </>
          ) : (
            <>
              <img src={capturedPhoto} alt="preview" style={{ width: "100%", maxHeight: "70vh", objectFit: "cover" }} />
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button onClick={() => { setCapturedPhoto(null); startCamera(); }}
                  style={{ padding: "12px 24px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", border: "none", color: "white", fontSize: "15px", cursor: "pointer" }}>
                  다시 촬영
                </button>
                <button onClick={registerPhoto}
                  style={{ padding: "12px 24px", borderRadius: "12px", background: "var(--primary)", border: "none", color: "white", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}>
                  등록
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 삭제 확인 팝업 */}
      {deleteTarget !== null && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "320px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "8px" }}>삭제할까요?</h3>
            <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "20px" }}>이 케어 기록을 삭제하면 복구할 수 없어요.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setDeleteTarget(null)}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "var(--bg-app)", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "var(--text-2)" }}>취소</button>
              <button onClick={() => handleDelete(deleteTarget)}
                style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#FF5252", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "white" }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default function PetInfo() {
  const navigate = useNavigate();
  const { petId } = useParams();
  const [activeTab, setActiveTab] = useState("buddy");
  const [showLocationPopup, setShowLocationPopup] =
    useState(false);
  const [showStatusDropdown, setShowStatusDropdown] =
    useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    () => globalPetStatus[activeTab] ?? "집",
  );

  const [petStates, setPetStates] = useState<
    Record<
      string,
      { removedImageUrl: string | null; cardColor: string }
    >
  >(() => ({ ...globalPetStates }));

  const [isProcessing, setIsProcessing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAddPetPopup, setShowAddPetPopup] = useState(false);
  const [newPetName, setNewPetName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [healthUpdateKey, forceHealthUpdate] = useState(0);
  
  const [showGuardianPopup, setShowGuardianPopup] = useState(false);
  // 현재 펫의 관리자 역할 (실제 구현시 API에서 받아옴)
  const myRole: "주관리자" | "부관리자" | "돌보미" = "주관리자";
  const guardianList = [
    { name: "김지수", role: "부관리자" },
    { name: "이민준", role: "돌보미" },
  ];

  const [pets, setPets] = useState(() => [...globalPets]);

  // 컴포넌트 마운트 시 또는 activeTab 변경 시 펫 이름 업데이트
  useEffect(() => {
    // globalPets의 길이가 변경되었는지 확인 (새 펫이 추가되었을 수 있음)
    if (globalPets.length !== pets.length) {
      setPets([...globalPets]);
      return;
    }

    // globalPetsData에서 최신 이름 가져오기
    const updatedPets = pets.map((pet) => ({
      ...pet,
      name: globalPetsData[pet.id]?.name || pet.name,
    }));

    // 변경사항이 있는 경우에만 업데이트
    const hasChanges = updatedPets.some(
      (updated, idx) => updated.name !== pets[idx].name,
    );
    if (hasChanges) {
      setPets(updatedPets);
      // globalPets 배열도 동기화 (ID 기반으로)
      updatedPets.forEach((updatedPet) => {
        const globalIndex = globalPets.findIndex(p => p.id === updatedPet.id);
        if (globalIndex !== -1) {
          globalPets[globalIndex] = updatedPet;
        }
      });
    }
  }, [activeTab, pets.length]);

  const currentPet = globalPetsData[activeTab] ?? {
    name: pets.find((p) => p.id === activeTab)?.name ?? "새 펫",
    age: "-",
    breed: "-",
    species: "강아지",
    gender: "-",
    weight: "-",
    neutered: "-",
    dummyColor: "#A5D6A7",
    photos: [],
  };
  const currentPetState = petStates[activeTab];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentHealthTasks = useMemo(() => getTop3Tasks(activeTab), [activeTab, healthUpdateKey]);

  const toggleTask = (taskId: number) => {
    storeToggleTask(activeTab, taskId);
    forceHealthUpdate(n => n + 1);
  };

  const statusOptions = [
    { label: "집", color: "#4CAF50" },
    { label: "외출", color: "#FFD700" },
    { label: "돌봄", color: "#9C27B0" },
    { label: "실종", color: "#FF5722" },
  ];

  const handlePhotoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsProcessing(true);
      setShowColorPicker(false);
      try {
        const base64 = await removeBackgroundToBase64(file);
        setPetStates((prev) => {
          const next = {
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              removedImageUrl: base64,
            },
          };
          globalPetStates[activeTab] = next[activeTab];
          return next;
        });
      } catch (err) {
        console.error("이미지 처리 오류:", err);
        alert(
          "이미지 처리 중 오류가 발생했어요. 다시 시도해 주세요.",
        );
      } finally {
        setIsProcessing(false);
        if (fileInputRef.current)
          fileInputRef.current.value = "";
      }
    },
    [activeTab],
  );

  const handleColorChange = useCallback(
    (newColor: string) => {
      setPetStates((prev) => {
        const next = {
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            cardColor: newColor,
          },
        };
        globalPetStates[activeTab] = next[activeTab];
        return next;
      });
      setShowColorPicker(false);
    },
    [activeTab],
  );

  const handleAddPet = useCallback(() => {
    const name = newPetName.trim();
    if (!name) return;
    const id = `pet_${Date.now()}`;
    const newPet = { id, name };
    const defaultColor = "#C8E6C9";

    globalPets.push(newPet);
    globalPetStates[id] = {
      removedImageUrl: null,
      cardColor: defaultColor,
    };
    globalPetsData[id] = {
      name,
      age: "-",
      breed: "-",
      species: "강아지",
      gender: "-",
      weight: "-",
      neutered: "-",
      dummyColor: defaultColor,
      photos: [],
    };

    setPets((prev) => [...prev, newPet]);
    setPetStates((prev) => ({
      ...prev,
      [id]: { removedImageUrl: null, cardColor: defaultColor },
    }));
    setActiveTab(id);
    setNewPetName("");
    setShowAddPetPopup(false);
  }, [newPetName]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-44 pt-24">
      <TopBar type="back" title="나의 펫 정보" />

      {/* Tabs */}
      <div className="fixed top-14 left-0 right-0 bg-[var(--bg-app)] border-b border-[var(--border)] px-4 z-30">
        <div className="flex items-center gap-2">
          {pets.map((pet) => (
            <button
              key={pet.id}
              onClick={() => {
                setActiveTab(pet.id);
                setCurrentStatus(
                  globalPetStatus[pet.id] ?? "집",
                );
                setShowColorPicker(false);
                setShowStatusDropdown(false);
              }}
              className={`px-4 py-3 text-[15px] font-bold border-b-2 transition-colors ${
                activeTab === pet.id
                  ? "border-[var(--primary)]"
                  : "border-transparent"
              }`}
              style={{
                color:
                  activeTab === pet.id
                    ? "var(--primary)"
                    : "var(--text-2)",
              }}
            >
              {pet.name}
            </button>
          ))}
          <button
            className="ml-auto p-2"
            onClick={() => {
              setShowAddPetPopup(true);
              setNewPetName("");
            }}
          >
            <Plus
              className="w-5 h-5"
              style={{ color: "var(--text-2)" }}
            />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4 pt-0 space-y-4">
        {/* ── Pet Profile Card ── */}
        <div style={{ marginTop: `${OVERFLOW}px` }}>
          <PetProfileCard
            cardColor={currentPetState.cardColor}
            status={currentStatus}
            imageUrl={currentPetState.removedImageUrl}
            isProcessing={isProcessing}
            petId={activeTab}
            speechPhrases={PET_INFO_SPEECH}
            overlays={
              <>
                {/* 색상 선택 버튼 */}
                <button
                  onClick={() => setShowColorPicker((v) => !v)}
                  style={{
                    position: "absolute",
                    top: `${OVERFLOW + 8}px`,
                    right: "8px",
                    width: "22px",
                    height: "22px",
                    borderRadius: "9999px",
                    border: "2px solid white",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    background: currentPetState.cardColor,
                    filter: "brightness(0.8)",
                    cursor: "pointer",
                    zIndex: 10,
                  }}
                />

                {/* 색상 선택 패널 */}
                {showColorPicker && (
                  <div
                    style={{
                      position: "absolute",
                      top: `${OVERFLOW}px`,
                      right: 0,
                      background: "white",
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                      padding: "16px",
                      zIndex: 30,
                      width: "208px",
                    }}
                  >
                    <p style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "12px", color: "var(--text-2)" }}>
                      카드 색상 선택
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "12px" }}>
                      {[
                        "#BBDEFB","#90CAF9","#F8BBD0","#F48FB1","#C8E6C9",
                        "#81C784","#FFF9C4","#FFE082","#E1BEE7","#CE93D8",
                        "#FFCCBC","#FFAB91","#B2EBF2","#80DEEA","#D7CCC8",
                        "#BCAAA4","#FFFFFF","#F5F5F5","#EEEEEE","#E0E0E0",
                      ].map((c) => (
                        <button
                          key={c}
                          onClick={() => handleColorChange(c)}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "9999px",
                            background: c,
                            cursor: "pointer",
                            border: currentPetState.cardColor === c ? "2px solid var(--primary)" : "2px solid #ddd",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="color"
                        value={currentPetState.cardColor}
                        onChange={(e) =>
                          setPetStates((prev) => ({
                            ...prev,
                            [activeTab]: { ...prev[activeTab], cardColor: e.target.value },
                          }))
                        }
                        style={{ width: "32px", height: "32px", borderRadius: "4px", cursor: "pointer", border: "1px solid var(--border)" }}
                      />
                      <span style={{ fontSize: "12px", color: "var(--text-2)" }}>직접 선택</span>
                    </div>
                  </div>
                )}

                {/* 카메라 버튼 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  style={{
                    position: "absolute",
                    bottom: "8px",
                    left: "8px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "9999px",
                    background: "white",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 20,
                    cursor: "pointer",
                    opacity: isProcessing ? 0.4 : 1,
                  }}
                >
                  <Camera style={{ width: "14px", height: "14px", color: "var(--primary)" }} />
                </button>

                {/* 파일 입력 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }}
                />
              </>
            }
          >
            {/* 이름 + 나이 */}
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "white",
                marginBottom: "6px",
                textShadow: "0 1px 3px rgba(0,0,0,0.2)",
                marginLeft: "8px",
              }}
            >
              {currentPet.name}, {currentPet.age}
            </h2>

            {/* 상태 드롭다운 + 관리자 역할 뱃지 */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "8px" }}>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.9)" }}>현재:</span>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "white",
                    minWidth: "64px",
                    border: "none",
                    cursor: "pointer",
                    background: statusOptions.find((s) => s.label === currentStatus)?.color || "#4CAF50",
                  }}
                >
                  {currentStatus}
                  <ChevronDown style={{ width: "12px", height: "12px" }} />
                </button>
                {showStatusDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      marginTop: "4px",
                      left: 0,
                      background: "white",
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                      overflow: "hidden",
                      zIndex: 20,
                      minWidth: "100px",
                    }}
                  >
                    <div style={{ padding: "8px" }}>
                      {statusOptions.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentStatus(option.label);
                            globalPetStatus[activeTab] = option.label;
                            setShowStatusDropdown(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            textAlign: "left",
                            fontSize: "13px",
                            fontWeight: "500",
                            borderRadius: "8px",
                            marginBottom: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: option.color,
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                          }}
                        >
                          {option.label}
                          {currentStatus === option.label && (
                            <span style={{ fontSize: "11px" }}>✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowGuardianPopup(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.25)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600, color: "white" }}>{myRole}</span>
                <ChevronRight style={{ width: "10px", height: "10px", color: "white" }} />
              </button>
            </div>
          </PetProfileCard>
        </div>

        {/* Basic Info */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-[16px] font-bold"
              style={{ color: "var(--text-1)" }}
            >
              기본 정보
            </h3>
            <button
              onClick={() => navigate(`/pet/${activeTab}/edit`)}
              className="text-[13px] flex items-center gap-1"
              style={{ color: "var(--text-2)" }}
            >
              수정하기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            {[
              { label: "종류", value: currentPet.species },
              { label: "품종", value: currentPet.breed },
              { label: "성별", value: currentPet.gender },
              { label: "몸무게", value: currentPet.weight },
              { label: "중성화", value: currentPet.neutered },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "var(--bg-app)",
                  borderRadius: "var(--r-12)",
                  padding: "6px 12px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--text-3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--border)",
                  }}
                >
                  ·
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "var(--fw-medium)",
                    color: "var(--text-1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Health Management */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-[16px] font-bold flex items-baseline gap-1.5"
              style={{ color: "var(--text-1)" }}
            >
              나의 펫 관리
              <span
                className="text-[11px] font-normal"
                style={{ color: "var(--text-3)" }}
              >
                (미완료 3개 항목)
              </span>
            </h3>
            <button
              onClick={() =>
                navigate(`/pet/${activeTab}/health`)
              }
              className="text-[13px] flex items-center gap-1"
              style={{ color: "var(--text-2)" }}
            >
              더보기
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {currentHealthTasks.map((task) => {
              const cat = CATEGORY_INFO[task.category];
              const Icon = TASK_CATEGORY_ICON[cat.iconName] ?? Calendar;
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-[14px] bg-[var(--bg-app)]"
                >
                  {/* 체크박스 */}
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      task.completed
                        ? "bg-[var(--primary)] border-[var(--primary)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    {task.completed && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    )}
                  </button>
                  {/* 카테고리 아이콘 (단색) */}
                  <Icon
                    size={16}
                    color={cat.color}
                    strokeWidth={1.6}
                    style={{ flexShrink: 0 }}
                  />
                  {/* 시간 라벨 (13px) */}
                  <span
                    className="text-[13px] flex-shrink-0"
                    style={{ color: "var(--text-3)", fontWeight: 400 }}
                  >
                    {task.time}
                  </span>
                  {/* 제목 (14px, 얇게) */}
                  <span
                    className={`text-[14px] flex-1 truncate ${task.completed ? "line-through" : ""}`}
                    style={{
                      color: task.completed
                        ? "var(--text-3)"
                        : "var(--text-1)",
                      fontWeight: 400,
                    }}
                  >
                    {task.title}
                  </span>
                  {/* 미완료/완료 라벨 (얇게) */}
                  <span
                    className="text-[12px] flex-shrink-0"
                    style={{
                      color: task.completed ? "#58B947" : "#F45C98",
                      fontWeight: 400,
                    }}
                  >
                    {task.completed ? "완료" : "미완료"}
                  </span>
                </div>
              );
            })}
            {currentHealthTasks.length === 0 && (
              <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-3)", padding: "12px 0" }}>
                예정된 할 일이 없어요 🎉
              </p>
            )}
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-[16px] font-bold"
              style={{ color: "var(--text-1)" }}
            >
              사진 앨범
            </h3>
            <button
              onClick={() =>
                navigate(
                  `/pet/${activeTab}/gallery?name=${currentPet.name}`,
                )
              }
              className="text-[13px] flex items-center gap-1"
              style={{ color: "var(--text-2)" }}
            >
              더보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {currentPet.photos.slice(0, 6).map((photo, idx) => (
              <div key={idx} className="relative aspect-square">
                <ImageWithFallback
                  src={photo}
                  alt={`Pet photo ${idx + 1}`}
                  className="w-full h-full object-cover rounded-[12px]"
                />
              </div>
            ))}
          </div>
        </div>
        {/* BNB 케어 일지 */}
        <CareLogCard isActive={true} />
      </div>

{/* Fixed Bottom Buttons */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px",
          background: "linear-gradient(180deg, rgba(247,249,251,0) 0%, #F7F9FB 40%)",
          zIndex: 40,
        }}
      >
        <div className="space-y-3">
          {/* 흰색 카드 하나로 통합 */}
          <div
            className="card hover:shadow-lg transition-shadow"
            style={{ borderRadius: "var(--r-16)", padding: "0", overflow: "hidden", height: "48px", display: "flex" }}
          >
            <button
              onClick={() => navigate(`/pet/${activeTab}/co-guardian`)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}
            >
              <Users className="h-5" style={{ color: "var(--primary)", width: "20px" }} />
              <div className="font-bold" style={{ color: "var(--text-1)", fontSize: "var(--fs-button)" }}>
                공동관리
              </div>
            </button>
            
            <button
              onClick={() => setShowLocationPopup(true)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}
            >
              <MapPin
                className="h-5"
                style={{ color: "var(--primary)", width: "20px" }}
              />
              <div
                className="font-bold"
                style={{ color: "var(--text-1)", fontSize: "var(--fs-button)" }}
              >
                펫 위치
              </div>
            </button>
            <button
              onClick={() => navigate(`/pet/${activeTab}/lost-report`)}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}
            >
              <Phone
                className="h-5"
                style={{ color: "var(--pink)", width: "20px" }}
              />
              <div
                className="font-bold"
                style={{ color: "var(--text-1)", fontSize: "var(--fs-button)" }}
              >
                실종신고
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 펫 추가 팝업 */}
      {showAddPetPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 w-full max-w-sm">
            <h3
              className="text-[18px] font-bold mb-4"
              style={{ color: "var(--text-1)" }}
            >
              새 펫 추가
            </h3>
            <p
              className="text-[13px] mb-2"
              style={{ color: "var(--text-2)" }}
            >
              펫 이름을 입력해 주세요
            </p>
            <input
              type="text"
              value={newPetName}
              onChange={(e) => setNewPetName(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleAddPet()
              }
              placeholder="예: 코코"
              autoFocus
              className="w-full border rounded-[12px] px-4 py-3 text-[15px] mb-4 outline-none"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-1)",
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowAddPetPopup(false);
                  setNewPetName("");
                }}
                className="py-3 rounded-[12px] text-[15px] font-bold"
                style={{
                  background: "var(--bg-app)",
                  color: "var(--text-2)",
                }}
              >
                취소
              </button>
              <button
                onClick={handleAddPet}
                disabled={!newPetName.trim()}
                className="py-3 rounded-[12px] text-[15px] font-bold text-white"
                style={{
                  background: newPetName.trim()
                    ? "var(--primary)"
                    : "#ccc",
                }}
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 관리자 목록 팝업 */}
      {showGuardianPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full relative">
            <button onClick={() => setShowGuardianPopup(false)} className="absolute top-4 right-4 p-1">
              <X className="w-6 h-6 text-black" />
            </button>
            <h3 className="text-[16px] font-bold mb-4" style={{ color: "var(--text-1)" }}>관리자 목록</h3>
            <div className="space-y-3">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "var(--bg-app)", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users size={16} color="var(--primary)" />
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>나 (주관리자)</div>
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: "52px", height: "22px", fontSize: "10px", fontWeight: 700, borderRadius: "9999px",
                  background: "#EBF5FF", color: "var(--primary)", marginLeft: "auto", flexShrink: 0,
                }}>주관리자</span>
              </div>
              {guardianList.map((g, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "var(--bg-app)", borderRadius: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {g.role === "부관리자" ? <Users size={16} color="var(--primary)" /> : <Home size={16} color="#F45C98" />}
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{g.name}</div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: "52px", height: "22px", fontSize: "10px", fontWeight: 700, borderRadius: "9999px",
                    background: g.role === "부관리자" ? "#EBF5FF" : "#FFF0F5",
                    color: g.role === "부관리자" ? "var(--primary)" : "#F45C98",
                    marginLeft: "auto", flexShrink: 0,
                  }}>{g.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Location Popup */}
      {showLocationPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[20px] p-6 max-w-sm w-full relative">
            <button
              onClick={() => setShowLocationPopup(false)}
              className="absolute top-4 right-4 p-1"
            >
              <X className="w-6 h-6 text-black" />
            </button>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <h4 className="text-[14px] font-bold mb-3 text-black">
                  갤럭시폰 사용자
                </h4>
                <button
                  className="w-full rounded-full py-3 px-4 text-white text-[13px] font-bold"
                  style={{ background: "#00A5FF" }}
                >
                  Find
                  <br />
                  앱으로 이동
                </button>
              </div>
              <div className="text-center">
                <h4 className="text-[14px] font-bold mb-3 text-black">
                  아이폰 사용자
                </h4>
                <button
                  className="w-full rounded-full py-3 px-4 text-white text-[13px] font-bold"
                  style={{ background: "#00A5FF" }}
                >
                  Find My
                  <br />
                  앱으로 이동
                </button>
              </div>
            </div>
            <div className="space-y-2 text-[12px] leading-relaxed text-black">
              <p>
                각 기기의 위치 정보는 보안과 개인정보 보호를
                위해 공식 앱에서만 확인할 수 있도록 제한되어
                있습니다.
              </p>
              <p className="font-bold">
                대신 원활한 위치 확인을 위해 공식 앱으로
                이동하도록 안내드립니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}