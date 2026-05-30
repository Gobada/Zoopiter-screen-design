import { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronDown, MapPin, Map, X, Plus, Minus, Navigation,
} from "lucide-react";

// ── 타입 ──
export interface ReportData {
  description: string;
  lostDateTime: string;
  addressInput: string;
  contactNumber: string;
  extraNote: string;
  photos: string[];
}

// ── 날짜/시간 드롭다운 옵션 ──
export const YEARS  = Array.from({ length: 25 }, (_, i) => `${2026 + i}`);
export const MONTHS = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];
export const DAYS   = Array.from({ length: 31 }, (_, i) => `${i + 1}일`);
export const HOURS  = [
  "오전 12시","오전 1시","오전 2시","오전 3시","오전 4시","오전 5시",
  "오전 6시","오전 7시","오전 8시","오전 9시","오전 10시","오전 11시",
  "오후 12시","오후 1시","오후 2시","오후 3시","오후 4시","오후 5시",
  "오후 6시","오후 7시","오후 8시","오후 9시","오후 10시","오후 11시",
];

const ZONE_ADDRESSES = [
  { xMin: 0,   xMax: 120, yMin: 0,   yMax: 115, addr: "서울특별시 종로구 종로 1가 24" },
  { xMin: 120, xMax: 230, yMin: 0,   yMax: 115, addr: "서울특별시 강남구 테헤란로 152" },
  { xMin: 230, xMax: 400, yMin: 0,   yMax: 115, addr: "서울특별시 송파구 올림픽로 300" },
  { xMin: 0,   xMax: 120, yMin: 115, yMax: 205, addr: "서울특별시 마포구 합정동 360-4" },
  { xMin: 120, xMax: 230, yMin: 115, yMax: 205, addr: "서울특별시 강남구 역삼동 823-1" },
  { xMin: 230, xMax: 400, yMin: 115, yMax: 205, addr: "서울특별시 용산구 이태원로 180" },
  { xMin: 0,   xMax: 120, yMin: 205, yMax: 340, addr: "서울특별시 서초구 서초대로 74길 11" },
  { xMin: 120, xMax: 230, yMin: 205, yMax: 340, addr: "서울특별시 영등포구 여의대로 10" },
  { xMin: 230, xMax: 400, yMin: 205, yMax: 340, addr: "경기도 성남시 분당구 판교역로 235" },
];

declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          address: string; addressType: string; bname: string;
          buildingName: string; roadAddress: string; jibunAddress: string;
        }) => void;
        width?: string; height?: string; theme?: object;
      }) => { open: () => void; embed: (el: HTMLElement, options?: object) => void };
    };
  }
}

