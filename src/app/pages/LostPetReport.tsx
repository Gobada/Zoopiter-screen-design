import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import {
  ChevronLeft, Bell, User, MapPin, Map, X,
  CheckCircle, AlertTriangle, Camera, Phone,
} from "lucide-react";
import { Textarea } from "../components/ui/textarea";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  SelectBox, YEARS, MONTHS, DAYS, HOURS,
  AddressSearchModal, MapSelectModal,
} from "./lostPetUtils";
import type { ReportData } from "./lostPetUtils";
import { globalPetsData } from "./PetInfo";

export default function LostPetReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { petId } = useParams<{ petId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 편집 모드인지 확인
  const editMode = location.state?.editMode || false;
  const existingReport = petId ? globalPetsData[petId]?.lostReport : null;

  // 기존 날짜/시간 파싱 (편집 모드용)
  const parsedDateTime = existingReport?.lostDateTime?.split(" ") || [];
  
  const [isInfoConfirmed, setIsInfoConfirmed] = useState(editMode ? true : false);
  const [description, setDescription]         = useState(existingReport?.description || "");
  const [selYear, setSelYear]                 = useState(parsedDateTime[0] || "");
  const [selMonth, setSelMonth]               = useState(parsedDateTime[1] || "");
  const [selDay, setSelDay]                   = useState(parsedDateTime[2] || "");
  const [selHour, setSelHour]                 = useState(parsedDateTime[3] || "");
  const [locationMethod, setLocationMethod]   = useState<"address" | "map" | null>(existingReport?.addressInput ? "address" : null);
  const [addressInput, setAddressInput]       = useState(existingReport?.addressInput || "");
  const [contactNumber, setContactNumber]     = useState(existingReport?.contactNumber || "");
  const [extraNote, setExtraNote]             = useState(existingReport?.extraNote || "");
  const [photos, setPhotos]                   = useState<string[]>(existingReport?.photos || []);

  const [showAddressModal, setShowAddressModal]   = useState(false);
  const [showMapModal, setShowMapModal]           = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup]   = useState(false);
  const [showInfoAlert, setShowInfoAlert]         = useState(false);

  const lostDateTime = [selYear, selMonth, selDay, selHour].filter(Boolean).join(" ");

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => setPhotos(p => [...p, URL.createObjectURL(file)]));
  };

  const handleReportButtonClick = () => {
    if (!isInfoConfirmed) { setShowInfoAlert(true); return; }
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    const report: ReportData = { description, lostDateTime, addressInput, contactNumber, extraNote, photos };
    
    // globalPetsData에 실종신고 정보 저장
    if (petId && globalPetsData[petId]) {
      globalPetsData[petId].lostReport = report;
    }
    
    setShowConfirmDialog(false);
    setShowSuccessPopup(true);
    setTimeout(() => { 
      setShowSuccessPopup(false); 
      // 실종신고 완료 페이지로 이동
      navigate(`/pet/${petId}/lost-result`, { replace: true });
    }, 2000);
  };

  const handleSave = () => {
    const updatedReport = { description, lostDateTime, addressInput, contactNumber, extraNote, photos };
    
    // globalPetsData에 실종신고 정보 업데이트
    if (petId && globalPetsData[petId]) {
      globalPetsData[petId].lostReport = updatedReport;
    }
    
    // 수정 완료 후 결과 페이지로 이동
    navigate(`/pet/${petId}/lost-result`, { replace: true });
  };

  // ── 입력 화면 ──
  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex flex-col">
      {/* TopBar */}
      <div className="relative flex items-center px-4 py-3 bg-[var(--bg-app)]">
        <button onClick={() => navigate(`/pet/${petId}`, { replace: true })} className="p-1 rounded-full hover:bg-[var(--bg-app)] transition-colors">
          <ChevronLeft size={22} style={{ color: "var(--text-1)" }} />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold" style={{ color: "var(--text-1)" }}>실종신고</span>
        <div className="flex gap-3 ml-auto">
          <Bell size={20} style={{ color: "var(--text-2)" }} />
          <User size={20} style={{ color: "var(--text-2)" }} />
        </div>
      </div>

      {!editMode ? (
        <div className="mx-4 mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg, #FFF3F3 0%, #FFE8E8 100%)", border: "1px solid #FFD0D0" }}>
          <AlertTriangle size={18} style={{ color: "#E53935" }} />
          <p className="text-xs leading-relaxed" style={{ color: "#E53935" }}>신고 시 실종 게시판이 생성되고 앱 가입자 전원에게 알림이 발송됩니다.</p>
        </div>
      ) : (
        <div className="mx-4 mt-4 rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "#F1F8E9", border: "1px solid #C5E1A5" }}>
          <CheckCircle size={18} style={{ color: "#4CAF50" }} />
          <p className="text-xs leading-relaxed" style={{ color: "#388E3C" }}>내용을 수정한 후 저장하기를 눌러주세요.</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-28">
        {/* 1. 펫 정보 확인 */}
        <div className="card p-4">
          <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>나의 펫 정보가 최신으로 업데이트 되어 있나요?</p>
          <button onClick={() => setIsInfoConfirmed(!isInfoConfirmed)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
            style={isInfoConfirmed ? { background: "var(--primary)", borderColor: "var(--primary)", color: "white" } : { background: "white", borderColor: "var(--border)", color: "var(--text-2)" }}>
            <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all"
              style={isInfoConfirmed ? { borderColor: "white", background: "white" } : { borderColor: "#D1D5DB" }}>
              {isInfoConfirmed && <span className="text-xs font-bold" style={{ color: "var(--primary)" }}>✓</span>}
            </div>
            예, 최신 정보로 업데이트되어 있습니다
          </button>
        </div>

        {/* 2. 실종 날짜/시간 */}
        <div className="card p-4">
          <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>실종 날짜 / 시간</p>
          <div className="flex gap-2 mb-2">
            <SelectBox value={selYear}  options={YEARS}  onChange={setSelYear}  placeholder="년도" />
            <SelectBox value={selMonth} options={MONTHS} onChange={setSelMonth} placeholder="월" />
            <SelectBox value={selDay}   options={DAYS}   onChange={setSelDay}   placeholder="일" />
          </div>
          <SelectBox value={selHour} options={HOURS} onChange={setSelHour} placeholder="시간 선택" />
          {lostDateTime && <p className="text-xs mt-2 font-medium" style={{ color: "var(--primary)" }}>선택: {lostDateTime}</p>}
        </div>

        {/* 3. 실종 위치 */}
        <div className="card p-4">
          <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>
            실종 위치
            <span className="text-xs font-normal ml-2" style={{ color: "var(--text-3)" }}>(아래 방법 중 선택)</span>
          </p>
          <div className="flex gap-2 mb-3">
            <button onClick={() => { setLocationMethod("address"); setShowAddressModal(true); }}
              className="flex flex-1 items-center justify-center gap-1.5 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
              style={locationMethod === "address" ? { borderColor: "var(--primary)", background: "#E8F5F4", color: "var(--primary)" } : { borderColor: "var(--border)", color: "var(--text-2)", background: "white" }}>
              <MapPin size={14} />주소검색
            </button>
            <button onClick={() => { setLocationMethod("map"); setShowMapModal(true); }}
              className="flex flex-1 items-center justify-center gap-1.5 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
              style={locationMethod === "map" ? { borderColor: "var(--primary)", background: "#E8F5F4", color: "var(--primary)" } : { borderColor: "var(--border)", color: "var(--text-2)", background: "white" }}>
              <Map size={14} />지도에서 선택
            </button>
          </div>

          {/* ── 직접 입력란 추가 ── */}
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2.5 mb-3 bg-[var(--bg-app)]"
            style={{ borderColor: addressInput && locationMethod === "direct" ? "var(--primary)" : "var(--border)" }}
          >
            
            <input
              type="text"
              value={locationMethod === "direct" ? addressInput : ""}
              onChange={(e) => {
                setAddressInput(e.target.value);
                setLocationMethod("direct");
              }}
              onFocus={() => {
                if (locationMethod !== "direct") {
                  setAddressInput("");
                  setLocationMethod("direct");
                }
              }}
              placeholder="직접 입력"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-1)" }}
            />
            {locationMethod === "direct" && addressInput && (
              <button onClick={() => { setAddressInput(""); setLocationMethod(null); }}>
                <X size={14} style={{ color: "var(--text-3)" }} />
              </button>
            )}
          </div>

          {addressInput && locationMethod !== "direct" && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[var(--bg-app)]">
              <MapPin size={13} style={{ color: "var(--primary)" }} className="flex-shrink-0" />
              <p className="text-sm font-medium flex-1" style={{ color: "var(--text-1)" }}>{addressInput}</p>
              <button onClick={() => { setAddressInput(""); setLocationMethod(null); }}>
                <X size={14} style={{ color: "var(--text-3)" }} />
              </button>
            </div>
          )}
        </div>

        {/* 4. 연락처 */}
        <div className="card p-4">
          <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>
            연락처
            <span className="text-xs font-normal ml-2" style={{ color: "var(--text-3)" }}>(선택사항)</span>
          </p>
          <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5 bg-[var(--bg-app)]" style={{ borderColor: "var(--border)" }}>
            <Phone size={16} style={{ color: "var(--primary)" }} className="flex-shrink-0" />
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="010-0000-0000"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-1)" }}
            />
          </div>
          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: "var(--text-3)" }}>
            포스터에 표시될 연락처입니다. 미입력 시 앱 제보로 안내됩니다.
          </p>
        </div>

        {/* 5. 사진 */}
        <div className="card p-4">
          <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>
            사진
            <span className="text-xs font-normal ml-2" style={{ color: "var(--text-3)" }}>(최대 3장)</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => (
              <div key={idx}>
                {photos[idx] ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <img src={photos[idx]} alt={`사진 ${idx+1}`} className="w-full h-full object-cover" />
                    <button onClick={() => setPhotos(p => p.filter((_, j) => j !== idx))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center bg-black/60">
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1"
                    style={{ borderColor: "var(--border)", color: "var(--text-3)" }}>
                    <Camera size={20} />
                    <span className="text-[10px] font-medium">사진 추가</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
        </div>

        {/* 6. 실종 당시 상태 및 특징 (사진 아래로 이동) */}
        <div className="card p-4">
          <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>실종 당시 상태 및 특징</p>
          <Textarea placeholder={"목줄 착용 여부 및 색상\n인식표 착용 여부 및 색상\n그 외 외관상 참고사항"}
            value={description} onChange={(e) => setDescription(e.target.value)}
            className="rounded-xl text-sm resize-none min-h-[90px] bg-[var(--bg-app)]"
            style={{ borderColor: "var(--border)", color: "var(--text-1)" }} />
        </div>

        {/* 7. 추가하고 싶은 말 */}
        <div className="card p-4">
          <p className="text-[14px] font-bold mb-3" style={{ color: "var(--text-1)" }}>
            추가하고 싶은 말
            <span className="text-xs font-normal ml-2" style={{ color: "var(--text-3)" }}>(선택사항)</span>
          </p>
          <Textarea placeholder="찾아주시는 분들께 전달하고 싶은 내용을 자유롭게 적어주세요."
            value={extraNote} onChange={(e) => setExtraNote(e.target.value)}
            className="rounded-xl text-sm resize-none min-h-[90px] bg-[var(--bg-app)]"
            style={{ borderColor: "var(--border)", color: "var(--text-1)" }} />
        </div>
      </div>

      {/* 하단 버튼 */}
      {/* 하단 버튼 */}
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
        {editMode ? (
          <button onClick={handleSave}
            className="btn-cta"
            style={{ background: "linear-gradient(135deg, #4CAF50 0%, #81C784 100%)" }}>
            저장하기
          </button>
        ) : (
          <button onClick={handleReportButtonClick}
            className="btn-cta"
            style={{ background: "linear-gradient(135deg, #FF5A5F 0%, #FF8A8E 100%)" }}>
            실종 신고하기
          </button>
        )}
      </div>

      {/* 최신정보 알림 */}
      <AlertDialog open={showInfoAlert} onOpenChange={setShowInfoAlert}>
        <AlertDialogContent className="rounded-2xl max-w-[300px] mx-auto">
          <AlertDialogHeader className="items-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1" style={{ background: "#FFF8E1" }}>
              <AlertTriangle size={28} style={{ color: "#FFA000" }} />
            </div>
            <AlertDialogTitle className="text-center text-[16px] font-bold" style={{ color: "var(--text-1)" }}>펫 정보 업데이트 필요</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
              실종 신고 전, 나의 펫 정보가 최신 상태인지 확인해 주세요.<br /><br />체크박스를 선택한 후 신고를 진행해 주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <button onClick={() => setShowInfoAlert(false)} className="w-full h-11 rounded-xl font-bold text-[15px] text-white" style={{ background: "var(--primary)" }}>확인</button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 신고 확인 팝업 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-2xl max-w-[300px] mx-auto">
          <AlertDialogHeader className="items-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-1" style={{ background: "#FFF3F3" }}>
              <AlertTriangle size={28} style={{ color: "var(--pink)" }} />
            </div>
            <AlertDialogTitle className="text-center text-[16px] font-bold" style={{ color: "var(--text-1)" }}>실종 신고 진행</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
              실종 신고를 진행하시면 실종 게시판이 생성되고 앱 가입자 분들께 알림이 발송됩니다.<br /><br />실종 신고를 진행하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 mt-2">
            <button onClick={handleConfirm} className="w-full h-11 rounded-xl font-bold text-[15px] text-white" style={{ background: "var(--primary)" }}>진행하기</button>
            <button onClick={() => setShowConfirmDialog(false)} className="w-full h-11 rounded-xl font-semibold text-[15px]" style={{ background: "var(--bg-app)", color: "var(--text-2)" }}>취소</button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 완료 팝업 */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-7 flex flex-col items-center gap-3 mx-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#E8F5F4" }}>
              <CheckCircle size={36} style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-[16px] font-bold" style={{ color: "var(--text-1)" }}>실종 신고가 완료되었습니다.</p>
            <p className="text-xs text-center" style={{ color: "var(--text-3)" }}>잠시 후 신고 완료 화면으로 이동합니다.</p>
          </div>
        </div>
      )}

      {showAddressModal && (
        <AddressSearchModal onSelect={(addr) => { setAddressInput(addr); setShowAddressModal(false); }} onClose={() => setShowAddressModal(false)} />
      )}
      {showMapModal && (
        <MapSelectModal onSelect={(addr) => { setAddressInput(addr); setShowMapModal(false); }} onClose={() => setShowMapModal(false)} />
      )}
    </div>
  );
}