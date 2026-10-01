import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { ConnectPage } from "@/pages/ConnectPage";
import { GlobalConnectPage } from "@/pages/GlobalConnectPage";
import { InvestPage } from "@/pages/InvestPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PathwayPage } from "@/pages/PathwayPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/global-connect" replace />} />
        <Route path="/global-connect" element={<GlobalConnectPage />} />
        <Route path="/global-connect/invest" element={<InvestPage />} />
        <Route path="/global-connect/connect" element={<ConnectPage />} />
        <Route path="/global-connect/:pathway" element={<PathwayPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
