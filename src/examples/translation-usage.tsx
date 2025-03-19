/**
 * Example of how to use the TranslationClient in a real application
 */

"use client";

import { useState, useEffect } from "react";
import { TranslationClient } from "@/lib/translation-client";

// Create a client instance
const client = new TranslationClient({
  apiKey: "your-api-key", // Get this from localStorage or environment variables
  projectId: "your-project-id",
  baseUrl: "/api/translations", // Point to your actual API endpoint
});

// React hook for using translations
export function useTranslations(locale = "en", namespace = "default") {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const data = await client.fetchTranslations(locale, namespace);
        setTranslations(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTranslations();
  }, [locale, namespace]);

  const t = (key: string, params: Record<string, string> = {}) => {
    return client.translate(key, params, translations);
  };

  return { t, translations, loading, error };
}

// Example component using translations
export default function TranslatedComponent() {
  const { t, loading, error } = useTranslations("en", "default");

  if (loading) return <div>Loading translations...</div>;
  if (error) return <div>Error loading translations: {error}</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">{t("welcome")}</h1>
      <p>{t("hello", { name: "User" })}</p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        {t("goodbye")}
      </button>
    </div>
  );
}
