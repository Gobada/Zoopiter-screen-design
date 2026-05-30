import { TopBar } from "../components/TopBar";
import { BottomTabBar } from "../components/BottomTabBar";

interface PlaceholderProps {
  title: string;
}

export default function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] pb-20">
      <TopBar type="home" />
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-[20px] font-bold mb-2" style={{ color: "var(--text-1)" }}>
          {title}
        </div>
        <div className="text-[14px]" style={{ color: "var(--text-2)" }}>
          준비 중입니다
        </div>
      </div>
      <BottomTabBar />
    </div>
  );
}
