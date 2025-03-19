"use client";

import React from "react";
import {
  TranslationProvider,
  useTranslationContext,
} from "@/components/translation-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApiKeyGenerator from "@/components/translation/ApiKeyGenerator";

function TranslationDemo() {
  const { t, loading, error, locale, setLocale } = useTranslationContext();
  const [showApiKeyDialog, setShowApiKeyDialog] = React.useState(false);

  if (loading) return <div className="p-4">Loading translations...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{t("welcome")}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Translation Demo</CardTitle>
            <CardDescription>See translations in action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">{t("hello", { name: "User" })}</p>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setLocale("en")}>English</Button>
              <Button onClick={() => setLocale("fr")}>French</Button>
              <Button onClick={() => setLocale("es")}>Spanish</Button>
            </div>

            <div className="mt-4 p-4 bg-muted rounded">
              <p>
                Current locale: <strong>{locale}</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common UI Elements</CardTitle>
            <CardDescription>Translated UI components</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant="default">{t("save")}</Button>
                <Button variant="outline">{t("cancel")}</Button>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary">{t("add")}</Button>
                <Button variant="destructive">{t("delete")}</Button>
                <Button variant="ghost">{t("edit")}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="p-4 border rounded-md mt-2">
          <h3 className="text-xl font-semibold mb-2">
            How to use translations
          </h3>
          <p className="mb-4">To use translations in your components:</p>
          <pre className="bg-muted p-4 rounded overflow-x-auto">
            {`// 1. Wrap your component or page with TranslationProvider
<TranslationProvider>
  <YourComponent />
</TranslationProvider>

// 2. Use the hook in your component
function YourComponent() {
  const { t } = useTranslationContext();
  
  return <div>{t("hello", { name: "World" })}</div>;
}`}
          </pre>
        </TabsContent>

        <TabsContent value="setup" className="p-4 border rounded-md mt-2">
          <h3 className="text-xl font-semibold mb-2">Setup</h3>
          <p className="mb-4">
            You need an API key to use the translation service:
          </p>
          <Button onClick={() => setShowApiKeyDialog(true)}>
            Generate API Key
          </Button>
          <ApiKeyGenerator
            open={showApiKeyDialog}
            onOpenChange={setShowApiKeyDialog}
          />
        </TabsContent>

        <TabsContent value="api" className="p-4 border rounded-md mt-2">
          <h3 className="text-xl font-semibold mb-2">API Reference</h3>
          <p className="mb-4">The translation API is available at:</p>
          <code className="bg-muted p-2 rounded">
            /api/translations?namespace=default&locale=en
          </code>
          <p className="mt-4">Or using path parameters:</p>
          <code className="bg-muted p-2 rounded">
            /api/translations/en/default
          </code>
          <p className="mt-4 text-sm text-muted-foreground">
            Remember to include your API key in the Authorization header.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function TranslationsPage() {
  return (
    <TranslationProvider defaultLocale="en" namespace="default">
      <TranslationDemo />
    </TranslationProvider>
  );
}
