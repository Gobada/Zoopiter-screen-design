import { TopBar } from "../components/TopBar";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { globalPetsData, globalPets, globalPetStates } from "./PetInfo";

const DOG_BREEDS = [
  "골든리트리버", "그레이트데인", "그레이하운드", "꼬또드툴레아", "닥스훈트",
  "달마시안", "도베르만", "도사견", "라사압소", "래브라도리트리버",
  "로트와일러", "말라뮤트", "말티즈", "말티푸", "미니어처슈나우저",
  "미니어처핀셔", "믹스견", "바센지", "바셋하운드", "버니즈마운틴독",
  "베들링턴테리어", "벨기에말리노이즈", "보더콜리", "보스턴테리어", "복서",
  "볼로네세", "불독", "불테리어", "브리아드", "비글",
  "비숑프리제", "사모예드", "삽살개", "샤페이", "세인트버나드",
  "셔틀랜드쉽독", "소형푸들", "스코티시테리어", "스피츠", "시베리안허스키",
  "시바견", "시츄", "아이리시세터", "아키타", "알래스칸클리카이",
  "올드잉글리시쉽독", "와이마라너", "웰시코기", "잉글리시스프링어스패니얼", "재패니즈스피츠",
  "저먼셰퍼드", "잭러셀테리어", "진돗개", "차우차우", "치와와",
  "카발리에킹찰스스패니얼", "케언테리어", "코커스패니얼", "토이푸들", "파피용",
  "퍼그", "페키니즈", "포메라니안", "폭스테리어", "푸들",
  "프렌치불독", "부비에데플랑드르", "하바니즈", "해리어", "호바와트", "휘핏"
];

const CAT_BREEDS = [
  "네벨룽", "노르웨이숲", "데본렉스", "라가머핀", "러시안블루",
  "랙돌", "먼치킨", "메인쿤", "믹스묘", "바리네즈",
  "버만", "버미즈", "벵갈", "봄베이", "브리티시롱헤어",
  "브리티시쇼트헤어", "사바나", "샴", "셀커크렉스", "소말리",
  "스코티시스트레이트", "스코티시폴드", "스핑크스", "시베리안", "싱가푸라",
  "아메리칸쇼트헤어", "아메리칸컬", "아비시니안", "아시안", "오리엔탈",
  "오시캣", "이그저틱쇼트헤어", "이집션마우", "재패니즈밥테일", "친칠라",
  "코니시렉스", "코랏", "코리안쇼트헤어", "터키시반", "터키시앙고라",
  "통키니즈", "페르시안", "픽시밥", "하바나브라운", "히말라얀"
];

