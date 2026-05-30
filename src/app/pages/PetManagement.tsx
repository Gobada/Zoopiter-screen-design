import { TopBar } from "../components/TopBar";
import {
  Plus, X, ChevronLeft, ChevronRight, Check,
  Calendar, Heart, Scissors, Weight,
  Footprints, Syringe, UtensilsCrossed,
  Pill, ShoppingBag, Pencil, Trash2,
  Stethoscope, ClipboardCheck, HeartPulse,
  Package, Gamepad2, ListChecks,
} from "lucide-react";
import { useParams } from "react-router";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  getPetCareData, setPetCareData, getTodayTasks, getUpcomingSchedules,
  getTasksForDate, getOccurrencesInMonth,
  toggleTask, daysUntil, CATEGORY_INFO, SCHEDULE_CATEGORY_OPTIONS,
  type Task, type ScheduleCategory, type RepeatType,
  type WeightRecord, type WalkRecord, type MedRecord,
  type HospitalRecord, type GroomingRecord, type SupplyItem,
} from "../pages/petCareStore";
import { globalPetsData } from "../pages/PetInfo";

// ─── 카테고리 아이콘 (선으로 이루어진 단순 단색 아이콘) ────────────────────
const CATEGORY_ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }>> = {
  ListChecks, UtensilsCrossed, Pill, Footprints, Gamepad2,
  Scissors, Stethoscope, Package, Syringe, ClipboardCheck,
  HeartPulse, Calendar,
};

function CategoryIcon({ category, size = 16 }: { category: keyof typeof CATEGORY_INFO; size?: number }) {
  const info = CATEGORY_INFO[category];
  const Icon = CATEGORY_ICON_MAP[info.iconName] ?? Calendar;
  return <Icon size={size} color={info.color} strokeWidth={1.6} />;
}

// ─── 공통 유틸 ───────────────────────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10); }
function formatDate(d: string) {
  const dt = new Date(d);
  return `${dt.getMonth() + 1}/${dt.getDate()}`;
}
function formatDateFull(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "12px",
  border: "1px solid var(--border)", fontSize: "14px",
  color: "var(--text-1)", background: "var(--bg-app)", outline: "none",
  fontFamily: "inherit",
};

// ─── 커스텀 드롭다운 (PetInfoEdit와 동일 스타일) ─────────────────────────
function CustomDropdown({
  value, options, placeholder, onChange, leftIcon,
}: {
  value: string;
  options: { label: string; value: string; icon?: React.ReactNode }[];
  placeholder?: string;
  onChange: (val: string) => void;
  leftIcon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "12px 14px",
          background: "var(--bg-app)", borderRadius: "12px",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: "14px", fontWeight: 400,
          color: !selected ? "var(--text-3)" : "var(--text-1)",
          outline: "none", cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, textAlign: "left" }}>
          {selected?.icon ?? leftIcon}
          <span>{selected ? selected.label : (placeholder ?? "선택")}</span>
        </span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease", flexShrink: 0,
          }}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute", left: 0, right: 0,
            top: "calc(100% + 4px)", zIndex: 50,
            background: "white", borderRadius: "12px",
            border: "1px solid var(--border)",
            maxHeight: "240px", overflowY: "auto",
            boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => { onChange(option.value); setOpen(false); }}
              style={{
                padding: "12px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                fontSize: "14px", fontWeight: 400,
                color: value === option.value ? "var(--primary)" : "var(--text-1)",
                background: value === option.value ? "var(--primary-soft)" : "white",
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) (e.currentTarget as HTMLElement).style.background = "var(--bg-app)";
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) (e.currentTarget as HTMLElement).style.background = "white";
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {option.icon}
                <span>{option.label}</span>
              </span>
              {value === option.value && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8L6.5 11.5L13 5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 확인 팝업 (삭제 등) ─────────────────────────────────────────────────
function ConfirmDialog({ title, message, onCancel, onConfirm, confirmLabel = "삭제" }: {
  title?: string; message: string; onCancel: () => void; onConfirm: () => void; confirmLabel?: string;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: "16px",
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: "var(--r-16)",
        padding: "24px 20px", width: "100%", maxWidth: "320px",
        textAlign: "center",
      }}>
        {title && (
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "8px" }}>{title}</div>
        )}
        <div style={{ fontSize: "14px", color: "var(--text-2)", marginBottom: "20px", lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button onClick={onCancel} style={{
            padding: "12px", borderRadius: "12px", border: "none",
            background: "var(--bg-app)", color: "var(--text-2)",
            fontSize: "14px", fontWeight: 700, cursor: "pointer",
          }}>취소</button>
          <button onClick={onConfirm} style={{
            padding: "12px", borderRadius: "12px", border: "none",
            background: "#F45C98", color: "white",
            fontSize: "14px", fontWeight: 700, cursor: "pointer",
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── 일정 상세 팝업 ───────────────────────────────────────────────────────
function TaskDetailPopup({ task, onClose, onDelete, onToggle }: {
  task: Task; onClose: () => void;
  onDelete: () => void; onToggle: () => void;
}) {
  const c = CATEGORY_INFO[task.category];
  const repeatLabel: Record<RepeatType, string> = {
    none: "반복 없음", daily: "매일", weekly: "매주", monthly: "매월", yearly: "매년",
  };
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 150, padding: "16px",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: "var(--r-16)",
        padding: "20px", width: "100%", maxWidth: "360px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              background: c.bg, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <CategoryIcon category={task.category} size={20} />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)" }}>{task.title}</div>
              <div style={{ fontSize: "12px", color: c.color, fontWeight: 600 }}>{c.label}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: "4px" }}>
            <X style={{ width: "20px", height: "20px", color: "var(--text-3)" }} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
          <DetailRow label="날짜" value={task.date} />
          {task.time && <DetailRow label="시간" value={task.time} />}
          <DetailRow label="반복" value={repeatLabel[task.repeat]} />
          <DetailRow label="상태" value={task.completed ? "완료" : "미완료"} valueColor={task.completed ? "#58B947" : "#F45C98"} />
          {task.memo && <DetailRow label="메모" value={task.memo} />}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <button onClick={onToggle} style={{
            padding: "12px", borderRadius: "12px", border: "none",
            background: task.completed ? "var(--bg-app)" : "var(--primary)",
            color: task.completed ? "var(--text-2)" : "white",
            fontSize: "14px", fontWeight: 700, cursor: "pointer",
          }}>
            {task.completed ? "미완료 표시" : "완료 표시"}
          </button>
          <button onClick={onDelete} style={{
            padding: "12px", borderRadius: "12px", border: "1px solid #F45C98",
            background: "white", color: "#F45C98",
            fontSize: "14px", fontWeight: 700, cursor: "pointer",
          }}>삭제</button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 12px", background: "var(--bg-app)", borderRadius: "10px" }}>
      <span style={{ fontSize: "13px", color: "var(--text-3)" }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 600, color: valueColor ?? "var(--text-1)", textAlign: "right", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{value}</span>
    </div>
  );
}

