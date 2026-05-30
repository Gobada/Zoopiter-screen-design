// Pet care task management store

// ─── 카테고리 타입 ─────────────────────────────────────────────────────────
// 일정/할일에 사용되는 모든 카테고리를 하나로 통합
// (기존 TaskCategory + ScheduleCategory 합집합)
export type TaskCategory =
  | "food" | "medicine" | "walk" | "play"
  | "groom" | "vet" | "hospital" | "supply"
  | "vaccine" | "checkup" | "surgery" | "daily" | "other";

// HealthManagement 모달에서 사용 (사용자가 새 일정 만들 때 고를 카테고리 셋)
export type ScheduleCategory = TaskCategory;

export type RepeatType = "none" | "daily" | "weekly" | "monthly" | "yearly";

// ─── 데이터 인터페이스 ─────────────────────────────────────────────────────
export interface Task {
  id: number;
  title: string;
  category: TaskCategory;
  date: string;
  time?: string;
  completed: boolean;
  repeat: RepeatType;
  repeatInterval?: number;
  memo?: string;
}

export interface WeightRecord {
  date: string;
  weight: number;
}

export interface WalkRecord {
  date: string;
  minutes: number;
  distance?: number; // km
  memo?: string;
}

export interface MedRecord {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  dosage?: string;
  frequency?: string;
  memo?: string;
  taskId?: number; // 일정 탭 체크리스트와 연동
}

export interface HospitalRecord {
  id: number;
  date: string;
  hospital: string;
  diagnosis: string;
  type?: string;
  treatment?: string;
  cost?: number;
  memo?: string;
}

export interface GroomingRecord {
  id: number;
  date: string;
  type: "grooming" | "nail";
  shop?: string;
  cost?: number;
  nextDate?: string;
  memo?: string;
}

export interface SupplyItem {
  id: number;
  name: string;
  brand?: string;
  size?: string;
  category?: "food" | "snack" | "toy" | "medicine" | "other";
  stock?: number;
  unit?: string;
  lowStockAlert?: number;
  memo?: string;
}

export interface FoodInfo {
  brand: string;
  product: string;
  dailyAmount: string;
  memo?: string;
}

export interface PetCareData {
  tasks: Task[];
  weights: WeightRecord[];
  walks: WalkRecord[];
  meds: MedRecord[];
  hospitals: HospitalRecord[];
  groomings: GroomingRecord[];
  supplies: SupplyItem[];
  food: FoodInfo;
}

// ─── 카테고리 메타 ─────────────────────────────────────────────────────────
// iconName: lucide-react 컴포넌트 이름 (선으로 이루어진 단순 아이콘)
// 색상은 카테고리당 단색으로 통일 (color = bg를 위한 단색의 연한 버전)
export const CATEGORY_INFO: Record<TaskCategory, {
  emoji: string;
  label: string;
  color: string;
  bg: string;
  iconName: string;
}> = {
  daily:    { emoji: "📌", label: "일상",     color: "#78909C", bg: "#ECEFF1", iconName: "ListChecks" },
  food:     { emoji: "🍖", label: "식사",     color: "#F6B85F", bg: "#FFF3E0", iconName: "UtensilsCrossed" },
  medicine: { emoji: "💊", label: "약",       color: "#2196F3", bg: "#E3F2FD", iconName: "Pill" },
  walk:     { emoji: "🐾", label: "산책",     color: "#4CAF50", bg: "#E8F5E9", iconName: "Footprints" },
  play:     { emoji: "🎾", label: "놀이",     color: "#FF9800", bg: "#FFF3E0", iconName: "Gamepad2" },
  groom:    { emoji: "✂️", label: "미용",     color: "#9C27B0", bg: "#F3E5F5", iconName: "Scissors" },
  vet:      { emoji: "🏥", label: "병원",     color: "#F44336", bg: "#FFEBEE", iconName: "Stethoscope" },
  // hospital은 vet과 동일 — 드롭다운 옵션에서는 노출하지 않지만 기존 데이터 호환을 위해 유지
  hospital: { emoji: "🏥", label: "병원",     color: "#F44336", bg: "#FFEBEE", iconName: "Stethoscope" },
  supply:   { emoji: "📦", label: "용품",     color: "#607D8B", bg: "#ECEFF1", iconName: "Package" },
  vaccine:  { emoji: "💉", label: "예방접종", color: "#10B0F0", bg: "#E1F5FE", iconName: "Syringe" },
  checkup:  { emoji: "🩺", label: "검진",     color: "#00BCD4", bg: "#E0F7FA", iconName: "ClipboardCheck" },
  surgery:  { emoji: "🏨", label: "수술",     color: "#E91E63", bg: "#FCE4EC", iconName: "HeartPulse" },
  other:    { emoji: "📅", label: "기타",     color: "#9E9E9E", bg: "#F5F5F5", iconName: "Calendar" },
};

