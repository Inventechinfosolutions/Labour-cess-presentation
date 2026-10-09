import { motion } from "motion/react";
import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router";
import { BrandHeader } from "@/components/layout/BrandHeader";
import { DesignSwitcher } from "@/components/layout/DesignSwitcher";
import { MainNav } from "@/components/layout/MainNav";
import { QuickStrip } from "@/components/layout/QuickStrip";
import { BackToTop, ScrollProgress } from "@/components/layout/ScrollExtras";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { TopBar } from "@/components/layout/TopBar";
import { PortalNav } from "@/components/portal/PortalNav";
import { DESIGNS, DesignProvider } from "@/lib/design";
import { useVisibility } from "@/lib/visibility";
import { CivicPage } from "@/pages/CivicPage";
import { GardenPage } from "@/pages/GardenPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { GeometricPage } from "@/pages/GeometricPage";
import { HomePage } from "@/pages/HomePage";
import { ModernPage } from "@/pages/ModernPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OrbitPage } from "@/pages/OrbitPage";
import { PortalPage } from "@/pages/PortalPage";
import { SitemapPage } from "@/pages/SitemapPage";
import { ShowcasePage } from "@/pages/ShowcasePage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Site() {
  const { pathname } = useLocation();
  const { ready, admin, isHidden } = useVisibility();
  const match = DESIGNS.find((d) => d.path === pathname)?.id;
  const design = match ?? (pathname === "/sitemap" ? "portal" : "photo");
  if (ready && !admin && match && isHidden(match)) return <Navigate to="/" replace />;
  return (
    <DesignProvider value={design}>
      <div className="flex min-h-svh flex-col">
        <TopBar />
        {design !== "garden" && <BrandHeader />}
        {design === "portal" || design === "civic" || design === "garden" ? <PortalNav /> : <MainNav />}
        <QuickStrip />
        <motion.main
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="flex-1"
        >
          <Outlet />
        </motion.main>
        <SiteFooter />
        <DesignSwitcher />
        <ScrollProgress />
        <BackToTop />
      </div>
    </DesignProvider>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route element={<Site />}>
          <Route path="/design-1" element={<HomePage />} />
          <Route path="/design-2" element={<HomePage />} />
          <Route path="/design-3" element={<ShowcasePage />} />
          <Route path="/design-4" element={<ModernPage />} />
          <Route path="/design-5" element={<GeometricPage />} />
          <Route path="/design-6" element={<OrbitPage />} />
          <Route path="/design-7" element={<PortalPage />} />
          <Route path="/design-8" element={<CivicPage />} />
          <Route path="/design-9" element={<GardenPage />} />
          <Route path="/sitemap" element={<SitemapPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