function CustomDropdown({
  value,
  options,
  placeholder,
  onChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  placeholder: string;
  onChange: (val: string) => void;
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

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-3 bg-[var(--bg-app)] rounded-[12px] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] flex items-center justify-between"
        style={{
          fontSize: "14px",
          fontWeight: 400,
          color: value === "" ? "var(--text-3)" : "var(--text-1)",
        }}
      >
        <span>{value === "" ? placeholder : selectedLabel}</span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 bg-white rounded-[12px] border border-[var(--border)] z-50 overflow-y-auto"
          style={{
            top: "calc(100% + 4px)",
            maxHeight: "220px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.10)",
          }}
        >
          {options.map((option, index) => (
            <div key={option.value}>
              {index === 1 && placeholder === "선택하시오" && (
                <div style={{ height: "1px", backgroundColor: "var(--border)", margin: "0 12px" }} />
              )}
              <div
                onClick={() => { onChange(option.value); setOpen(false); }}
                className="px-4 py-3 cursor-pointer flex items-center justify-between"
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: value === option.value ? "var(--primary)" : index === 0 ? "var(--text-3)" : "var(--text-1)",
                  backgroundColor: value === option.value ? "var(--primary-soft)" : "white",
                }}
                onMouseEnter={(e) => {
                  if (value !== option.value) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-app)";
                }}
                onMouseLeave={(e) => {
                  if (value !== option.value) (e.currentTarget as HTMLElement).style.backgroundColor = "white";
                }}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 5" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PetInfoEdit() {
  const navigate = useNavigate();
  const { petId } = useParams();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInputName, setDeleteInputName] = useState("");

  const handleDelete = useCallback(() => {
    if (!petId) return;
    if (deleteInputName.trim() !== "삭제") return;

    // 전역 데이터에서 제거
    const idx = globalPets.findIndex((p) => p.id === petId);
    if (idx !== -1) globalPets.splice(idx, 1);
    delete globalPetsData[petId];
    delete globalPetStates[petId];

    navigate("/pet", { replace: true });
  }, [petId, deleteInputName, navigate]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const [formData, setFormData] = useState({
    species: "강아지",
    name: "",
    breed: "",
    birthYear: "",
    birthMonth: "",
    birthDay: "",
    gender: "수컷",
    weight: "",
    neutered: "완료",
  });

  useEffect(() => {
    if (petId && globalPetsData[petId]) {
      const petData = globalPetsData[petId];

      let estimatedYear = "";
      if (petData.age && petData.age !== "-") {
        const ageNum = parseInt(petData.age);
        if (!isNaN(ageNum)) {
          estimatedYear = String(currentYear - ageNum);
        }
      }

      setFormData({
        species: petData.species || "강아지",
        name: petData.name || "",
        breed: petData.breed || "",
        birthYear: estimatedYear,
        birthMonth: "",
        birthDay: "",
        gender: petData.gender || "수컷",
        weight: petData.weight ? petData.weight.replace("kg", "") : "",
        neutered: petData.neutered || "완료",
      });
    }
  }, [petId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId) return;

    let age = "-";
    if (formData.birthYear) {
      age = `${currentYear - parseInt(formData.birthYear)}살`;
    }

    const existingData = globalPetsData[petId] || {
      photos: [],
      dummyColor: "#A5D6A7",
    };

    globalPetsData[petId] = {
      ...existingData,
      species: formData.species,
      name: formData.name,
      breed: formData.breed || "-",
      gender: formData.gender,
      age,
      weight: formData.weight ? `${formData.weight}kg` : "-",
      neutered: formData.neutered,
    };

    const petIndex = globalPets.findIndex(p => p.id === petId);
    if (petIndex !== -1) {
      globalPets[petIndex].name = formData.name;
    }

    navigate(-1);
  };

  const breedOptions = [
    { label: "선택하시오", value: "" },
    { label: "기타", value: "기타" },
    ...(formData.species === "강아지" ? DOG_BREEDS : CAT_BREEDS).map((b) => ({ label: b, value: b })),
  ];

  const yearOptions = [
    { label: "년도", value: "" },
    ...years.map((y) => ({ label: `${y}년`, value: String(y) })),
  ];

  const monthOptions = [
    { label: "월", value: "" },
    ...months.map((m) => ({ label: `${m}월`, value: String(m) })),
  ];

  const dayOptions = [
    { label: "일", value: "" },
    ...days.map((d) => ({ label: `${d}일`, value: String(d) })),
  ];

  return (
      <div className="min-h-screen bg-[var(--bg-app)] pt-14 pb-28">
      <TopBar type="back" title="나의 펫 정보" />

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="card p-4 space-y-4">
          <FormField label="종류" required>
            <div className="flex gap-2">
              {["강아지", "고양이"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({ ...formData, species: option, breed: "" })}
                  className={`flex-1 px-4 py-3 rounded-[12px] border-2 font-bold transition-colors ${
                    formData.species === option
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-white"
                  }`}
                  style={{
                    color: formData.species === option ? "var(--primary)" : "var(--text-2)",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </FormField>

          <FormField
            label={
              <>
                이름 <span style={{ color: "var(--text-3)", fontWeight: "normal" }}>(최대 5자)</span>
              </>
            }
            required
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="이름을 입력하세요"
              maxLength={5}
              className="w-full px-4 py-3 bg-[var(--bg-app)] rounded-[12px] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
              style={{ fontSize: "14px" }}
            />
          </FormField>

          <FormField label="품종" required>
            <CustomDropdown
              value={formData.breed}
              options={breedOptions}
              placeholder="선택하시오"
              onChange={(val) => setFormData({ ...formData, breed: val })}
            />
          </FormField>

          <FormField label="생년월일" required>
            <div className="flex gap-2">
              <CustomDropdown
                value={formData.birthYear}
                options={yearOptions}
                placeholder="년도"
                onChange={(val) => setFormData({ ...formData, birthYear: val })}
              />
              <CustomDropdown
                value={formData.birthMonth}
                options={monthOptions}
                placeholder="월"
                onChange={(val) => setFormData({ ...formData, birthMonth: val })}
              />
              <CustomDropdown
                value={formData.birthDay}
                options={dayOptions}
                placeholder="일"
                onChange={(val) => setFormData({ ...formData, birthDay: val })}
              />
            </div>
          </FormField>

          <FormField label="성별" required>
            <div className="flex gap-2">
              {["수컷", "암컷"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: option })}
                  className={`flex-1 px-4 py-3 rounded-[12px] border-2 font-bold transition-colors ${
                    formData.gender === option
                      ? "border-[var(--primary)] bg-[var(--primary-soft)]"
                      : "border-[var(--border)] bg-white"
                  }`}
                  style={{
                    color: formData.gender === option ? "var(--primary)" : "var(--text-2)",
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="몸무게" required>
            <div className="relative">
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="몸무게를 입력하세요"
                className="w-full px-4 py-3 bg-[var(--bg-app)] rounded-[12px] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px]" style={{ color: "var(--text-2)" }}>kg</span>
            </div>
          </FormField>

          <div
            className="flex items-center justify-end"
            onClick={() => setFormData({ ...formData, neutered: formData.neutered === "완료" ? "미완료" : "완료" })}
            style={{ cursor: "pointer", gap: "10px" }}
          >
            <span className="text-[14px]" style={{ color: "var(--text-1)", fontWeight: 500 }}>
              중성화 했어요
            </span>
            <div style={{
              width: "44px", height: "26px", borderRadius: "13px",
              background: formData.neutered === "완료" ? "var(--primary)" : "var(--border)",
              position: "relative", transition: "background 0.2s", flexShrink: 0,
            }}>
              <div style={{
                position: "absolute", top: "3px",
                left: formData.neutered === "완료" ? "21px" : "3px",
                width: "20px", height: "20px", borderRadius: "50%",
                background: "white", transition: "left 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }} />
            </div>
          </div>
        </div>
      </form>

      {/* 카드 바로 아래 삭제 버튼 */}
      <div style={{ textAlign: "center", padding: "8px 16px 20px" }}>
        <button
          type="button"
          onClick={() => { setDeleteInputName(""); setShowDeleteConfirm(true); }}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "13px", color: "var(--text-3)",
            textDecoration: "underline", textUnderlineOffset: "3px",
          }}
        >
          이 펫 삭제하기
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] p-4 z-40" style={{ maxWidth: "480px", margin: "0 auto" }}>
        <button type="button" onClick={(e) => handleSubmit(e as any)} className="btn-primary w-full">
          저장하기
        </button>
      </div>

      {/* 삭제 확인 팝업 */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "24px", width: "100%", maxWidth: "320px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-1)", marginBottom: "8px" }}>
              정말 삭제할까요?
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-2)", lineHeight: 1.6, marginBottom: "16px" }}>
              삭제하면 모든 정보가 사라지며 복구할 수 없어요.<br />
              확인을 위해 아래에 <b style={{ color: "var(--text-1)" }}>삭제</b>를 입력해 주세요.
            </p>
            <input
              type="text"
              value={deleteInputName}
              onChange={(e) => setDeleteInputName(e.target.value)}
              placeholder="삭제"
              style={{
                width: "100%", padding: "12px 14px", borderRadius: "12px",
                border: "1.5px solid var(--border)", fontSize: "14px",
                color: "var(--text-1)", outline: "none",
                boxSizing: "border-box", marginBottom: "16px",
              }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, padding: "13px", borderRadius: "12px", background: "var(--bg-app)", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "var(--text-2)" }}
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteInputName.trim() !== "삭제"}
                style={{
                  flex: 1, padding: "13px", borderRadius: "12px", border: "none",
                  cursor: deleteInputName.trim() === "삭제" ? "pointer" : "not-allowed",
                  fontSize: "14px", fontWeight: 700, color: "white",
                  background: deleteInputName.trim() === "삭제" ? "#FF5252" : "#FFBDBD",
                  transition: "background 0.2s",
                }}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string | React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[14px] font-bold flex items-center gap-1" style={{ color: "var(--text-1)" }}>
        {label}
        {required && <span style={{ color: "var(--pink)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
