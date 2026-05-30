import { TopBar } from "../components/TopBar";
import { useNavigate, useParams } from "react-router";
import { useState } from "react";
import {
  Plus, Phone, Link2, QrCode, X, ChevronRight,
  Shield, Home, Check, Users, Trash2, Pencil,
} from "lucide-react";

const BNB_COLOR = "#F45C98";
const BNB_SOFT = "#FFF0F5";

type PermissionType = "co-guardian" | "bnb-carer";

interface Guardian {
  id: string;
  name: string;
  phone: string;
  type: PermissionType;
  permissions: {
    all: boolean;
    basicInfo: boolean;
    petManage: boolean;
    gallery: boolean;
    coManage: boolean;
    petLocation: boolean;
    lostReport: boolean;
    careLog: boolean;
    todayTask: boolean;
    walk: boolean;
  };
period: "permanent" | "date";
  startDate?: string;
  endDate?: string;
  status: "active" | "pending";
  needsApproval?: boolean;
}

const DEFAULT_CO_PERMS = {
  all: false, basicInfo: false, petManage: false,
  gallery: false, coManage: false, petLocation: false, lostReport: false,
  careLog: false, todayTask: false, walk: false,
};

const DUMMY_GUARDIANS: Guardian[] = [
  {
    id: "g1", name: "김지수", phone: "010-1234-5678", type: "co-guardian",
    permissions: { ...DEFAULT_CO_PERMS, basicInfo: true, petManage: true, gallery: true },
    period: "permanent", status: "active",
  },
  {
    id: "g2", name: "이민준", phone: "010-9876-5432", type: "bnb-carer",
    permissions: { ...DEFAULT_CO_PERMS, careLog: true, todayTask: true, walk: true },
    period: "date", startDate: "2025-06-01", endDate: "2025-06-10", status: "pending",
    needsApproval: true,
  },
];

const CO_PERM_ITEMS = [
  { key: "all",        label: "전체" },
  { key: "basicInfo",  label: "기본 정보 수정" },
  { key: "petManage",  label: "펫 관리" },
  { key: "gallery",    label: "사진 앨범" },
  { key: "coManage",   label: "공동관리" },
  { key: "lostReport", label: "실종신고" },
];

// 역할 뱃지 스타일 (고정 너비)
const ROLE_BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  "주관리자": { bg: "#EBF5FF", color: "var(--primary)" },
  "부관리자": { bg: "#EBF5FF", color: "var(--primary)" },
  "돌보미":   { bg: BNB_SOFT, color: BNB_COLOR },
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_BADGE_STYLE[role] ?? { bg: "var(--bg-app)", color: "var(--text-3)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: "52px", height: "22px",
      fontSize: "10px", fontWeight: 700, borderRadius: "9999px",
      background: style.bg, color: style.color,
      flexShrink: 0,
    }}>
      {role}
    </span>
  );
}

function Toggle({ active, onToggle, color = "var(--primary)" }: { active: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} style={{
      width: "44px", height: "24px", borderRadius: "9999px", border: "none", cursor: "pointer",
      background: active ? color : "#DDD", transition: "background 0.2s", position: "relative", flexShrink: 0,
    }}>
      <div style={{
        width: "18px", height: "18px", borderRadius: "9999px", background: "white",
        position: "absolute", top: "3px",
        left: active ? "23px" : "3px", transition: "left 0.2s",
      }} />
    </button>
  );
}

