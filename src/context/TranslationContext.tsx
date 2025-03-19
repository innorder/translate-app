import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getTranslations } from "@/functions/i18translations";

type TranslationContextType = {
  t: (key: string, params?: Record<string, string>) => string;
  locale: string;
  setLocale: (locale: string) => void;
  loading: boolean;
};

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

export function TranslationProvider({
  children,
  initialLocale = "en",
  initialTranslations = {},
}: {
  children: ReactNode;
  initialLocale?: string;
  initialTranslations?: Record<string, string>;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const [translations, setTranslations] =
    useState<Record<string, string>>(initialTranslations);
  const [loading, setLoading] = useState(false);

  // Fetch translations when locale changes
  useEffect(() => {
    const fetchTranslations = async () => {
      setLoading(true);
      try {
        const newTranslations = await getTranslations(locale, "default");
        setTranslations(newTranslations);
      } catch (error) {
        console.error("Failed to fetch translations:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we don't have translations for this locale already
    // or if we're changing locales
    if (Object.keys(translations).length === 0 || locale !== initialLocale) {
      fetchTranslations();
    }
  }, [locale, initialLocale]);

  // Translation function
  const t = (key: string, params: Record<string, string> = {}) => {
    if (!translations[key]) return key;

    let text = translations[key];
    Object.entries(params).forEach(([paramName, value]) => {
      text = text.replace(new RegExp(`{{${paramName}}}`, "g"), value);
    });

    return text;
  };

  return (
    <TranslationContext.Provider value={{ t, locale, setLocale, loading }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
