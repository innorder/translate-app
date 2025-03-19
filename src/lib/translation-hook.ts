"use client";

import { useState, useEffect } from "react";

interface TranslationOptions {
  locale?: string;
  namespace?: string;
  apiKey?: string;
  projectId?: string;
  baseUrl?: string;
}

interface TranslationHookResult {
  t: (key: string, params?: Record<string, string>) => string;
  translations: Record<string, string>;
  loading: boolean;
  error: string | null;
}

/**
 * React hook for using translations in client components
 */
export function useTranslations(
  options: TranslationOptions = {},
): TranslationHookResult {
  const {
    locale = "en",
    namespace = "default",
    apiKey,
    projectId = "translation-project-123",
    baseUrl = "/api/translations",
  } = options;

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get API key from localStorage if not provided
    const getApiKey = () => {
      if (apiKey) return apiKey;
      if (typeof window !== "undefined") {
        return localStorage.getItem("translationApiKey") || "";
      }
      return "";
    };

    const fetchTranslations = async () => {
      try {
        const key = getApiKey();
        if (!key) {
          setError(
            "API key is required. Please generate one in the Translation Management App.",
          );
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${baseUrl}?namespace=${namespace}&locale=${locale}`,
          {
            headers: {
              Authorization: `Bearer ${key}`,
              "Project-ID": projectId,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.status}`);
        }

        const data = await response.json();
        setTranslations(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch translations");
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [locale, namespace, apiKey, projectId, baseUrl]);

  /**
   * Translate a key with optional parameters
   */
  const t = (key: string, params: Record<string, string> = {}): string => {
    if (!translations[key]) return key;

    let text = translations[key];
    Object.entries(params).forEach(([paramName, value]) => {
      text = text.replace(new RegExp(`{{${paramName}}}`, "g"), value);
    });

    return text;
  };

  return { t, translations, loading, error };
}
