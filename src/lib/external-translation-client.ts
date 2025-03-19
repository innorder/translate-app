/**
 * External Translation Client
 *
 * This is a standalone client that can be published as an npm package
 * for external applications to use with your Translation Management App
 */

import { useState, useEffect } from "react";

interface TranslationConfig {
  apiKey: string;
  projectId?: string;
  baseUrl: string;
}

let globalConfig: TranslationConfig | null = null;

/**
 * Initialize the translation client with your API credentials
 */
export function initTranslations(config: TranslationConfig) {
  globalConfig = config;
}

/**
 * Cache for translations to avoid unnecessary API calls
 */
const translationCache: Record<string, Record<string, string>> = {};

/**
 * Fetch translations from the Translation Management API
 */
async function fetchTranslations(
  locale: string,
  namespace: string,
): Promise<Record<string, string>> {
  if (!globalConfig) {
    throw new Error(
      "Translation client not initialized. Call initTranslations first.",
    );
  }

  const cacheKey = `${locale}:${namespace}`;

  // Return from cache if available
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const response = await fetch(
      `${globalConfig.baseUrl}?locale=${locale}&namespace=${namespace}`,
      {
        headers: {
          Authorization: `Bearer ${globalConfig.apiKey}`,
          "Project-ID": globalConfig.projectId || "default",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch translations: ${response.status}`);
    }

    const data = await response.json();

    // Store in cache
    translationCache[cacheKey] = data;

    return data;
  } catch (error) {
    console.error("Translation fetch error:", error);
    return {};
  }
}

/**
 * React hook for using translations in external applications
 *
 * Usage:
 * const { t } = useTranslations();
 * <div>{t("hello-world")}</div>
 */
export function useTranslations(
  options: {
    locale?: string;
    namespace?: string;
  } = {},
) {
  const locale = options.locale || "en";
  const namespace = options.namespace || "default";

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!globalConfig) {
      setError(
        "Translation client not initialized. Call initTranslations first.",
      );
      setLoading(false);
      return;
    }

    const loadTranslations = async () => {
      try {
        setLoading(true);
        const data = await fetchTranslations(locale, namespace);
        setTranslations(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch translations");
        setLoading(false);
      }
    };

    loadTranslations();
  }, [locale, namespace]);

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

/**
 * Non-React version for use in vanilla JavaScript
 */
export async function getTranslator(
  options: {
    locale?: string;
    namespace?: string;
  } = {},
) {
  const locale = options.locale || "en";
  const namespace = options.namespace || "default";

  const translations = await fetchTranslations(locale, namespace);

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

  return { t, translations };
}
