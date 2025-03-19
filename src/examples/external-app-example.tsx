/**
 * Example of how to use the Translation Management App in an external application
 * similar to i18next
 */

import React from "react";
import {
  initTranslations,
  useTranslations,
} from "@/lib/external-translation-client";

// Initialize the translation client once at the app startup
// In a real application, this would be in your _app.tsx or similar
initTranslations({
  apiKey: "trn_367w2zjowfe_i9oh4g1o4", // Get this from your Translation Management App
  baseUrl: "https://hopeful-shannon3-tq6dv.dev-2.tempolabs.ai/api/translations", // URL to your Translation Management App API
});

// Simple component using translations
function WelcomeMessage() {
  const { t, loading, error } = useTranslations();

  if (loading) return <div>Loading translations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{t("welcome")}</h1>
      <p>{t("hello", { name: "World" })}</p>
    </div>
  );
}

// Component with language switching
function LanguageSwitcher() {
  const [locale, setLocale] = React.useState("en");
  const { t, loading, error } = useTranslations({ locale });

  if (loading) return <div>Loading translations...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">{t("welcome")}</h1>
      <p className="mb-4">{t("hello", { name: "User" })}</p>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setLocale("en")}
          className={`px-3 py-1 rounded ${locale === "en" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          English
        </button>
        <button
          onClick={() => setLocale("fr")}
          className={`px-3 py-1 rounded ${locale === "fr" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Français
        </button>
        <button
          onClick={() => setLocale("es")}
          className={`px-3 py-1 rounded ${locale === "es" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Español
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button className="p-2 bg-blue-100 rounded">{t("save")}</button>
        <button className="p-2 bg-gray-100 rounded">{t("cancel")}</button>
        <button className="p-2 bg-green-100 rounded">{t("add")}</button>
        <button className="p-2 bg-red-100 rounded">{t("delete")}</button>
      </div>
    </div>
  );
}

// Main example component
export default function ExternalAppExample() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">
        Translation Management Integration Example
      </h1>

      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Simple Example</h2>
          <WelcomeMessage />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            Language Switching Example
          </h2>
          <LanguageSwitcher />
        </section>

        <section className="mt-8 p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">How to Use</h2>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto">
            {`// 1. Initialize once at app startup
import { initTranslations, useTranslations } from '@your-org/translation-client';

initTranslations({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-translation-app.com/api/translations',
});

// 2. Use in any component
function MyComponent() {
  const { t } = useTranslations();
  
  return <div>{t('hello-world')}</div>;
}`}
          </pre>
        </section>
      </div>
    </div>
  );
}
