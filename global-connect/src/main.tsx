import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { PageTransitionProvider } from "@/components/PageTransitionProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PageTransitionProvider>
          <App />
        </PageTransitionProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
