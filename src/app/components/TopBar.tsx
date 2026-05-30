import { Bell, Search, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface TopBarProps {
  type?: "home" | "back";
  title?: string;
}

export function TopBar({ type = "home", title }: TopBarProps) {
  const navigate = useNavigate();

  if (type === "home") {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 bg-white border-b border-[var(--border)]"
        style={{ height: "var(--topbar-height)" }}>
        <div className="text-[20px] font-bold" style={{ color: "var(--primary)" }}>
          Zoopiter
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2">
            <Search className="w-5 h-5" style={{ color: "var(--text-1)" }} />
          </button>
          <button className="p-2">
            <Bell className="w-5 h-5" style={{ color: "var(--text-1)" }} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center px-4 bg-white border-b border-[var(--border)]"
      style={{ height: "var(--topbar-height)" }}>
      <button onClick={() => navigate(-1)} className="p-2 -ml-2">
        <ChevronLeft className="w-6 h-6" style={{ color: "var(--text-1)" }} />
      </button>
      <div className="flex-1 text-center text-[17px] font-bold pr-10" style={{ color: "var(--text-1)" }}>
        {title}
      </div>
    </div>
  );
}