// ── SelectBox 컴포넌트 ──
export function SelectBox({ value, options, onChange, placeholder }: {
  value: string; options: string[]; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="relative flex-1">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none rounded-xl border px-3 py-2.5 text-sm pr-8 bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${value ? "border-[var(--primary)] text-[var(--text-1)]" : "border-[var(--border)] text-[var(--text-3)]"}`}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none" />
    </div>
  );
}

// ── 주소 검색 모달 ──
export function AddressSearchModal({ onSelect, onClose }: { onSelect: (addr: string) => void; onClose: () => void }) {
  const embedRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.daum?.Postcode) { setScriptLoaded(true); setLoading(false); return; }
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    script.onload = () => { setScriptLoaded(true); setLoading(false); };
    script.onerror = () => { setLoading(false); };
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !embedRef.current) return;
    new window.daum.Postcode({
      oncomplete: (data) => {
        let fullAddress = data.roadAddress || data.address;
        if (data.buildingName) fullAddress += ` (${data.buildingName})`;
        onSelect(fullAddress);
        onClose();
      },
      theme: {
        bgColor: "#FFFFFF", searchBgColor: "#2BBDB0", contentBgColor: "#FFFFFF",
        pageBgColor: "#F8FAFA", textColor: "#1F2937", queryTextColor: "#FFFFFF",
        postcodeTextColor: "#2BBDB0", emphTextColor: "#2BBDB0", outlineColor: "#D1D5DB",
      },
    }).embed(embedRef.current, { autoClose: false });
  }, [scriptLoaded]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
          <X size={22} style={{ color: "var(--text-1)" }} />
        </button>
        <span className="font-bold text-[16px]" style={{ color: "var(--text-1)" }}>주소 검색</span>
      </div>
      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[var(--primary)] rounded-full animate-spin" />
          <p className="text-sm text-gray-400">주소 검색을 불러오는 중...</p>
        </div>
      )}
      <div
        id="address-embed-wrapper"
        ref={embedRef}
        style={{ display: loading ? "none" : "block", flex: 1, width: "100%", maxWidth: "100vw", overflow: "hidden" }}
      />
      <style>{`
        #address-embed-wrapper iframe { width: 100% !important; max-width: 100% !important; min-width: 0 !important; border: none !important; }
        #address-embed-wrapper > div { width: 100% !important; max-width: 100% !important; }
      `}</style>
    </div>
  );
}

// ── 더미 지도 SVG ──
function DummyMap({ markerPos, onMapClick, zoom }: {
  markerPos: { x: number; y: number } | null;
  onMapClick: (nx: number, ny: number) => void;
  zoom: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rw = 2 + zoom, mw = 4 + zoom * 1.5;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    onMapClick(((e.clientX - rect.left) / rect.width) * 400, ((e.clientY - rect.top) / rect.height) * 340);
  };

  return (
    <svg ref={svgRef} viewBox="0 0 400 340" className="w-full h-full cursor-crosshair" onClick={handleClick} style={{ userSelect: "none" }}>
      <rect width="400" height="340" fill="#F2EFE9" />
      <path d="M0,200 Q80,185 160,195 Q240,205 320,188 Q360,182 400,190" fill="none" stroke="#B3D4EA" strokeWidth="18" strokeLinecap="round" />
      <path d="M0,202 Q80,187 160,197 Q240,207 320,190 Q360,184 400,192" fill="none" stroke="#B3D4EA" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
      <ellipse cx="60" cy="80" rx="38" ry="28" fill="#C8DDB0" opacity="0.85" />
      <ellipse cx="320" cy="260" rx="45" ry="30" fill="#C8DDB0" opacity="0.85" />
      <rect x="170" y="50" width="50" height="35" rx="8" fill="#C8DDB0" opacity="0.75" />
      {[[20,130,30,22],[58,128,24,20],[90,130,20,18],[20,158,35,18],[62,155,22,20],[92,153,28,22],[130,130,25,40],[162,128,20,22],[190,128,30,20],[162,155,28,18],[196,155,24,20],[240,130,30,20],[278,128,22,24],[308,130,28,20],[240,158,26,18],[274,155,32,20],[314,155,22,18],[350,130,30,22],[350,158,28,18],[20,220,28,20],[55,220,32,18],[94,218,26,22],[20,246,30,18],[58,244,28,20],[94,244,24,18],[130,220,30,40],[168,218,22,20],[198,220,28,18],[168,244,26,20],[200,244,30,18],[240,220,28,20],[275,218,24,22],[240,248,32,18],[278,246,26,20],[350,220,28,20],[350,246,30,18]].map(([x,y,w,h],i) => (
        <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill="#E8E4DC" stroke="#D9D4CA" strokeWidth="0.5" />
      ))}
      <rect x="0" y="115" width="400" height={mw} fill="#FFFFFF" />
      <rect x="0" y="205" width="400" height={mw} fill="#FFFFFF" />
      <rect x="0" y="290" width="400" height={rw} fill="#FFFFFF" />
      <rect x="15"  y="0" width={mw} height="340" fill="#FFFFFF" />
      <rect x="120" y="0" width={mw} height="340" fill="#FFFFFF" />
      <rect x="230" y="0" width={mw} height="340" fill="#FFFFFF" />
      <rect x="340" y="0" width={mw} height="340" fill="#FFFFFF" />
      {[50,85,160,195,270,305].map((x,i) => <rect key={i} x={x} y="0" width={rw} height="340" fill="#F5F3EE" />)}
      {[150,175].map((y,i) => <rect key={i} x="0" y={y} width="400" height={rw} fill="#F5F3EE" />)}
      <text x="32" y="112" fontSize="6" fill="#888" fontFamily="sans-serif">테헤란로</text>
      <text x="140" y="112" fontSize="6" fill="#888" fontFamily="sans-serif">강남대로</text>
      <text x="248" y="112" fontSize="6" fill="#888" fontFamily="sans-serif">올림픽대로</text>
      <text x="125" y="148" fontSize="5.5" fill="#aaa" fontFamily="sans-serif">역삼로</text>
      <text x="125" y="172" fontSize="5.5" fill="#aaa" fontFamily="sans-serif">선릉로</text>
      {[[120,115,"강남"],[230,115,"선릉"],[120,205,"역삼"]].map(([x,y,name],i) => (
        <g key={i}>
          <circle cx={Number(x)} cy={Number(y)} r="7" fill="#3C6FEB" />
          <text x={Number(x)} y={Number(y)+2} fontSize="6" fill="white" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif">M</text>
          <text x={Number(x)} y={Number(y)+14} fontSize="5.5" fill="#3C6FEB" textAnchor="middle" fontFamily="sans-serif">{String(name)}</text>
        </g>
      ))}
      <text x="60" y="82" fontSize="6" fill="#4A7C2F" textAnchor="middle" fontFamily="sans-serif">공원</text>
      <text x="320" y="262" fontSize="6" fill="#4A7C2F" textAnchor="middle" fontFamily="sans-serif">근린공원</text>
      <line x1="200" y1="0" x2="200" y2="340" stroke="#CCC" strokeWidth="0.5" strokeDasharray="4,4" />
      <line x1="0" y1="170" x2="400" y2="170" stroke="#CCC" strokeWidth="0.5" strokeDasharray="4,4" />
      {markerPos && (
        <g>
          <ellipse cx={markerPos.x} cy={markerPos.y + 20} rx="8" ry="3" fill="rgba(0,0,0,0.2)" />
          <path d={`M${markerPos.x},${markerPos.y+20} C${markerPos.x-10},${markerPos.y+10} ${markerPos.x-12},${markerPos.y} ${markerPos.x},${markerPos.y-14} C${markerPos.x+12},${markerPos.y} ${markerPos.x+10},${markerPos.y+10} ${markerPos.x},${markerPos.y+20}`} fill="#FF5A5F" stroke="white" strokeWidth="1.5" />
          <circle cx={markerPos.x} cy={markerPos.y - 6} r="3.5" fill="white" />
          <circle cx={markerPos.x} cy={markerPos.y - 6} r="12" fill="none" stroke="#FF5A5F" strokeWidth="1.5" opacity="0.4">
            <animate attributeName="r" from="10" to="20" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.4" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </svg>
  );
}

// ── 지도 선택 모달 ──
export function MapSelectModal({ onSelect, onClose }: { onSelect: (addr: string) => void; onClose: () => void }) {
  const [markerPos, setMarkerPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [zoom, setZoom] = useState(1);

  const handleMapClick = useCallback((nx: number, ny: number) => {
    setMarkerPos({ x: nx, y: ny });
    const zone = ZONE_ADDRESSES.find(z => nx >= z.xMin && nx < z.xMax && ny >= z.yMin && ny < z.yMax);
    setSelectedAddress(zone?.addr ?? "서울특별시 중구 을지로 30");
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100"><X size={22} style={{ color: "var(--text-1)" }} /></button>
        <span className="font-bold text-[16px]" style={{ color: "var(--text-1)" }}>지도에서 위치 선택</span>
        <div className="w-8" />
      </div>
      <div className="px-4 py-2 flex items-center gap-2 flex-shrink-0" style={{ background: "#E8F4FD", borderBottom: "1px solid #B3D9F5" }}>
        <Navigation size={13} style={{ color: "#1565C0" }} />
        <p className="text-xs font-medium" style={{ color: "#1565C0" }}>지도를 탭하여 실종 장소를 선택하세요</p>
      </div>
      <div className="flex-1 relative overflow-hidden bg-[#F2EFE9]">
        <DummyMap markerPos={markerPos} onMapClick={handleMapClick} zoom={zoom} />
        <div className="absolute right-3 top-3 flex flex-col gap-1">
          <button onClick={() => setZoom(z => Math.min(z + 0.5, 3))} className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center border border-gray-200"><Plus size={14} style={{ color: "var(--text-1)" }} /></button>
          <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center border border-gray-200"><Minus size={14} style={{ color: "var(--text-1)" }} /></button>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-white/70 rounded text-[9px] text-gray-400">지도 예시 (더미)</div>
        {!markerPos && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 rounded-2xl px-5 py-3 flex flex-col items-center gap-2">
              <MapPin size={22} className="text-white" />
              <p className="text-white text-xs font-medium">지도를 탭해서 위치를 선택하세요</p>
            </div>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-[var(--border)] space-y-3 bg-white">
        {selectedAddress ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: "var(--bg-app)" }}>
            <MapPin size={14} style={{ color: "var(--primary)" }} className="flex-shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] font-semibold mb-0.5" style={{ color: "var(--text-3)" }}>선택된 위치</p>
              <p className="text-sm font-medium" style={{ color: "var(--text-1)" }}>{selectedAddress}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-50">
            <MapPin size={14} className="text-gray-300 flex-shrink-0" />
            <p className="text-sm text-gray-400">위치를 선택해 주세요</p>
          </div>
        )}
        <button onClick={() => { if (selectedAddress) { onSelect(selectedAddress); onClose(); } }} disabled={!selectedAddress}
          className="w-full h-12 rounded-2xl font-bold text-[15px] text-white transition-all disabled:opacity-40 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #FF5A5F 0%, #FF8A8E 100%)" }}>
          이 위치로 선택하기
        </button>
      </div>
    </div>
  );
}