export default function CoGuardian() {
  const navigate = useNavigate();
  const { petId } = useParams();
  const [guardians, setGuardians] = useState<Guardian[]>(DUMMY_GUARDIANS);

  const [modal, setModal] = useState<null | "add-co" | "add-bnb">(null);
  const [inviteStep, setInviteStep] = useState<"method" | "search" | "permission">("method");
  const [inviteMethod, setInviteMethod] = useState<"search" | "link" | "qr" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<"permanent" | "date">("permanent");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [coPermissions, setCoPermissions] = useState({ ...DEFAULT_CO_PERMS });
  const [bnbPermissions, setBnbPermissions] = useState({ todayTask: false, walk: false });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<Guardian | null>(null);
  const [isSaveMode, setIsSaveMode] = useState(false);

  const closeModal = () => {
    setModal(null);
    setInviteStep("method");
    setInviteMethod(null);
    setSearchQuery("");
    setSelectedPeriod("permanent");
    setStartDate("");
    setEndDate("");
    setCoPermissions({ ...DEFAULT_CO_PERMS });
    setBnbPermissions({ todayTask: false, walk: false });
    setEditTarget(null);
    setIsSaveMode(false);
  };

  const handleDelete = (id: string) => {
    setGuardians(prev => prev.filter(g => g.id !== id));
    setDeleteTarget(null);
  };

  const handleEdit = (g: Guardian) => {
    setEditTarget(g);
    setIsSaveMode(true);
    if (g.type === "co-guardian") {
      setModal("add-co");
      setCoPermissions({ ...DEFAULT_CO_PERMS, ...g.permissions });
    } else {
      setModal("add-bnb");
      setBnbPermissions({ todayTask: g.permissions.todayTask, walk: g.permissions.walk });
    }
    setSelectedPeriod(g.period);
    setStartDate(g.startDate ?? "");
    setEndDate(g.endDate ?? "");
    setInviteStep("permission");
  };

  const handleConfirm = () => {
    if (isSaveMode && editTarget) {
      setGuardians(prev => prev.map(g => g.id === editTarget.id ? {
        ...g,
        permissions: modal === "add-co"
          ? { ...coPermissions, careLog: false, todayTask: false, walk: false }
          : { ...DEFAULT_CO_PERMS, careLog: true, ...bnbPermissions },
        period: selectedPeriod,
        endDate: selectedPeriod === "date" ? endDate : undefined,
      } : g));
    } else {
      setGuardians(prev => [...prev, {
        id: `g${Date.now()}`,
        name: searchQuery || "초대 대기 중",
        phone: "",
        type: modal === "add-co" ? "co-guardian" : "bnb-carer",
        permissions: modal === "add-co"
          ? { ...coPermissions, careLog: false, todayTask: false, walk: false }
          : { ...DEFAULT_CO_PERMS, careLog: true, ...bnbPermissions },
        period: selectedPeriod,
        endDate: selectedPeriod === "date" ? endDate : undefined,
        status: "pending",
      }]);
    }
    closeModal();
  };

  // 전체 토글 처리
  const handleCoPermToggle = (key: string) => {
    if (key === "all") {
      const newAll = !coPermissions.all;
      setCoPermissions({
        all: newAll,
        basicInfo: false, petManage: false, gallery: false,
        coManage: false, petLocation: false, lostReport: false,
        careLog: false, todayTask: false, walk: false,
      });
    } else {
      setCoPermissions(p => ({ ...p, all: false, [key]: !p[key as keyof typeof p] }));
    }
  };

  const coGuardians = guardians.filter(g => g.type === "co-guardian");
  const bnbCarers = guardians.filter(g => g.type === "bnb-carer");

  const PermBadge = ({ label, active }: { label: string; active: boolean }) => (
    <span style={{
      fontSize: "11px", padding: "2px 8px", borderRadius: "9999px",
      background: active ? "#EBF5FF" : "var(--bg-app)",
      color: active ? "var(--primary)" : "var(--text-3)",
      border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
    }}>
      {label}
    </span>
  );

const GuardianCard = ({ g }: { g: Guardian }) => (
    <div style={{ background: "var(--bg-app)", borderRadius: "14px", padding: "14px", marginBottom: "10px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "4px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{g.name}</span>
            <span style={{
              fontSize: "10px", padding: "1px 6px", borderRadius: "9999px",
              background: g.status === "active" ? "#E8F5E9" : "#FFF8E1",
              color: g.status === "active" ? "#2E7D32" : "#F57F17",
            }}>
              {g.status === "active" ? "활성" : "대기 중"}
            </span>
          </div>
          <span style={{ fontSize: "12px", color: "var(--text-3)", display: "block" }}>
            {g.period === "permanent" ? "기간 제한 없음" : `${g.startDate ?? ""} ~ ${g.endDate ?? ""}`}
          </span>
        </div>
        <div style={{ display: "flex", gap: "4px", flexShrink: 0, marginLeft: "8px" }}>
          {g.needsApproval && (
            <button
              onClick={() => setGuardians(prev => prev.map(item => item.id === g.id ? { ...item, status: "active", needsApproval: false } : item))}
              style={{
                padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: 700,
                background: "var(--primary)", color: "white", border: "none", cursor: "pointer",
              }}
            >승인</button>
          )}
          <button onClick={() => handleEdit(g)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer" }}>
            <Pencil size={15} color="var(--text-3)" />
          </button>
          <button onClick={() => setDeleteTarget(g.id)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer" }}>
            <Trash2 size={15} color="var(--text-3)" />
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {g.type === "co-guardian" ? (
          <>
            {g.permissions.all
              ? <PermBadge label="전체" active={true} />
              : <>
                  <PermBadge label="기본정보" active={g.permissions.basicInfo} />
                  <PermBadge label="펫관리" active={g.permissions.petManage} />
                  <PermBadge label="사진앨범" active={g.permissions.gallery} />
                  <PermBadge label="공동관리" active={g.permissions.coManage} />
                  <PermBadge label="실종신고" active={g.permissions.lostReport} />
                </>
            }
          </>
        ) : (
          <>
            <PermBadge label="케어일지" active={true} />
            <PermBadge label="오늘의 할일" active={g.permissions.todayTask} />
            <PermBadge label="산책" active={g.permissions.walk} />
          </>
        )}
      </div>
    </div>
  );

  const renderPermissionStep = () => (
    <>
      <button onClick={() => isSaveMode ? closeModal() : setInviteStep("search")}
        style={{ background: "none", border: "none", cursor: "pointer", marginBottom: "12px", color: "var(--text-2)", fontSize: "13px" }}>
        ← 뒤로
      </button>
      <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "4px" }}>권한 설정</h3>
      <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "16px" }}>부여할 권한과 기간을 설정하세요</p>

      {modal === "add-co" ? (
        <div style={{ marginBottom: "16px" }}>
          {CO_PERM_ITEMS.map(({ key, label }) => {
            const isAll = key === "all";
            const isActive = coPermissions[key as keyof typeof coPermissions] as boolean;
            const isDisabled = !isAll && coPermissions.all;
            return (
              <div key={key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0", borderBottom: "1px solid var(--border)",
                opacity: isDisabled ? 0.35 : 1,
              }}>
                <span style={{ fontSize: "14px", color: "var(--text-1)", fontWeight: isAll ? 700 : 400 }}>
                  {label}{isAll && " (전체 권한)"}
                </span>
                <Toggle active={isActive} onToggle={() => !isDisabled && handleCoPermToggle(key)} />
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ background: "#EBF5FF", borderRadius: "10px", padding: "10px 14px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Check size={14} color="var(--primary)" />
            <span style={{ fontSize: "13px", color: "var(--primary)", fontWeight: 600 }}>BNB 케어 일지 (기본 포함)</span>
          </div>
          {[
            { key: "todayTask", label: "오늘의 할일 체크" },
            { key: "walk", label: "산책" },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: "14px", color: "var(--text-1)" }}>{label}</span>
              <Toggle
                active={bnbPermissions[key as keyof typeof bnbPermissions]}
                onToggle={() => setBnbPermissions(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
              />
            </div>
          ))}
        </div>
      )}

      <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", marginBottom: "8px" }}>권한 기간</p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        {(["permanent", "date"] as const).map(p => (
          <button key={p} onClick={() => setSelectedPeriod(p)} style={{
            flex: 1, padding: "10px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
            border: `1.5px solid ${selectedPeriod === p ? "var(--primary)" : "var(--border)"}`,
            background: selectedPeriod === p ? "#EBF5FF" : "white",
            color: selectedPeriod === p ? "var(--primary)" : "var(--text-2)", cursor: "pointer",
          }}>
            {p === "permanent" ? "기간 제한 없음" : "기간 설정"}
          </button>
        ))}
      </div>
      {selectedPeriod === "date" && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>시작일</p>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{
              width: "100%", padding: "10px 12px", borderRadius: "10px",
              border: "1.5px solid var(--border)", fontSize: "13px",
              color: "var(--text-1)", boxSizing: "border-box",
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>종료일</p>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{
              width: "100%", padding: "10px 12px", borderRadius: "10px",
              border: "1.5px solid var(--border)", fontSize: "13px",
              color: "var(--text-1)", boxSizing: "border-box",
            }} />
          </div>
        </div>
      )}
      <button onClick={handleConfirm} style={{
        width: "100%", padding: "14px", borderRadius: "12px",
        background: "var(--primary)", border: "none", cursor: "pointer",
        fontSize: "15px", fontWeight: 700, color: "white",
      }}>
        {isSaveMode ? "저장하기" : "초대 보내기"}
      </button>
    </>
  );

  const renderModalContent = () => {
    if (inviteStep === "method") {
      return (
        <>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "16px" }}>
            {modal === "add-co" ? "공동 관리자 추가" : "BNB 돌봄 권한 부여"}
          </h3>
          <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "16px" }}>초대 방법을 선택하세요</p>
          {[
            { key: "search", icon: <Phone size={20} color="var(--primary)" />, label: "전화번호 / 닉네임 검색", desc: "초대 알림 발송 → 상대방 수락" },
            { key: "link",   icon: <Link2 size={20} color="var(--primary)" />, label: "링크 공유", desc: "링크로 신청 → 주 관리자 최종 승인" },
            { key: "qr",    icon: <QrCode size={20} color="var(--primary)" />, label: "QR 코드", desc: "QR 스캔 후 신청 → 주 관리자 최종 승인" },
          ].map(m => (
            <button key={m.key}
              onClick={() => { setInviteMethod(m.key as any); setInviteStep("search"); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: "12px",
                padding: "14px", borderRadius: "12px", marginBottom: "8px",
                background: "var(--bg-app)", border: "1.5px solid var(--border)",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                {m.icon}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{m.label}</div>
                <div style={{ fontSize: "12px", color: "var(--text-3)" }}>{m.desc}</div>
              </div>
              <ChevronRight size={16} color="var(--text-3)" style={{ marginLeft: "auto" }} />
            </button>
          ))}
        </>
      );
    }

    if (inviteStep === "search") {
      if (inviteMethod === "qr") {
        return (
          <>
            <button onClick={() => setInviteStep("method")} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: "12px", color: "var(--text-2)", fontSize: "13px" }}>← 뒤로</button>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "16px" }}>QR 코드 공유</h3>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0" }}>
              <div style={{ width: "160px", height: "160px", background: "#f0f0f0", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", border: "2px dashed var(--border)" }}>
                <QrCode size={80} color="var(--text-3)" />
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-2)", textAlign: "center", lineHeight: 1.6 }}>
                상대방이 QR 코드를 스캔하면<br />신청이 접수되고, 주 관리자가 최종 승인합니다.
              </p>
            </div>
            <button onClick={() => setInviteStep("permission")} style={{
              width: "100%", padding: "14px", borderRadius: "12px", background: "var(--primary)",
              border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 700, color: "white",
            }}>상세 권한 설정</button>
          </>
        );
      }
      if (inviteMethod === "link") {
        return (
          <>
            <button onClick={() => setInviteStep("method")} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: "12px", color: "var(--text-2)", fontSize: "13px" }}>← 뒤로</button>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "16px" }}>링크 공유</h3>
            <div style={{ background: "var(--bg-app)", borderRadius: "12px", padding: "14px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-3)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                https://petbnb.app/invite/abc123xyz
              </span>
              <button style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600, background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>복사</button>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "16px", lineHeight: 1.6 }}>
              링크를 통해 신청이 접수되면 주 관리자가 최종 승인합니다.
            </p>
            <button onClick={() => setInviteStep("permission")} style={{
              width: "100%", padding: "14px", borderRadius: "12px", background: "var(--primary)",
              border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 700, color: "white",
            }}>상세 권한 설정</button>
          </>
        );
      }
      return (
        <>
          <button onClick={() => setInviteStep("method")} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: "12px", color: "var(--text-2)", fontSize: "13px" }}>← 뒤로</button>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "16px" }}>전화번호 / 닉네임 검색</h3>
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="전화번호 또는 닉네임 입력"
            style={{
              width: "100%", padding: "12px 14px", borderRadius: "12px",
              border: "1.5px solid var(--border)", fontSize: "14px",
              color: "var(--text-1)", background: "white", boxSizing: "border-box", marginBottom: "12px",
            }}
          />
          {searchQuery.length > 1 && (
            <div style={{ background: "var(--bg-app)", borderRadius: "12px", padding: "12px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{searchQuery}</div>
                <div style={{ fontSize: "12px", color: "var(--text-3)" }}>검색 결과 (예시)</div>
                <button onClick={() => setInviteStep("permission")} style={{
                  marginLeft: "auto", fontSize: "12px", color: "white", background: "var(--primary)",
                  border: "none", borderRadius: "8px", padding: "4px 10px", cursor: "pointer",
                }}>선택</button>
              </div>
            </div>
          )}
          <button onClick={() => setInviteStep("permission")} disabled={!searchQuery.trim()} style={{
            width: "100%", padding: "14px", borderRadius: "12px", background: "var(--primary)",
            border: "none", cursor: "pointer", fontSize: "15px", fontWeight: 700, color: "white",
            opacity: searchQuery.trim() ? 1 : 0.4,
          }}>상세 권한 설정</button>
        </>
      );
    }

    if (inviteStep === "permission") return renderPermissionStep();
    return null;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-8 pt-14">
      <TopBar type="back" title="공동 관리 권한" />
      <div className="px-4 pt-4 space-y-4">

        {/* 공동 관리자 섹션 */}
        <div className="card p-4">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Users size={18} color="var(--primary)" />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)" }}>공동 관리자</span>
              <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{coGuardians.length}명</span>
            </div>
            <button onClick={() => { setModal("add-co"); setInviteStep("method"); setIsSaveMode(false); }}
              style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--primary)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>
              <Plus size={14} color="white" />
              <span style={{ fontSize: "12px", color: "white", fontWeight: 600 }}>추가</span>
            </button>
          </div>
          {coGuardians.length === 0
            ? <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-3)", padding: "16px 0" }}>등록된 공동 관리자가 없어요</p>
            : coGuardians.map(g => <GuardianCard key={g.id} g={g} />)}
        </div>

        {/* BNB 돌봄 관리자 섹션 */}
        <div className="card p-4">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Home size={18} color={BNB_COLOR} />
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)" }}>BNB 돌보미</span>
              <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{bnbCarers.length}명</span>
            </div>
            <button onClick={() => { setModal("add-bnb"); setInviteStep("method"); setIsSaveMode(false); }}
              style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--primary)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>
              <Plus size={14} color="white" />
              <span style={{ fontSize: "12px", color: "white", fontWeight: 600 }}>추가</span>
            </button>
          </div>
          {bnbCarers.length === 0
            ? <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-3)", padding: "16px 0" }}>등록된 돌봄 관리자가 없어요</p>
            : bnbCarers.map(g => <GuardianCard key={g.id} g={g} />)}
        </div>

        {/* 안내 */}
        <div style={{ background: "#FFF8E1", borderRadius: "12px", padding: "14px", display: "flex", gap: "10px" }}>
          <Shield size={16} color="#F57F17" style={{ flexShrink: 0, marginTop: "1px" }} />
          <div>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#F57F17", marginBottom: "4px" }}>권한 안내</p>
            <p style={{ fontSize: "12px", color: "#795548", lineHeight: 1.6 }}>
              공동 관리자는 주 관리자와 동일한 화면을 보되 설정된 항목만 수정할 수 있어요.<br />
              BNB 돌봄 관리자는 예약 기간 동안만 케어 일지 등 허용된 항목에 접근할 수 있어요.
            </p>
          </div>
        </div>
      </div>

      {/* 초대/편집 모달 */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "white", borderRadius: "20px 20px 0 0", padding: "24px", width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={22} color="var(--text-2)" />
              </button>
            </div>
            {renderModalContent()}
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "320px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "8px" }}>권한을 삭제할까요?</h3>
            <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "20px" }}>삭제하면 해당 관리자는 더 이상 펫 정보에 접근할 수 없어요.</p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "var(--bg-app)", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "var(--text-2)" }}>취소</button>
              <button onClick={() => handleDelete(deleteTarget)} style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "#FF5252", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "white" }}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}