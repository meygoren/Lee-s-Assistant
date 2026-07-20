"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { dictionaries, type Language, type Dictionary } from "./dictionaries";

const LANG_COOKIE = "lee_lang";

type Ctx = {
  lang: Language;
  setLang: (lang: Language) => void;
  dict: Dictionary;
};

const LanguageContext = createContext<Ctx | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function LanguageProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  // initialLang is read server-side from the `lee_lang` cookie (see layout.tsx),
  // so the client doesn't need to re-read it on mount.
  const [lang, setLangState] = useState<Language>(initialLang ?? "zh");

  const setLang = (next: Language) => {
    setLangState(next);
    writeCookie(LANG_COOKIE, next);
  };

  const value = useMemo<Ctx>(
    () => ({ lang, setLang, dict: dictionaries[lang] }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
