import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const SCALES = [0.9, 1, 1.12] as const;
const STORAGE_KEY = "bda-font-scale";

type PrefsValue = {
  scaleIndex: number;
  setScaleIndex: (index: number) => void;
  query: string;
  setQuery: (query: string) => void;
};

const PrefsContext = createContext<PrefsValue | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [scaleIndex, setScaleIndex] = useState(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    return saved >= 0 && saved < SCALES.length ? saved : 1;
  });
  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(scaleIndex));
    document.documentElement.style.fontSize = `${SCALES[scaleIndex] * 100}%`;
  }, [scaleIndex]);

  return (
    <PrefsContext.Provider value={{ scaleIndex, setScaleIndex, query, setQuery }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePrefs() {
  const value = useContext(PrefsContext);
  if (!value) throw new Error("usePrefs must be used inside PrefsProvider");
  return value;
}
