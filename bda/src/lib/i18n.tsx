import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "kn";
export type Text = Record<Lang, string>;

const STORAGE_KEY = "bda-lang";

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (text: Text) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() =>
    localStorage.getItem(STORAGE_KEY) === "kn" ? "kn" : "en",
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t: (text) => text[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang must be used inside LangProvider");
  return value;
}
