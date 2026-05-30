import { TopBar } from "../components/TopBar";
import { useNavigate } from "react-router";
import { Shield, MapPin, Bell, Users, Check } from "lucide-react";

export default function SafeGuardianDetail() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin size={22} color="#10B0F0" />,
      title: "실시간 위치 추적",
      desc: "GPS 기반으로 우리 아이의 위치를 24시간 확인할 수 있어요.",
    },
    {
      icon: <Bell size={22} color="#BE84F5" />,
      title: "이탈 알림",
      desc: "설정한 안전 구역을 벗어나면 즉시 알림을 보내드려요.",
    },
    {
      icon: <Users size={22} color="#F45C98" />,
      title: "실종 대응 네트워크",
      desc: "실종 발생 시 주변 사용자와 제휴 업체에 자동 공유됩니다.",
    },
    {
      icon: <Shield size={22} color="#F6B85F" />,
      title: "보험 연계 보상",
      desc: "제휴 보험사를 통해 실종·사고 시 보상을 받을 수 있어요.",
    },
  ];

  const benefits = [
    "분실 방지 스마트 태그 무상 제공",
    "24시간 실종 대응 전담팀 연결",
    "월 1회 안전 리포트 발송",
    "전국 제휴 동물병원 할인 혜택",
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-app)", paddingTop: "56px", paddingBottom: "140px" }}>
      <TopBar type="back" title="안심 지킴이" />

      {/* ── 인트로 카피 ── */}
      <div style={{ padding: "20px 16px 8px" }}>
        <p style={{ fontSize: "14px", color: "var(--text-2)", lineHeight: 1.5 }}>
          강아지 실종 예방부터 대응까지{" "}
          <span style={{ color: "var(--primary)", fontWeight: 600 }}>24시간 든든하게</span> 함께합니다
        </p>
      </div>

      {/* ── 주요 기능 ── */}
      <div style={{ padding: "16px 16px 8px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "14px" }}>
          주요 기능
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {features.map((f, i) => (
            <div
              key={i}
              className="card"
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "#F7F9FB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-1)", marginBottom: "4px" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 구독 혜택 ── */}
      <div style={{ padding: "24px 16px 8px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-1)", marginBottom: "14px" }}>
          구독 혜택
        </h2>
        <div
          style={{
            background: "#ECE8FB",
            borderRadius: "var(--r-16)",
            padding: "20px",
          }}
        >
          {benefits.map((b, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 0",
                borderBottom: i < benefits.length - 1 ? "1px dashed rgba(190, 132, 245, 0.3)" : "none",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#BE84F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Check size={14} color="white" strokeWidth={3} />
              </div>
              <span style={{ fontSize: "14px", color: "var(--text-1)", fontWeight: 500 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 가격 카드 ── */}
      <div style={{ padding: "24px 16px 8px" }}>
        <div
          className="card"
          style={{
          padding: "20px",
          border: "2px solid #AEE7FB",
          boxShadow: "0 4px 16px rgba(16, 176, 240, 0.08)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", color: "var(--text-2)" }}>월 구독료</span>
            <span style={{ fontSize: "11px", color: "#F45C98", fontWeight: 700 }}>서비스 오픈 기념 할인!</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "18px", fontWeight: 500, color: "var(--text-3)", textDecoration: "line-through" }}>4,900</span>
            <span style={{ fontSize: "28px", fontWeight: 700, color: "var(--primary)" }}>2,900</span>
            <span style={{ fontSize: "15px", color: "var(--text-2)" }}>원 / 월</span>
          </div>
          <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "6px" }}>
            최소 계약 기간 1년 · VAT 포함
          </p>
        </div>
      </div>

      {/* ── 하단 고정 CTA ── */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px",
          background: "linear-gradient(180deg, rgba(247,249,251,0) 0%, #F7F9FB 40%)",
          zIndex: 30,
        }}
      >
        <button className="btn-cta">
          구독 시작하기
        </button>
      </div>
    </div>
  );
}