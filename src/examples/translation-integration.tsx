"use client";

import React from "react";
import {
  TranslationProvider,
  useTranslationContext,
} from "@/components/translation-provider";
import { Button } from "@/components/ui/button";

// Example component that uses translations
function TranslatedContent() {
  const { t, loading, error, locale, setLocale } = useTranslationContext();

  if (loading) return <div className="p-4">Loading translations...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg shadow">
      <h1 className="text-2xl font-bold">{t("welcome")}</h1>
      <p className="text-lg">{t("hello", { name: "User" })}</p>

      <div className="flex gap-2">
        <Button onClick={() => setLocale("en")}>English</Button>
        <Button onClick={() => setLocale("fr")}>French</Button>
        <Button onClick={() => setLocale("es")}>Spanish</Button>
      </div>

      <div className="mt-4 p-4 bg-muted rounded">
        <p>
          Current locale: <strong>{locale}</strong>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          This example demonstrates how to use the translation system with
          dynamic locale switching.
        </p>
      </div>
    </div>
  );
}

// Wrap your app or component with the TranslationProvider
export default function TranslationExample() {
  return (
    <TranslationProvider
      defaultLocale="en"
      namespace="default"
      // You can provide these values from environment variables or user settings
      // apiKey="your-api-key"
      // projectId="your-project-id"
      baseUrl="/api/translations"
    >
      <TranslatedContent />
    </TranslationProvider>
  );
}