// ─── 달력 ────────────────────────────────────────────────────────────────────
function MiniCalendar({ tasks, selectedDate, onDateClick }: {
  tasks: Task[];
  selectedDate: string | null;
  onDateClick: (d: string) => void;
}) {
  const [view, setView] = useState(new Date());
  const year = view.getFullYear(), month = view.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayStr();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ds = (d: number) => `${year}-${pad(month + 1)}-${pad(d)}`;

  // 해당 달에 일정이 있는 날짜들 — 반복 일정도 모두 전개
  const scheduledDates = new Set<string>();
  for (const t of tasks) {
    for (const occ of getOccurrencesInMonth(t, year, month)) {
      scheduledDates.add(occ);
    }
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <button onClick={() => setView(new Date(year, month - 1))}
          style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", borderRadius: "8px" }}>
          <ChevronLeft style={{ width: "18px", height: "18px", color: "var(--text-2)" }} />
        </button>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)" }}>
          {year}년 {month + 1}월
        </span>
        <button onClick={() => setView(new Date(year, month + 1))}
          style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", borderRadius: "8px" }}>
          <ChevronRight style={{ width: "18px", height: "18px", color: "var(--text-2)" }} />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", textAlign: "center", marginBottom: "8px" }}>
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
          <span key={d} style={{
            fontSize: "12px", fontWeight: 700,
            color: i === 0 ? "#F45C98" : i === 6 ? "#10B0F0" : "var(--text-3)"
          }}>{d}</span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "3px" }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = ds(d);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const hasSch = scheduledDates.has(dateStr);
          const dow = (firstDay + d - 1) % 7;
          return (
            <button key={i} onClick={() => onDateClick(dateStr)} style={{
              width: "100%", aspectRatio: "1", display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "2px",
              borderRadius: "10px", border: isSelected ? "2px solid var(--primary)" : "none",
              cursor: "pointer",
              background: isToday ? "var(--primary)" : isSelected ? "var(--primary-soft)" : "transparent",
              color: isToday ? "white" : dow === 0 ? "#F45C98" : dow === 6 ? "#10B0F0" : "var(--text-1)",
              fontSize: "13px", fontWeight: isToday ? 700 : 400,
            }}>
              {d}
              {hasSch && (
                <div style={{
                  width: "4px", height: "4px", borderRadius: "50%",
                  background: isToday ? "rgba(255,255,255,0.7)" : "var(--primary)",
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── 체중 차트 ───────────────────────────────────────────────────────────────
function WeightChart({ data }: { data: WeightRecord[] }) {
  if (data.length < 2) return (
    <p style={{ color: "var(--text-3)", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
      기록이 2개 이상이면 그래프가 표시돼요
    </p>
  );
  const W = 320, H = 120, PAD = 32;
  const weights = data.map(d => d.weight);
  const min = Math.min(...weights) - 0.3;
  const max = Math.max(...weights) + 0.3;
  const x = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const y = (w: number) => H - PAD - ((w - min) / (max - min)) * (H - PAD * 2);
  const pathD = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.weight)}`).join(" ");
  const areaD = `${pathD} L ${x(data.length - 1)} ${H - PAD} L ${x(0)} ${H - PAD} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
      <defs>
        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B0F0" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10B0F0" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map(t => (
        <line key={t} x1={PAD} x2={W - PAD} y1={PAD + t * (H - PAD * 2)} y2={PAD + t * (H - PAD * 2)}
          stroke="var(--border)" strokeWidth="1" />
      ))}
      <path d={areaD} fill="url(#wg)" />
      <path d={pathD} fill="none" stroke="#10B0F0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(d.weight)} r="4" fill="white" stroke="#10B0F0" strokeWidth="2" />
          <text x={x(i)} y={y(d.weight) - 9} textAnchor="middle" fontSize="10" fill="var(--text-2)" fontWeight="600">{d.weight}</text>
          <text x={x(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--text-3)">
            {d.date.slice(5).replace("-", "/")}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ─── 섹션 헤더 ───────────────────────────────────────────────────────────────
function SectionHeader({ title, onAdd, addLabel = "추가" }: {
  title: string; onAdd?: () => void; addLabel?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
      <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)" }}>{title}</span>
      {onAdd && (
        <button onClick={onAdd} style={{
          display: "flex", alignItems: "center", gap: "4px",
          padding: "6px 12px", borderRadius: "20px", border: "none",
          background: "var(--primary-soft)", color: "var(--primary)",
          fontSize: "12px", fontWeight: 700, cursor: "pointer",
        }}>
          <Plus style={{ width: "12px", height: "12px" }} /> {addLabel}
        </button>
      )}
    </div>
  );
}

// ─── 모달 래퍼 ───────────────────────────────────────────────────────────────
function Modal({ title, onClose, onConfirm, confirmLabel = "저장", confirmDisabled = false, children }: {
  title: string; onClose: () => void; onConfirm: () => void;
  confirmLabel?: string; confirmDisabled?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: "24px 24px 0 0",
        padding: "24px 20px 36px", width: "100%", maxWidth: "480px",
        maxHeight: "85vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <span style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-1)" }}>{title}</span>
          <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer", padding: "4px" }}>
            <X style={{ width: "20px", height: "20px", color: "var(--text-3)" }} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {children}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "20px" }}>
          <button onClick={onClose} style={{
            padding: "14px", borderRadius: "14px", border: "none",
            background: "var(--bg-app)", color: "var(--text-2)", fontSize: "15px", fontWeight: 700, cursor: "pointer",
          }}>취소</button>
          <button onClick={onConfirm} disabled={confirmDisabled} style={{
            padding: "14px", borderRadius: "14px", border: "none",
            background: confirmDisabled ? "#ccc" : "var(--primary)",
            color: "white", fontSize: "15px", fontWeight: 700, cursor: confirmDisabled ? "default" : "pointer",
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─── 탭 버튼 ─────────────────────────────────────────────────────────────────
function TabBar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const tabs = [
    { id: "schedule", label: "일정", icon: Calendar },
    { id: "health", label: "건강", icon: Heart },
    { id: "care", label: "케어", icon: Scissors },
  ];
  return (
    <div style={{
      display: "flex", background: "var(--bg-app)",
      borderRadius: "16px", padding: "4px", marginBottom: "20px",
      border: "1px solid var(--border)",
    }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const active = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            padding: "10px 0", borderRadius: "12px", border: "none", cursor: "pointer",
            background: active ? "white" : "transparent",
            color: active ? "var(--primary)" : "var(--text-3)",
            fontSize: "13px", fontWeight: active ? 700 : 500,
            boxShadow: active ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease",
          }}>
            <Icon style={{ width: "15px", height: "15px" }} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── 메인 컴포넌트 ───────────────────────────────────────────────────────────
export default function PetManagement() {
  const { petId } = useParams<{ petId: string }>();
  const id = petId ?? "buddy";
  const petName = globalPetsData[id]?.name ?? "펫";

  const [tab, setTab] = useState<"schedule" | "health" | "care">("schedule");
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate(n => n + 1), []);

  const data = getPetCareData(id);

  // 선택된 날짜 (달력)
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 일정 상세 팝업 (오늘의 할 일/달력/다가오는 일정 클릭 시)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 삭제 확인 팝업
  const [confirmDelete, setConfirmDelete] = useState<
    | { type: "task"; id: number; title: string }
    | { type: "supply"; id: number; name: string }
    | { type: "grooming"; id: number }
    | { type: "hospital"; id: number }
    | { type: "med"; id: number; name: string }
    | null
  >(null);

  // ── 일정 탭 모달 ──
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    category: "daily", date: todayStr(), time: "09:00", repeat: "none",
  });

  // ── 건강 탭 모달 ──
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeight, setNewWeight] = useState({ date: todayStr(), weight: "" });

  const [showAddWalk, setShowAddWalk] = useState(false);
  const [newWalk, setNewWalk] = useState({ date: todayStr(), minutes: "", distance: "" });

  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", startDate: todayStr(), memo: "" });

  const [showAddHospital, setShowAddHospital] = useState(false);
  const [newHospital, setNewHospital] = useState({ date: todayStr(), hospital: "", diagnosis: "", cost: "", memo: "" });

  const [showEditFood, setShowEditFood] = useState(false);
  const [editFood, setEditFood] = useState<{
    brand: string; product: string; dailyAmount: string; memo?: string;
  }>({
    brand: data.food?.brand ?? "",
    product: data.food?.product ?? "",
    dailyAmount: data.food?.dailyAmount ?? "",
    memo: data.food?.memo ?? "",
  });

  // ── 케어 탭 모달 ──
  const [showAddGrooming, setShowAddGrooming] = useState(false);
  const [newGrooming, setNewGrooming] = useState<Partial<GroomingRecord>>({ type: "grooming", date: todayStr() });

  const [showAddSupply, setShowAddSupply] = useState(false);
  const [newSupply, setNewSupply] = useState({ name: "", brand: "", size: "", memo: "" });

  // ── 핸들러 ──────────────────────────────────────────────────────────────────
  const handleToggle = (taskId: number) => {
    toggleTask(id, taskId);
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, completed: !selectedTask.completed });
    }
    refresh();
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.date) return;
    const d = getPetCareData(id);
    const maxId = Math.max(0, ...d.tasks.map(t => t.id));
    d.tasks.push({
      id: maxId + 1,
      title: newTask.title!,
      time: newTask.time ?? "09:00",
      completed: false,
      category: newTask.category ?? "daily",
      date: newTask.date!,
      repeat: newTask.repeat ?? "none",
      repeatInterval: newTask.repeatInterval,
      memo: newTask.memo,
    });
    setPetCareData(id, d);
    setShowAddTask(false);
    setNewTask({ category: "daily", date: todayStr(), time: "09:00", repeat: "none" });
    refresh();
  };

  const handleDeleteTask = (taskId: number) => {
    const d = getPetCareData(id);
    d.tasks = d.tasks.filter(t => t.id !== taskId);
    setPetCareData(id, d);
    refresh();
  };

  const handleAddWeight = () => {
    if (!newWeight.date || !newWeight.weight) return;
    const d = getPetCareData(id);
    d.weights.push({ date: newWeight.date, weight: parseFloat(newWeight.weight) });
    d.weights.sort((a, b) => a.date.localeCompare(b.date));
    setPetCareData(id, d);
    setShowAddWeight(false);
    setNewWeight({ date: todayStr(), weight: "" });
    refresh();
  };

  const handleAddWalk = () => {
    if (!newWalk.date || !newWalk.minutes) return;
    const d = getPetCareData(id);
    d.walks.push({
      date: newWalk.date,
      minutes: parseInt(newWalk.minutes),
      distance: newWalk.distance ? parseFloat(newWalk.distance) : undefined,
    });
    d.walks.sort((a, b) => a.date.localeCompare(b.date));
    setPetCareData(id, d);
    setShowAddWalk(false);
    setNewWalk({ date: todayStr(), minutes: "", distance: "" });
    refresh();
  };

  const handleAddMed = () => {
    if (!newMed.name) return;
    const d = getPetCareData(id);
    const maxId = Math.max(0, ...d.meds.map(m => m.id));
    // 일정 탭에 자동 추가
    const taskMaxId = Math.max(0, ...d.tasks.map(t => t.id));
    const newTaskId = taskMaxId + 1;
    d.tasks.push({
      id: newTaskId, title: newMed.name, time: "09:00", completed: false,
      category: "medicine", date: newMed.startDate, repeat: "daily",
    });
    d.meds.push({ id: maxId + 1, name: newMed.name, startDate: newMed.startDate, memo: newMed.memo, taskId: newTaskId });
    setPetCareData(id, d);
    setShowAddMed(false);
    setNewMed({ name: "", startDate: todayStr(), memo: "" });
    refresh();
  };

  const handleAddHospital = () => {
    if (!newHospital.date || !newHospital.hospital || !newHospital.diagnosis) return;
    const d = getPetCareData(id);
    const maxId = Math.max(0, ...d.hospitals.map(h => h.id));
    d.hospitals.push({
      id: maxId + 1, date: newHospital.date, hospital: newHospital.hospital,
      diagnosis: newHospital.diagnosis,
      cost: newHospital.cost ? parseInt(newHospital.cost) : undefined,
      memo: newHospital.memo,
    });
    d.hospitals.sort((a, b) => b.date.localeCompare(a.date));
    setPetCareData(id, d);
    setShowAddHospital(false);
    setNewHospital({ date: todayStr(), hospital: "", diagnosis: "", cost: "", memo: "" });
    refresh();
  };

  const handleSaveFood = () => {
    const d = getPetCareData(id);
    d.food = { ...editFood };
    setPetCareData(id, d);
    setShowEditFood(false);
    refresh();
  };

  const handleAddGrooming = () => {
    if (!newGrooming.date) return;
    const d = getPetCareData(id);
    const maxId = Math.max(0, ...d.groomings.map(g => g.id));
    d.groomings.push({
      id: maxId + 1, type: newGrooming.type ?? "grooming",
      date: newGrooming.date, shop: newGrooming.shop,
      memo: newGrooming.memo, nextDate: newGrooming.nextDate,
    });
    d.groomings.sort((a, b) => b.date.localeCompare(a.date));
    setPetCareData(id, d);
    setShowAddGrooming(false);
    setNewGrooming({ type: "grooming", date: todayStr() });
    refresh();
  };

  const handleAddSupply = () => {
    if (!newSupply.name) return;
    const d = getPetCareData(id);
    const maxId = Math.max(0, ...d.supplies.map(s => s.id));
    d.supplies.push({ id: maxId + 1, name: newSupply.name, brand: newSupply.brand, size: newSupply.size, memo: newSupply.memo });
    setPetCareData(id, d);
    setShowAddSupply(false);
    setNewSupply({ name: "", brand: "", size: "", memo: "" });
    refresh();
  };

  const handleDeleteSupply = (supplyId: number) => {
    const d = getPetCareData(id);
    d.supplies = d.supplies.filter(s => s.id !== supplyId);
    setPetCareData(id, d);
    refresh();
  };

  const handleDeleteGrooming = (gid: number) => {
    const d = getPetCareData(id);
    d.groomings = d.groomings.filter(g => g.id !== gid);
    setPetCareData(id, d);
    refresh();
  };

  const handleDeleteHospital = (hid: number) => {
    const d = getPetCareData(id);
    d.hospitals = d.hospitals.filter(h => h.id !== hid);
    setPetCareData(id, d);
    refresh();
  };

  // ── 계산값 ──────────────────────────────────────────────────────────────────
  const todayTasks = getTodayTasks(id);
  const upcomingSchedules = getUpcomingSchedules(id, 3);

  // 선택된 날짜의 일정 (반복 일정 전개 포함)
  const selectedDateTasks = selectedDate ? getTasksForDate(id, selectedDate) : [];

  // 이번 주 산책
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0,0,0,0);
  const weekWalks = data.walks.filter(w => new Date(w.date) >= weekStart);
  const weekWalkMinutes = weekWalks.reduce((s, w) => s + w.minutes, 0);
  const weekWalkDays = new Set(weekWalks.map(w => w.date)).size;

  // 최근 체중
  const lastWeight = data.weights.length > 0 ? data.weights[data.weights.length - 1] : null;
  const prevWeight = data.weights.length > 1 ? data.weights[data.weights.length - 2] : null;
  const weightDiff = lastWeight && prevWeight ? (lastWeight.weight - prevWeight.weight) : null;

  // 다음 미용 / 발톱
  const lastGrooming = data.groomings.filter(g => g.type === "grooming").sort((a, b) => b.date.localeCompare(a.date))[0];
  const lastNail = data.groomings.filter(g => g.type === "nail").sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-app)", paddingBottom: "120px", paddingTop: "56px" }}>
      <TopBar type="back" title={`${petName} 관리`} />

      <div style={{ padding: "20px 16px 0" }}>
        <TabBar tab={tab} setTab={t => setTab(t as any)} />

        {/* ════════════════════════════════════════════════════════
            일정 탭
        ════════════════════════════════════════════════════════ */}
        {tab === "schedule" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* 오늘의 할 일 */}
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)" }}>오늘의 할 일</div>
                <button onClick={() => setShowAddTask(true)} style={{
                  display: "flex", alignItems: "center", gap: "4px",
                  padding: "6px 12px", borderRadius: "20px", border: "none",
                  background: "var(--primary-soft)", color: "var(--primary)",
                  fontSize: "12px", fontWeight: 700, cursor: "pointer",
                }}>
                  <Plus style={{ width: "12px", height: "12px" }} /> 추가
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "13px", padding: "16px 0" }}>
                  오늘 할 일이 없어요 🎉
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {todayTasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      style={{
                        display: "flex", alignItems: "center", gap: "12px",
                        padding: "14px 16px", borderRadius: "14px",
                        background: "var(--bg-app)", cursor: "pointer",
                      }}
                    >
                      {/* 체크박스 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggle(task.id); }}
                        style={{
                          width: "22px", height: "22px", borderRadius: "50%",
                          background: task.completed ? "var(--primary)" : "transparent",
                          border: task.completed ? "none" : "2px solid var(--border)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                        }}>
                        {task.completed && <Check style={{ width: "12px", height: "12px", color: "white" }} />}
                      </button>
                      {/* 카테고리 아이콘 */}
                      <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CategoryIcon category={task.category} size={16} />
                      </div>
                      {/* 시간 (13px) */}
                      <span style={{ fontSize: "13px", color: "var(--text-3)", flexShrink: 0, fontWeight: 400 }}>
                        오늘 {task.time ?? ""}
                      </span>
                      {/* 제목 (14px, 얇게) */}
                      <span style={{
                        flex: 1, fontSize: "14px", fontWeight: 400,
                        color: task.completed ? "var(--text-3)" : "var(--text-1)",
                        textDecoration: task.completed ? "line-through" : "none",
                        minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>{task.title}</span>
                      {/* 미완료/완료 라벨 (얇게) */}
                      <span style={{
                        fontSize: "13px", fontWeight: 400, flexShrink: 0,
                        color: task.completed ? "#58B947" : "#F45C98",
                      }}>
                        {task.completed ? "완료" : "미완료"}
                      </span>
                      {/* 삭제 버튼 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: "task", id: task.id, title: task.title }); }}
                        style={{
                          border: "none", background: "none", cursor: "pointer", padding: "2px",
                          color: "var(--text-3)", flexShrink: 0,
                        }}>
                        <X style={{ width: "14px", height: "14px" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 달력 */}
            <div className="card">
              <MiniCalendar
                tasks={data.tasks}
                selectedDate={selectedDate}
                onDateClick={d => setSelectedDate(prev => prev === d ? null : d)}
              />
              {selectedDate && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-2)" }}>
                      {formatDateFull(selectedDate)}
                    </span>
                    <button onClick={() => { setNewTask(p => ({ ...p, date: selectedDate })); setShowAddTask(true); }}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        padding: "6px 12px", borderRadius: "20px", border: "none",
                        background: "var(--primary-soft)", color: "var(--primary)",
                        fontSize: "12px", fontWeight: 700, cursor: "pointer",
                      }}>
                      <Plus style={{ width: "12px", height: "12px" }} /> 추가
                    </button>
                  </div>
                  {selectedDateTasks.length === 0 ? (
                    <p style={{ fontSize: "13px", color: "var(--text-3)", textAlign: "center", padding: "8px 0" }}>이 날 일정이 없어요</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {selectedDateTasks.map(t => {
                        const c = CATEGORY_INFO[t.category];
                        return (
                          <div
                            key={t.id}
                            onClick={() => setSelectedTask(t)}
                            style={{
                              display: "flex", alignItems: "center", gap: "8px",
                              padding: "8px 10px", borderRadius: "10px",
                              background: "var(--bg-app)", cursor: "pointer",
                            }}
                          >
                            <CategoryIcon category={t.category} size={14} />
                            <span style={{ flex: 1, fontSize: "13px", color: "var(--text-1)", fontWeight: 400 }}>{t.title}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: "task", id: t.id, title: t.title }); }}
                              style={{ border: "none", background: "none", cursor: "pointer", padding: "2px", flexShrink: 0 }}
                            >
                              <X style={{ width: "14px", height: "14px", color: "var(--text-3)" }} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 다가오는 일정 */}
            <div className="card">
              <SectionHeader title="다가오는 일정" onAdd={() => setShowAddTask(true)} />
              {upcomingSchedules.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "13px", padding: "16px 0" }}>
                  다가오는 일정이 없어요
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {upcomingSchedules.map(s => {
                    const days = daysUntil(s.date);
                    return (
                      <div
                        key={`${s.id}-${s.date}`}
                        onClick={() => setSelectedTask(s)}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px",
                          padding: "12px", borderRadius: "12px", background: "var(--bg-app)",
                          cursor: "pointer",
                        }}
                      >
                        {/* 체크박스 */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggle(s.id); }}
                          style={{
                            width: "20px", height: "20px", borderRadius: "50%",
                            background: s.completed ? "var(--primary)" : "transparent",
                            border: s.completed ? "none" : "2px solid var(--border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", flexShrink: 0, transition: "all 0.2s",
                          }}>
                          {s.completed && <Check style={{ width: "11px", height: "11px", color: "white" }} />}
                        </button>
                        {/* 카테고리 아이콘 (배경 없음) */}
                        <div style={{
                          width: "28px", display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          <CategoryIcon category={s.category} size={20} />
                        </div>
                        {/* 본문 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: "14px", fontWeight: 400,
                            color: s.completed ? "var(--text-3)" : "var(--text-1)",
                            textDecoration: s.completed ? "line-through" : "none",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>{s.title}</div>
                          <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>
                            {formatDateFull(s.date)}{s.memo ? ` · ${s.memo}` : ""}
                          </div>
                        </div>
                        {/* D-day + 완료/미완료 */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", flexShrink: 0 }}>
                          <span style={{
                            fontSize: "11px", fontWeight: 400,
                            color: s.completed ? "#58B947" : "#F45C98",
                          }}>
                            {s.completed ? "완료" : "미완료"}
                          </span>
                          {days === 0 ? (
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#F45C98", background: "#FDE8F0", padding: "3px 8px", borderRadius: "20px" }}>오늘!</span>
                          ) : days <= 7 ? (
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#F6B85F", background: "#FEF3E2", padding: "3px 8px", borderRadius: "20px" }}>D-{days}</span>
                          ) : (
                            <span style={{ fontSize: "12px", color: "var(--text-3)", background: "white", padding: "3px 8px", borderRadius: "20px", border: "1px solid var(--border)" }}>D-{days}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete({ type: "task", id: s.id, title: s.title }); }}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", padding: "2px", flexShrink: 0 }}>
                          <X style={{ width: "14px", height: "14px" }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            건강 탭
        ════════════════════════════════════════════════════════ */}
        {tab === "health" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* 체중 */}
            <div className="card">
              <SectionHeader title="체중" onAdd={() => setShowAddWeight(true)} addLabel="기록" />
              {lastWeight && (
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "28px", fontWeight: 800, color: "var(--text-1)" }}>{lastWeight.weight}</span>
                    <span style={{ fontSize: "16px", color: "var(--text-2)", marginLeft: "4px" }}>kg</span>
                  </div>
                  {weightDiff !== null && (
                    <div style={{
                      padding: "6px 12px", borderRadius: "20px",
                      background: weightDiff > 0 ? "#FEF3E2" : weightDiff < 0 ? "#EBF7E9" : "var(--bg-app)",
                      color: weightDiff > 0 ? "#F6B85F" : weightDiff < 0 ? "#58B947" : "var(--text-3)",
                      fontSize: "13px", fontWeight: 700,
                    }}>
                      {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)}kg
                    </div>
                  )}
                </div>
              )}
              <WeightChart data={data.weights} />
            </div>

            {/* 산책 */}
            <div className="card">
              <SectionHeader title="산책" onAdd={() => setShowAddWalk(true)} addLabel="기록" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                {[
                  { label: "이번 주 총 시간", value: `${weekWalkMinutes}분`, icon: "⏱" },
                  { label: "이번 주 산책일", value: `${weekWalkDays}일`, icon: "🐾" },
                ].map(item => (
                  <div key={item.label} style={{ background: "var(--bg-app)", borderRadius: "12px", padding: "12px" }}>
                    <div style={{ fontSize: "18px", marginBottom: "4px" }}>{item.icon}</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-1)" }}>{item.value}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>{item.label}</div>
                  </div>
                ))}
              </div>
              {data.walks.slice(-5).reverse().map((w, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: i === 0 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-2)" }}>{formatDateFull(w.date)}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)" }}>{w.minutes}분</span>
                    {w.distance && <span style={{ fontSize: "13px", color: "var(--text-3)" }}>{w.distance}km</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* 약 복용 */}
            <div className="card">
              <SectionHeader title="약 복용" onAdd={() => setShowAddMed(true)} />
              <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "10px" }}>
                추가하면 일정 탭 체크리스트에도 자동 등록돼요
              </p>
              {data.meds.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "13px", padding: "12px 0" }}>
                  복용 중인 약이 없어요
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {data.meds.map(m => {
                    // 연동된 task의 완료 여부 확인
                    const linkedTask = m.taskId ? data.tasks.find(t => t.id === m.taskId) : null;
                    const todayDone = linkedTask?.completed ?? false;
                    return (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "var(--bg-app)" }}>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "10px",
                          background: "#F3EAFE", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "16px", flexShrink: 0,
                        }}>💊</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{m.name}</div>
                          {m.memo && <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "1px" }}>{m.memo}</div>}
                        </div>
                        <div style={{
                          padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                          background: todayDone ? "#EBF7E9" : "#FDE8F0",
                          color: todayDone ? "#58B947" : "#F45C98",
                        }}>
                          {todayDone ? "오늘 완료" : "미완료"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 예방접종 & 병원 */}
            <div className="card">
              <SectionHeader title="병원 기록" onAdd={() => setShowAddHospital(true)} />
              {data.hospitals.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "13px", padding: "12px 0" }}>
                  병원 기록이 없어요
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {data.hospitals.map(h => (
                    <div key={h.id} style={{ padding: "12px", borderRadius: "12px", background: "var(--bg-app)", position: "relative" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                            <span style={{ fontSize: "13px", color: "var(--text-3)" }}>{formatDateFull(h.date)}</span>
                            {h.cost && <span style={{ fontSize: "11px", color: "#F45C98", background: "#FDE8F0", padding: "2px 8px", borderRadius: "20px" }}>{h.cost.toLocaleString()}원</span>}
                          </div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{h.hospital}</div>
                          <div style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "2px" }}>{h.diagnosis}</div>
                          {h.memo && <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>{h.memo}</div>}
                        </div>
                        <button onClick={() => setConfirmDelete({ type: "hospital", id: h.id })} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", padding: "2px", flexShrink: 0 }}>
                          <X style={{ width: "14px", height: "14px" }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 사료 정보 */}
            <div className="card">
              <SectionHeader
                title="사료"
                onAdd={() => {
                  setEditFood({
                    brand: data.food?.brand ?? "",
                    product: data.food?.product ?? "",
                    dailyAmount: data.food?.dailyAmount ?? "",
                    memo: data.food?.memo ?? "",
                  });
                  setShowEditFood(true);
                }}
                addLabel="수정"
              />
              {data.food?.brand ? (
                <div style={{ background: "var(--bg-app)", borderRadius: "12px", padding: "14px" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ fontSize: "28px" }}>🍽</div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-1)" }}>{data.food.brand} {data.food.product}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-2)", marginTop: "2px" }}>{data.food.dailyAmount}</div>
                      {data.food.memo && <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>{data.food.memo}</div>}
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "13px", padding: "12px 0" }}>사료 정보를 입력해주세요</p>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            케어 탭
        ════════════════════════════════════════════════════════ */}
        {tab === "care" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* 미용 & 발톱 */}
            <div className="card">
              <SectionHeader title="미용 & 발톱" onAdd={() => setShowAddGrooming(true)} />

              {/* 요약 카드 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                {[
                  { label: "마지막 미용", value: lastGrooming ? formatDate(lastGrooming.date) : "-", next: lastGrooming?.nextDate, emoji: "✂️", color: "#F6B85F", bg: "#FEF3E2" },
                  { label: "마지막 발톱", value: lastNail ? formatDate(lastNail.date) : "-", emoji: "🐾", color: "#BE84F5", bg: "#F3EAFE" },
                ].map(item => (
                  <div key={item.label} style={{ background: item.bg, borderRadius: "12px", padding: "12px" }}>
                    <div style={{ fontSize: "18px", marginBottom: "4px" }}>{item.emoji}</div>
                    <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-1)" }}>{item.value}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>{item.label}</div>
                    {item.next && (
                      <div style={{ fontSize: "11px", color: item.color, fontWeight: 700, marginTop: "4px" }}>
                        다음 {formatDate(item.next)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 기록 목록 */}
              {data.groomings.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {data.groomings.slice(0, 5).map(g => (
                    <div key={g.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "10px", background: "var(--bg-app)" }}>
                      <span style={{ fontSize: "14px" }}>{g.type === "grooming" ? "✂️" : "🐾"}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-1)" }}>
                          {g.type === "grooming" ? "미용" : "발톱"}
                          {g.shop ? ` · ${g.shop}` : ""}
                        </span>
                        {g.memo && <div style={{ fontSize: "12px", color: "var(--text-3)" }}>{g.memo}</div>}
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{formatDateFull(g.date)}</span>
                      <button onClick={() => setConfirmDelete({ type: "grooming", id: g.id })} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", padding: "2px" }}>
                        <X style={{ width: "13px", height: "13px" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 정기 구매 용품 */}
            <div className="card">
              <SectionHeader title="정기 구매 용품" onAdd={() => setShowAddSupply(true)} />
              <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "12px" }}>
                자주 구매하는 용품의 브랜드·사이즈를 기록해 두세요
              </p>
              {data.supplies.length === 0 ? (
                <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "13px", padding: "12px 0" }}>
                  용품을 추가해주세요
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {data.supplies.map(s => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "12px", background: "var(--bg-app)" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        background: "var(--primary-soft)", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "16px", flexShrink: 0,
                      }}>🛍</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-1)" }}>{s.name}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "1px" }}>
                          {[s.brand, (s as any).product ?? s.size].filter(Boolean).join(" · ")}
                        </div>
                        {s.memo && <div style={{ fontSize: "12px", color: "var(--text-3)" }}>{s.memo}</div>}
                      </div>
                      <button onClick={() => setConfirmDelete({ type: "supply", id: s.id, name: s.name })} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-3)", padding: "4px" }}>
                        <Trash2 style={{ width: "14px", height: "14px" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ════ 모달들 ════ */}

      {/* 일정 추가 */}
      {showAddTask && (
        <Modal title="일정 추가" onClose={() => setShowAddTask(false)} onConfirm={handleAddTask}
          confirmDisabled={!newTask.title || !newTask.date}>
          <input
            placeholder="일정 이름"
            value={newTask.title ?? ""}
            onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
            style={inputStyle}
          />
          <CustomDropdown
            value={newTask.category ?? "daily"}
            placeholder="구분 선택"
            onChange={(v) => setNewTask(p => ({ ...p, category: v as ScheduleCategory }))}
            options={SCHEDULE_CATEGORY_OPTIONS.map(k => ({
              value: k,
              label: CATEGORY_INFO[k].label,
              icon: <CategoryIcon category={k} size={16} />,
            }))}
          />
          <input type="date" value={newTask.date ?? ""} onChange={e => setNewTask(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
          <input type="time" value={newTask.time ?? "09:00"} onChange={e => setNewTask(p => ({ ...p, time: e.target.value }))} style={inputStyle} />
          <CustomDropdown
            value={newTask.repeat ?? "none"}
            onChange={(v) => setNewTask(p => ({ ...p, repeat: v as RepeatType }))}
            options={[
              { value: "none", label: "반복 없음" },
              { value: "daily", label: "매일" },
              { value: "weekly", label: "매주" },
              { value: "monthly", label: "매월" },
              { value: "yearly", label: "매년" },
            ]}
          />
          <input placeholder="메모 (선택)" value={newTask.memo ?? ""} onChange={e => setNewTask(p => ({ ...p, memo: e.target.value }))} style={inputStyle} />
        </Modal>
      )}

      {/* 체중 추가 */}
      {showAddWeight && (
        <Modal title="체중 기록" onClose={() => setShowAddWeight(false)} onConfirm={handleAddWeight}
          confirmDisabled={!newWeight.date || !newWeight.weight}>
          <input type="date" value={newWeight.date} onChange={e => setNewWeight(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="number" step="0.1" placeholder="체중" value={newWeight.weight}
              onChange={e => setNewWeight(p => ({ ...p, weight: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
            <span style={{ fontSize: "14px", color: "var(--text-2)", flexShrink: 0 }}>kg</span>
          </div>
        </Modal>
      )}

      {/* 산책 추가 */}
      {showAddWalk && (
        <Modal title="산책 기록" onClose={() => setShowAddWalk(false)} onConfirm={handleAddWalk}
          confirmDisabled={!newWalk.date || !newWalk.minutes}>
          <input type="date" value={newWalk.date} onChange={e => setNewWalk(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="number" placeholder="시간" value={newWalk.minutes}
              onChange={e => setNewWalk(p => ({ ...p, minutes: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
            <span style={{ fontSize: "14px", color: "var(--text-2)", flexShrink: 0 }}>분</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="number" step="0.1" placeholder="거리 (선택)" value={newWalk.distance}
              onChange={e => setNewWalk(p => ({ ...p, distance: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
            <span style={{ fontSize: "14px", color: "var(--text-2)", flexShrink: 0 }}>km</span>
          </div>
        </Modal>
      )}

      {/* 약 추가 */}
      {showAddMed && (
        <Modal title="약 추가" onClose={() => setShowAddMed(false)} onConfirm={handleAddMed} confirmDisabled={!newMed.name}>
          <input placeholder="약 이름" value={newMed.name} onChange={e => setNewMed(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <input type="date" value={newMed.startDate} onChange={e => setNewMed(p => ({ ...p, startDate: e.target.value }))} style={inputStyle} />
          <input placeholder="메모 (예: 매달 1일)" value={newMed.memo} onChange={e => setNewMed(p => ({ ...p, memo: e.target.value }))} style={inputStyle} />
        </Modal>
      )}

      {/* 병원 기록 추가 */}
      {showAddHospital && (
        <Modal title="병원 기록" onClose={() => setShowAddHospital(false)} onConfirm={handleAddHospital}
          confirmDisabled={!newHospital.date || !newHospital.hospital || !newHospital.diagnosis}>
          <input type="date" value={newHospital.date} onChange={e => setNewHospital(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
          <input placeholder="병원 이름" value={newHospital.hospital} onChange={e => setNewHospital(p => ({ ...p, hospital: e.target.value }))} style={inputStyle} />
          <input placeholder="진단/내용" value={newHospital.diagnosis} onChange={e => setNewHospital(p => ({ ...p, diagnosis: e.target.value }))} style={inputStyle} />
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input type="number" placeholder="비용 (선택)" value={newHospital.cost}
              onChange={e => setNewHospital(p => ({ ...p, cost: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
            <span style={{ fontSize: "14px", color: "var(--text-2)", flexShrink: 0 }}>원</span>
          </div>
          <input placeholder="메모 (선택)" value={newHospital.memo} onChange={e => setNewHospital(p => ({ ...p, memo: e.target.value }))} style={inputStyle} />
        </Modal>
      )}

      {/* 사료 수정 */}
      {showEditFood && (
        <Modal title="사료 정보" onClose={() => setShowEditFood(false)} onConfirm={handleSaveFood}>
          <input placeholder="브랜드" value={editFood.brand} onChange={e => setEditFood(p => ({ ...p, brand: e.target.value }))} style={inputStyle} />
          <input placeholder="제품명" value={editFood.product} onChange={e => setEditFood(p => ({ ...p, product: e.target.value }))} style={inputStyle} />
          <input placeholder="급여량 (예: 아침 40g / 저녁 40g)" value={editFood.dailyAmount} onChange={e => setEditFood(p => ({ ...p, dailyAmount: e.target.value }))} style={inputStyle} />
          <input placeholder="메모 (선택)" value={editFood.memo ?? ""} onChange={e => setEditFood(p => ({ ...p, memo: e.target.value }))} style={inputStyle} />
        </Modal>
      )}

      {/* 미용/발톱 추가 */}
      {showAddGrooming && (
        <Modal title="미용 / 발톱 기록" onClose={() => setShowAddGrooming(false)} onConfirm={handleAddGrooming} confirmDisabled={!newGrooming.date}>
          <CustomDropdown
            value={newGrooming.type ?? "grooming"}
            onChange={(v) => setNewGrooming(p => ({ ...p, type: v as "grooming" | "nail" }))}
            options={[
              { value: "grooming", label: "미용", icon: <Scissors size={16} color="#9C27B0" strokeWidth={1.6} /> },
              { value: "nail",     label: "발톱", icon: <Footprints size={16} color="#4CAF50" strokeWidth={1.6} /> },
            ]}
          />
          <input type="date" value={newGrooming.date ?? ""} onChange={e => setNewGrooming(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
          <input placeholder="미용샵 이름 (선택)" value={newGrooming.shop ?? ""} onChange={e => setNewGrooming(p => ({ ...p, shop: e.target.value }))} style={inputStyle} />
          <input type="date" value={newGrooming.nextDate ?? ""} onChange={e => setNewGrooming(p => ({ ...p, nextDate: e.target.value }))} placeholder="다음 예약일 (선택)" style={inputStyle} />
          <input placeholder="메모 (선택)" value={newGrooming.memo ?? ""} onChange={e => setNewGrooming(p => ({ ...p, memo: e.target.value }))} style={inputStyle} />
        </Modal>
      )}

      {/* 용품 추가 */}
      {showAddSupply && (
        <Modal title="용품 추가" onClose={() => setShowAddSupply(false)} onConfirm={handleAddSupply} confirmDisabled={!newSupply.name}>
          <input placeholder="용품 이름 (예: 사료, 패드, 샴푸)" value={newSupply.name} onChange={e => setNewSupply(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
          <input placeholder="브랜드 (선택)" value={newSupply.brand} onChange={e => setNewSupply(p => ({ ...p, brand: e.target.value }))} style={inputStyle} />
          <input placeholder="용량/사이즈 (선택)" value={newSupply.size} onChange={e => setNewSupply(p => ({ ...p, size: e.target.value }))} style={inputStyle} />
          <input placeholder="메모 (선택)" value={newSupply.memo} onChange={e => setNewSupply(p => ({ ...p, memo: e.target.value }))} style={inputStyle} />
        </Modal>
      )}

      {/* 일정 상세 팝업 */}
      {selectedTask && (
        <TaskDetailPopup
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onToggle={() => handleToggle(selectedTask.id)}
          onDelete={() => {
            setConfirmDelete({ type: "task", id: selectedTask.id, title: selectedTask.title });
            setSelectedTask(null);
          }}
        />
      )}

      {/* 삭제 확인 팝업 */}
      {confirmDelete && (
        <ConfirmDialog
          title="삭제할까요?"
          message={
            confirmDelete.type === "task" ? `"${confirmDelete.title}" 일정을 삭제할까요?` :
            confirmDelete.type === "supply" ? `"${confirmDelete.name}" 용품을 삭제할까요?` :
            confirmDelete.type === "med" ? `"${confirmDelete.name}" 약을 삭제할까요?` :
            confirmDelete.type === "hospital" ? "이 병원 기록을 삭제할까요?" :
            "이 기록을 삭제할까요?"
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === "task") handleDeleteTask(confirmDelete.id);
            else if (confirmDelete.type === "supply") handleDeleteSupply(confirmDelete.id);
            else if (confirmDelete.type === "grooming") handleDeleteGrooming(confirmDelete.id);
            else if (confirmDelete.type === "hospital") handleDeleteHospital(confirmDelete.id);
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}
