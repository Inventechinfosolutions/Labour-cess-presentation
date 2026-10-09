import { MotionConfig } from "motion/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { LangProvider } from "@/lib/i18n";
import { PrefsProvider } from "@/lib/prefs";
import { VisibilityProvider } from "@/lib/visibility";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LangProvider>
        <PrefsProvider>
          <VisibilityProvider>
            <MotionConfig reducedMotion="user">
              <App />
            </MotionConfig>
          </VisibilityProvider>
        </PrefsProvider>
      </LangProvider>
    </BrowserRouter>
  </StrictMode>,
);