// 일정 추가 모달의 드롭다운에 노출할 카테고리 (병원은 vet 하나만 노출)
export const SCHEDULE_CATEGORY_OPTIONS: TaskCategory[] = [
  "daily", "food", "medicine", "walk", "play",
  "groom", "vet", "vaccine", "checkup", "surgery",
  "supply", "other",
];

// ─── Store ─────────────────────────────────────────────────────────────────
const petCareStore: Record<string, PetCareData> = {};

function initPetData(_petId: string): PetCareData {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    tasks: [
      { id: 1, title: "아침 식사", category: "food", date: today, time: "08:00", completed: false, repeat: "none" },
      { id: 2, title: "저녁 식사", category: "food", date: today, time: "19:00", completed: false, repeat: "none" },
      { id: 3, title: "산책",     category: "walk", date: today, time: "18:00", completed: false, repeat: "none" },
    ],
    weights: [],
    walks: [],
    meds: [],
    hospitals: [],
    groomings: [],
    supplies: [],
    food: { brand: "", product: "", dailyAmount: "", memo: "" },
  };
}

// Get pet care data (없으면 초기화)
export function getPetCareData(petId: string): PetCareData {
  if (!petCareStore[petId]) {
    petCareStore[petId] = initPetData(petId);
  }
  return petCareStore[petId];
}

// Set pet care data
// - 전체 PetCareData 객체로 덮어쓰기 (HealthManagement에서 mutate 후 저장하는 패턴)
// - 또는 Partial<PetCareData>로 일부만 업데이트
export function setPetCareData(petId: string, data: PetCareData | Partial<PetCareData>): void {
  if (!petCareStore[petId]) {
    petCareStore[petId] = initPetData(petId);
  }
  petCareStore[petId] = { ...petCareStore[petId], ...data };
}

// ─── 조회 헬퍼 ─────────────────────────────────────────────────────────────
export function getTodayTasks(petId: string): Task[] {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return getTasksForDate(petId, today);
}

// ─── 날짜 유틸 ─────────────────────────────────────────────────────────────
function pad2(n: number) { return String(n).padStart(2, "0"); }
function dateToStr(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * 반복 일정의 "다음 발생일"을 anchor 기준으로 계산한다.
 * - 단발(none): 시작일 그대로
 * - daily / weekly / monthly / yearly: anchor 이후(같음 포함) 첫 발생일
 * 시작일이 anchor 이후라면 시작일 그대로.
 */
export function getNextOccurrence(task: Task, anchor: Date): string {
  const start = parseDate(task.date);
  const a = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());

  if (task.repeat === "none") return task.date;
  if (start.getTime() >= a.getTime()) return task.date;

  if (task.repeat === "daily") {
    return dateToStr(a);
  }
  if (task.repeat === "weekly") {
    const startDow = start.getDay();
    const next = new Date(a);
    const diff = (startDow - a.getDay() + 7) % 7;
    next.setDate(a.getDate() + diff);
    return dateToStr(next);
  }
  if (task.repeat === "monthly") {
    const day = start.getDate();
    let y = a.getFullYear(), m = a.getMonth();
    // 이번 달 후보
    let candidate = new Date(y, m, day);
    if (candidate.getMonth() !== m) {
      // 해당 달에 일자가 존재하지 않음 → 말일로 보정
      candidate = new Date(y, m + 1, 0);
    }
    if (candidate < a) {
      candidate = new Date(y, m + 1, day);
      if (candidate.getMonth() !== (m + 1) % 12) {
        candidate = new Date(y, m + 2, 0);
      }
    }
    return dateToStr(candidate);
  }
  if (task.repeat === "yearly") {
    const month = start.getMonth(), day = start.getDate();
    let candidate = new Date(a.getFullYear(), month, day);
    if (candidate < a) {
      candidate = new Date(a.getFullYear() + 1, month, day);
    }
    return dateToStr(candidate);
  }
  return task.date;
}

/**
 * 특정 월(year/month)에 해당 task가 발생하는 모든 날짜(YYYY-MM-DD) 반환.
 * 달력 점 표시용. monthIndex는 0~11.
 */
export function getOccurrencesInMonth(task: Task, year: number, monthIndex: number): string[] {
  const start = parseDate(task.date);
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const result: string[] = [];

  if (task.repeat === "none") {
    if (task.date >= dateToStr(monthStart) && task.date <= dateToStr(monthEnd)) {
      result.push(task.date);
    }
    return result;
  }

  if (task.repeat === "daily") {
    const begin = start > monthStart ? start : monthStart;
    for (let d = new Date(begin); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      result.push(dateToStr(d));
    }
    return result;
  }

  if (task.repeat === "weekly") {
    const dow = start.getDay();
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      if (d >= start && d.getDay() === dow) result.push(dateToStr(d));
    }
    return result;
  }

  if (task.repeat === "monthly") {
    const day = start.getDate();
    let candidate = new Date(year, monthIndex, day);
    if (candidate.getMonth() !== monthIndex) {
      candidate = new Date(year, monthIndex + 1, 0); // 해당 월 말일
    }
    if (candidate >= start && candidate >= monthStart && candidate <= monthEnd) {
      result.push(dateToStr(candidate));
    }
    return result;
  }

  if (task.repeat === "yearly") {
    const candidate = new Date(year, start.getMonth(), start.getDate());
    if (
      candidate.getMonth() === monthIndex &&
      candidate >= start && candidate >= monthStart && candidate <= monthEnd
    ) {
      result.push(dateToStr(candidate));
    }
    return result;
  }

  return result;
}

