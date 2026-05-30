import { TopBar } from "../components/TopBar";
import { Map, ChevronDown, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

type LostItem = {
  id: string;
  status: "실종" | "완료";
  location: string;
  date: string;
  image: string;
  region: string;
  type: "강아지" | "고양이";
};

const items: LostItem[] = [
  { id: "1", status: "실종", location: "용인시 기흥구", date: "2026-02-20", region: "경기도", type: "강아지", image: "https://images.unsplash.com/photo-1550979050-66fa004ef286?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBwdXBweSUyMHBldHxlbnwxfHx8fDE3NzU4Mjg4MjJ8MA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: "2", status: "실종", location: "용인시 기흥구", date: "2026-02-18", region: "경기도", type: "고양이", image: "https://images.unsplash.com/photo-1769256130388-9fb59d103671?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBraXR0ZW4lMjBwZXR8ZW58MXx8fHwxNzc1ODk4NjQ4fDA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: "3", status: "완료", location: "용인시 기흥구", date: "2026-02-15", region: "경기도", type: "강아지", image: "https://images.unsplash.com/photo-1700080999483-740aaf46ce9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwzfHxkb2clMjBwdXBweSUyMHBldHxlbnwxfHx8fDE3NzU4Mjg4MjJ8MA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: "4", status: "완료", location: "성남시 분당구", date: "2026-02-13", region: "경기도", type: "고양이", image: "https://images.unsplash.com/photo-1758798355461-a14666565518?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxjYXQlMjBraXR0ZW4lMjBwZXR8ZW58MXx8fHwxNzc1ODk4NjQ4fDA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: "5", status: "실종", location: "서울 강남구", date: "2026-02-10", region: "서울특별시", type: "강아지", image: "https://images.unsplash.com/photo-1616615591669-a8452b6f5c18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxkb2clMjBwdXBweSUyMHBldHxlbnwxfHx8fDE3NzU4Mjg4MjJ8MA&ixlib=rb-4.1.0&q=80&w=400" },
  { id: "6", status: "완료", location: "수원시 영통구", date: "2026-02-08", region: "경기도", type: "강아지", image: "https://images.unsplash.com/photo-1658745230051-43b072d3b2a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxkb2clMjBwdXBweSUyMHBldHxlbnwxfHx8fDE3NzU4Mjg4MjJ8MA&ixlib=rb-4.1.0&q=80&w=400" },
];

const FILTER_OPTIONS = {
  searchBy: ["등록일 기준", "실종일 기준"],
  status: ["전체", "실종", "완료"],
  region: [
    "모든 지역", "서울특별시", "부산광역시", "대구광역시", "인천광역시",
    "광주광역시", "세종특별자치시", "대전광역시", "울산광역시", "경기도",
    "강원특별자치도", "충청북도", "충청남도", "전북특별자치도", "전라남도",
    "경상북도", "경상남도", "제주특별자치도",
  ],
  type: ["전체", "강아지", "고양이"],
};

type FilterKey = "searchBy" | "status" | "region" | "type";

const FILTER_LABELS: Record<FilterKey, string> = {
  searchBy: "검색 기준",
  status: "상태",
  region: "지역",
  type: "종류",
};

const FILTER_DEFAULTS: Record<FilterKey, string> = {
  searchBy: "등록일 기준",
  status: "전체",
  region: "모든 지역",
  type: "전체",
};

function BottomSheet({
  open,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 100,
        }}
      />
      {/* 시트 */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "480px",
          background: "white",
          borderRadius: "20px 20px 0 0",
          zIndex: 101,
          paddingBottom: "env(safe-area-inset-bottom)",
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 핸들 */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px", paddingBottom: "4px" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "9999px", background: "#E8EDF2" }} />
        </div>
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderBottom: "1px solid #EDF1F4",
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)" }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: "var(--text-2)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={20} />
          </button>
        </div>
        {/* 옵션 목록 */}
        <div style={{ overflowY: "auto", padding: "8px 0 16px" }}>
          {options.map((opt) => {
            const isSelected = selected === opt;
            return (
              <button
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  onClose();
                }}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "15px",
                  fontWeight: isSelected ? 700 : 400,
                  color: isSelected ? "var(--primary)" : "var(--text-1)",
                }}
              >
                {opt}
                {isSelected && (
                  <span
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path
                        d="M1 4L4 7L10 1"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}

function LostCard({ item }: { item: LostItem }) {
  const isLost = item.status === "실종";
  const badgeColor = isLost ? "#FF7043" : "#26C6DA";

  return (
    <div
      className="card"
      style={{
        overflow: "hidden",
        cursor: "pointer",
        padding: 0,
      }}
    >
      <div
        style={{
          aspectRatio: "1 / 1",
          background: "#F7F9FB",
          overflow: "hidden",
          borderBottom: "1px solid #F0F4F8",
        }}
      >
        <ImageWithFallback
          src={item.image}
          alt={`${item.status} - ${item.location}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "3px 10px",
              borderRadius: "6px",
              background: badgeColor,
              color: "white",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            {item.status}
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-2)" }}>{item.location}</span>
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-2)" }}>
          실종일: <span style={{ color: "var(--text-1)", fontWeight: 500 }}>{item.date}</span>
        </div>
      </div>
    </div>
  );
}

export default function LostPetFind() {
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    searchBy: "등록일 기준",
    status: "전체",
    region: "모든 지역",
    type: "전체",
  });
  const [openSheet, setOpenSheet] = useState<FilterKey | null>(null);

  const filterOrder: FilterKey[] = ["searchBy", "status", "region", "type"];

  const filtered = items.filter((item) => {
    if (filters.status !== "전체" && item.status !== filters.status) return false;
    if (filters.region !== "모든 지역" && item.region !== filters.region) return false;
    if (filters.type !== "전체" && item.type !== filters.type) return false;
    return true;
  });

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-app)", paddingTop: "56px", paddingBottom: "110px" }}
    >
      <TopBar type="back" title="미아찾기" />

      {/* 필터 바 */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "12px 16px 0",
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {filterOrder.map((key) => {
          const isActive = filters[key] !== FILTER_DEFAULTS[key];
          return (
            <button
              key={key}
              onClick={() => setOpenSheet(key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
                height: "36px",
                padding: "0 12px",
                borderRadius: "9999px",
                border: isActive ? "1.5px solid var(--primary)" : "1.5px solid #E8EDF2",
                background: isActive ? "var(--primary-soft)" : "white",
                color: isActive ? "var(--primary)" : "var(--text-2)",
                fontSize: "13px",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {isActive ? filters[key] : FILTER_LABELS[key]}
              <ChevronDown size={14} strokeWidth={2.5} />
            </button>
          );
        })}
      </div>

      {/* 결과 수 */}
      

      {/* 그리드 */}
      <div
        style={{
          padding: "8px 16px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        {filtered.length > 0 ? (
          filtered.map((item) => <LostCard key={item.id} item={item} />)
        ) : (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: "60px 0",
              color: "var(--text-3)",
              fontSize: "14px",
            }}
          >
            검색 결과가 없습니다.
          </div>
        )}
      </div>

{/* 하단 고정 CTA */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px",
          background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 40%)",
          zIndex: 30,
        }}
      >
        <button className="btn-cta">
          <Map size={20} />
          미아 위치 지도 보기
        </button>
      </div>

      {/* 바텀시트 */}
      {filterOrder.map((key) => (
        <BottomSheet
          key={key}
          open={openSheet === key}
          title={FILTER_LABELS[key]}
          options={FILTER_OPTIONS[key]}
          selected={filters[key]}
          onSelect={(v) => setFilters((prev) => ({ ...prev, [key]: v }))}
          onClose={() => setOpenSheet(null)}
        />
      ))}
    </div>
  );
}
