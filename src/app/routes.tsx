import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import PetInfo from "./pages/PetInfo";
import PetInfoEdit from "./pages/PetInfoEdit";
import PetGallery from "./pages/PetGallery";
import PetManagement from "./pages/PetManagement";
import Placeholder from "./pages/Placeholder";
import LostPetReport from "./pages/LostPetReport";
import LostPetBoard from "./pages/LostPetBoard";
import LostPetResult from "./pages/LostPetResult";
import SubscribeMall from "./pages/SubscribeMall";
import SafeGuardianDetail from "./pages/SafeGuardianDetail";
import LostPetFind from "./pages/LostPetFind";
import CoGuardian from "./pages/CoGuardian";

// Error boundary component
function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-1)" }}>
          오류가 발생했습니다
        </h1>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>
          페이지를 새로고침하거나 다시 시도해 주세요.
        </p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/pet/:petId",
    Component: PetInfo,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/pet/:petId/edit",
    Component: PetInfoEdit,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/pet/:petId/gallery",
    Component: PetGallery,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/pet/:petId/health",
    Component: PetManagement,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/subscribe",
    Component: SubscribeMall,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/subscribe/safe-guardian",
    Component: SafeGuardianDetail,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/community",
    element: <Placeholder title="커뮤니티" />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/stats",
    element: <Placeholder title="통계" />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/my",
    element: <Placeholder title="MY" />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/pet/:petId/lost-report",
    Component: LostPetReport,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/pet/:petId/lost-result",
    Component: LostPetResult,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/lost-board",
    Component: LostPetBoard,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/lost-find",
    Component: LostPetFind,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/pet/:petId/co-guardian",
    Component: CoGuardian,
    errorElement: <ErrorBoundary />,
  },
]);