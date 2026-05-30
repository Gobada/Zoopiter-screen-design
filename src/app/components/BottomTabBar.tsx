import { Home, FileText, MessageSquare, BarChart3, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

export function BottomTabBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const tabs = [
    { icon: Home, label: "홈", path: "/" },
    { icon: FileText, label: "구독", path: "/subscribe" },
    { icon: MessageSquare, label: "커뮤니티", path: "/community" },
    { icon: BarChart3, label: "통계", path: "/stats" },
    { icon: User, label: "MY", path: "/my" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--border)] safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center gap-1 px-3 py-1 min-w-[60px]"
            >
              <Icon
                className="w-6 h-6"
                style={{ color: isActive ? "var(--primary)" : "var(--text-3)" }}
              />
              <span
                className="text-[11px]"
                style={{ color: isActive ? "var(--primary)" : "var(--text-3)" }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
