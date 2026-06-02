import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChevronLeft, Bell, User,
  CheckCircle, AlertTriangle, FileImage, ClipboardList,
} from "lucide-react";
import type { ReportData } from "./lostPetUtils";
import LostPetPoster from "./LostPetPoster";
import { globalPetsData } from "./PetInfo";

export default function LostPetResult() {
  const navigate = useNavigate();
  const { petId } = useParams<{ petId: string }>();
  const [isClosed, setIsClosed] = useState(false);
  const [showPosterModal, setShowPosterModal] = useState(false);

  const actualPetId = petId || "buddy";
  const petData = globalPetsData[actualPetId];
  const report = petData?.lostReport;

  // 실종신고가 없으면 신고 페이지로 리다이렉트
  useEffect(() => {
    if (!report) {
      navigate(`/pet/${actualPetId}/lost-report`, { replace: true });
    }
  }, [report, navigate, actualPetId]);

  const handleEdit = () => {
    navigate(`/pet/${actualPetId}/lost-report`, { state: { editMode: true } });
  };

  // 실종신고가 없으면 로딩 중 표시
  if (!report) {
    return (
      <div className="min-h-screen bg-[var(--bg-app)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm" style={{ color: "var(--text-3)" }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col">
      {/* TopBar */}
      <div className="relative flex items-center px-4 py-3 bg-[var(--bg-app)]">
        <button onClick={() => navigate(`/pet/${actualPetId}`, { replace: true })} className="p-1 rounded-full hover:bg-[var(--bg-app)] transition-colors">
          <ChevronLeft size={22} style={{ color: "var(--text-1)" }} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold" style={{ color: "var(--text-1)" }}>실종신고</span>
        <div className="flex gap-3 ml-auto">
          <Bell size={20} style={{ color: "var(--text-2)" }} />
          <User size={20} style={{ color: "var(--text-2)" }} />
        </div>
      </div>

      {/* 상태 배너 */}
      <div className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4" style={{ background: isClosed ? "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)" : "linear-gradient(135deg, #FF5A5F 0%, #FF8A8E 100%)" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {isClosed ? <CheckCircle size={20} className="text-white" /> : <AlertTriangle size={20} className="text-white" />}
            </div>
            <div>
              <p className="text-white font-bold text-[15px]">{isClosed ? "상황 종료" : "실종 신고 완료"}</p>
              <p className="text-white/80 text-xs mt-0.5">{isClosed ? "상황이 종료되었습니다." : "현재 실종 대응 진행 중입니다."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-4 pb-[280px]">
        <div className="card p-4 space-y-4">
          <h3 className="text-[15px] font-bold" style={{ color: "var(--text-1)" }}>신고 내용</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[var(--bg-app)]">
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>실종 당시 상태 및 특징</p>
              <p className="text-sm whitespace-pre-line" style={{ color: "var(--text-1)" }}>{report.description || "—"}</p>
            </div>
            {report.extraNote && (
              <div className="p-3 rounded-xl bg-[var(--bg-app)]">
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>추가하고 싶은 말</p>
                <p className="text-sm whitespace-pre-line" style={{ color: "var(--text-1)" }}>{report.extraNote}</p>
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1 p-3 rounded-xl bg-[var(--bg-app)]">
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>실종 날짜/시간</p>
                <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{report.lostDateTime || "—"}</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-[var(--bg-app)]">
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>실종 위치</p>
                <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{report.addressInput || "—"}</p>
              </div>
            </div>
            {report.contactNumber && (
              <div className="p-3 rounded-xl bg-[var(--bg-app)]">
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>연락처</p>
                <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{report.contactNumber}</p>
              </div>
            )}
          </div>
        </div>

        {report.photos.length > 0 && (
          <div className="card p-4">
            <p className="text-[15px] font-bold mb-3" style={{ color: "var(--text-1)" }}>사진</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {report.photos.map((src, i) => (
                <img key={i} src={src} alt={`사진 ${i+1}`} className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-[var(--border)]" />
              ))}
            </div>
          </div>
        )}

        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--text-3)" }}>보상금</p>
              <p className="text-[15px] font-bold" style={{ color: "var(--text-1)" }}>없음</p>
            </div>
            <button className="text-xs font-semibold px-4 py-2 rounded-full text-white" style={{ background: "var(--primary)" }}>
              보상금 추가하기 →
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-3)" }}>보상금을 추가하면 더 많은 사람들의 참여를 유도할 수 있습니다.</p>
        </div>

  </div>

      {/* 하단 고정 버튼 */}
      {!isClosed && (
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
          <div className="space-y-3">

            <button
              onClick={() => setShowPosterModal(true)}
              className="btn-cta"
              style={{ background: "white", color: "var(--text-1)", boxShadow: "var(--shadow-soft)", border: "1px solid var(--border)" }}
            >
              <FileImage size={18} style={{ color: "var(--primary)" }} />
              실종 포스터 만들기
            </button>

            <button
              onClick={() => navigate("/lost-board", { state: { petId } })}
              className="btn-cta"
              style={{ background: "white", color: "var(--text-1)", boxShadow: "var(--shadow-soft)", border: "1px solid var(--border)" }}
            >
              <ClipboardList size={18} style={{ color: "var(--primary)" }} />
              실종 게시판으로 이동
            </button>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={handleEdit}
                className="btn-cta"
                style={{ flex: 1, background: "var(--primary)" }}
              >
                수정하기
              </button>
              <button
                onClick={() => setIsClosed(true)}
                className="btn-cta"
                style={{ flex: 1, background: "#4CAF50" }}
              >
                상황 종료
              </button>
            </div>

          </div>
        </div>
      )}

{/* 포스터 모달 */}
{showPosterModal && petData && (
  <LostPetPoster
    report={report}
    petInfo={{
      species: petData.species,
      breed: petData.breed,
      gender: petData.gender,
      age: petData.age,
      weight: petData.weight,
    }}
    onClose={() => setShowPosterModal(false)}
  />
)}
    </div>
  );
}      
 