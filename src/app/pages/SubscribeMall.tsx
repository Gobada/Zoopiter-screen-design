import { TopBar } from "../components/TopBar";
import { useNavigate } from "react-router";
import { Shield, ChevronRight, Lock } from "lucide-react";

const items = [
  {
    id: "safe-guardian",
    title: "안심 지킴이",
    subtitle: "실종 예방 및 실종 대응을 위한 구독 서비스",
    description: "실종 예방부터 실종 발생 시 즉각 대응까지, 우리 아이를 24시간 지켜드려요.",
    tag: "BEST",
    tagColor: "#F45C98",
    bgTint: "#EFF8FD",
    iconBg: "#AEE7FB",
    iconColor: "#10B0F0",
    available: true,
    route: "/subscribe/safe-guardian",
  },
  {
    id: "coming-soon-1",
    title: "출시 예정",
    subtitle: "서비스를 준비중입니다.",
    description: "",
    tag: "COMING SOON",
    tagColor: "#A8B2BC",
    bgTint: "#F7F7FB",
    iconBg: "#ECE8FB",
    iconColor: "#BE84F5",
    available: false,
    route: "",
  },
  {
    id: "coming-soon-2",
    title: "출시예정",
    subtitle: "서비스를 준비중입니다.",
    description: "",
    tag: "COMING SOON",
    tagColor: "#A8B2BC",
    bgTint: "#F7F7FB",
    iconBg: "#F8F3E8",
    iconColor: "#F6B85F",
    available: false,
    route: "",
  },
];

export default function SubscribeMall() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-app)", paddingTop: "56px", paddingBottom: "32px" }}
    >
      <TopBar type="back" title="구독몰" />

      {/* ── 인트로 카피 ── */}
      <div
        style={{
          padding: "20px 16px 8px",
        }}
      >
        <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.5 }}>
          우리 아이를 위한{" "}
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>
            맞춤 구독 서비스
          </span>
          를 만나보세요
        </p>
      </div>

      {/* ── 구독 카드 리스트 ── */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.available && item.route) navigate(item.route);
            }}
            disabled={!item.available}
            style={{
              position: "relative",
              width: "100%",
              textAlign: "left",
              background: item.bgTint,
              border: "1px solid var(--border)",
              borderRadius: "20px",
              padding: "20px",
              cursor: item.available ? "pointer" : "not-allowed",
              boxShadow: "0 2px 8px rgba(34, 39, 46, 0.05)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              opacity: item.available ? 1 : 0.75,
            }}
            onMouseEnter={(e) => {
              if (item.available) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(31, 58, 87, 0.08)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(34, 39, 46, 0.05)";
            }}
          >
            {/* 상단: 태그 */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "white",
                  background: item.tagColor,
                  letterSpacing: "0.3px",
                }}
              >
                {item.tag}
              </span>
              {item.available ? (
                <ChevronRight size={20} color="var(--text-3)" />
              ) : (
                <Lock size={16} color="var(--text-3)" />
              )}
            </div>

            {/* 아이콘 + 타이틀 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                marginBottom: item.description ? "12px" : "0",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: item.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Shield size={28} color={item.iconColor} strokeWidth={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 700,
                    color: "var(--text-1)",
                    marginBottom: "4px",
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: item.available ? "var(--text-2)" : "var(--text-3)",
                    lineHeight: 1.4,
                  }}
                >
                  {item.subtitle}
                </p>
              </div>
            </div>

            {/* 설명 */}
            {item.description && (
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-2)",
                  lineHeight: 1.55,
                  paddingTop: "12px",
                  borderTop: "1px dashed var(--border)",
                }}
              >
                {item.description}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}