/**
 * 특정 날짜에 발생하는 모든 task를 반환 (반복 일정 전개 포함).
 */
export function getTasksForDate(petId: string, dateStr: string): Task[] {
  const data = getPetCareData(petId);
  const target = parseDate(dateStr);
  return data.tasks.filter(t => {
    const start = parseDate(t.date);
    if (target < start) return false;
    if (t.repeat === "none") return t.date === dateStr;
    if (t.repeat === "daily") return true;
    if (t.repeat === "weekly") return start.getDay() === target.getDay();
    if (t.repeat === "monthly") {
      // 같은 일자, 또는 해당 월 말일 보정
      if (target.getDate() === start.getDate()) return true;
      const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      return start.getDate() > lastDay && target.getDate() === lastDay;
    }
    if (t.repeat === "yearly") {
      return start.getMonth() === target.getMonth() && start.getDate() === target.getDate();
    }
    return false;
  });
}

// 다가오는 일정: 내일 이후의 모든 일정 (반복 일정의 다음 발생일 포함, 날짜순)
// limit을 주면 앞에서 N개만 반환
export function getUpcomingSchedules(petId: string, limit?: number): Task[] {
  const data = getPetCareData(petId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const list = data.tasks
    .map(t => {
      const nextDate = getNextOccurrence(t, tomorrow);
      return { ...t, date: nextDate } as Task;
    })
    .filter(t => parseDate(t.date) >= tomorrow)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
  return typeof limit === "number" ? list.slice(0, limit) : list;
}

// PetInfo 페이지의 "나의 펫 관리" 영역에 표시할 미완료 항목 최대 3개
// = 오늘의 할 일 + 다가오는 일정(반복 포함) 중 미완료만 시간순 최대 3개
// 완료된 항목은 자동으로 사라지고 다음 미완료 항목이 채워짐
// time 필드는 "오늘 09:00" / "D-1 14:00" 형태의 표시용 문자열
export function getTop3Tasks(
  petId: string
): Array<{ id: number; title: string; time: string; completed: boolean; category: TaskCategory }> {
  const data = getPetCareData(petId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = dateToStr(today);

  // 오늘에 해당하는 항목 (반복 전개 포함)
  const todayItems = getTasksForDate(petId, todayStr).map(t => ({
    task: t, sortKey: `0000_${t.time ?? "00:00"}`, label: "오늘",
  }));

  // 내일 이후 — 단발 + 반복(다음 발생일)
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const upcomingItems = data.tasks
    .map(t => {
      const nextDate = getNextOccurrence(t, tomorrow);
      return { ...t, date: nextDate } as Task;
    })
    .filter(t => parseDate(t.date) >= tomorrow)
    .map(t => {
      const days = daysUntil(t.date);
      return {
        task: t,
        sortKey: `${String(days).padStart(4, "0")}_${t.time ?? "00:00"}`,
        label: `D-${days}`,
      };
    });

  // 미완료만 필터링 후 정렬, 상위 3개
  const merged = [...todayItems, ...upcomingItems]
    .filter(({ task }) => !task.completed)
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .slice(0, 3);

  return merged.map(({ task, label }) => ({
    id: task.id,
    title: task.title,
    time: task.time ? `${label} ${task.time}` : label,
    completed: task.completed,
    category: task.category,
  }));
}

// ─── 변경 헬퍼 ─────────────────────────────────────────────────────────────
export function toggleTask(petId: string, taskId: number): void {
  const data = getPetCareData(petId);
  const task = data.tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
  }
}

export function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function addTask(petId: string, task: Omit<Task, "id">): void {
  const data = getPetCareData(petId);
  const maxId = Math.max(0, ...data.tasks.map(t => t.id));
  data.tasks.push({ ...task, id: maxId + 1 });
}

export function deleteTask(petId: string, taskId: number): void {
  const data = getPetCareData(petId);
  const index = data.tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    data.tasks.splice(index, 1);
  }
}

export function updateTask(petId: string, taskId: number, updates: Partial<Task>): void {
  const data = getPetCareData(petId);
  const task = data.tasks.find(t => t.id === taskId);
  if (task) {
    Object.assign(task, updates);
  }
}
