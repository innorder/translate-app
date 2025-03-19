"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useTranslations } from "@/lib/translation-hook";

interface TranslationContextType {
  t: (key: string, params?: Record<string, string>) => string;
  loading: boolean;
  error: string | null;
  locale: string;
  setLocale: (locale: string) => void;
}

interface TranslationProviderProps {
  children: ReactNode;
  defaultLocale?: string;
  namespace?: string;
  apiKey?: string;
  projectId?: string;
  baseUrl?: string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({
  children,
  defaultLocale = "en",
  namespace = "default",
  apiKey,
  projectId,
  baseUrl,
}: TranslationProviderProps) {
  const [locale, setLocale] = React.useState(defaultLocale);

  const { t, loading, error } = useTranslations({
    locale,
    namespace,
    apiKey,
    projectId,
    baseUrl,
  });

  return (
    <TranslationContext.Provider
      value={{
        t,
        loading,
        error,
        locale,
        setLocale,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTranslationContext must be used within a TranslationProvider",
    );
  }
  return context;
}
