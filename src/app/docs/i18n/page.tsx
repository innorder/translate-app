"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export default function I18nIntegrationDocs() {
  const [activeTab, setActiveTab] = useState("setup");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  const codeExamples = {
    setup: `import { initTranslations } from '@your-org/translation-client';

// Initialize once at app startup
initTranslations({
  apiKey: 'your-api-key', // Get this from the Translation Management App
  baseUrl: 'https://your-translation-app.com/api/translations',
});`,
    react: `import { useTranslations } from '@your-org/translation-client';

function MyComponent() {
  // Default locale is 'en' and namespace is 'default'
  const { t, loading, error } = useTranslations();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('hello', { name: 'User' })}</p>
    </div>
  );
}`,
    javascript: `import { initTranslations, getTranslator } from '@your-org/translation-client';

// Initialize once
initTranslations({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-translation-app.com/api/translations',
});

// Use in any function
async function displayWelcome() {
  const { t } = await getTranslator({ locale: 'en' });
  
  document.getElementById('welcome').textContent = t('welcome');
  document.getElementById('greeting').textContent = t('hello', { name: 'User' });
}`,
    nextjs: `// Client Component
'use client';

import { useTranslations } from '@your-org/translation-client';

export default function ClientComponent() {
  const { t } = useTranslations();
  return <div>{t('welcome')}</div>;
}

// Server Component
import { headers } from 'next/headers';

async function getTranslations(locale) {
  const res = await fetch(
    \`https://your-translation-app.com/api/translations?locale=\${locale}\`,
    {
      headers: {
        'Authorization': \`Bearer \${process.env.TRANSLATION_API_KEY}\`,
        'Project-ID': 'your-project-id',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );
  
  return res.json();
}`,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">
        Translation Management i18n Integration
      </h1>
      <p className="text-lg text-muted-foreground mb-8">
        Use the Translation Management App like i18next in your applications
      </p>

      <Tabs
        defaultValue="setup"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="react">React</TabsTrigger>
          <TabsTrigger value="javascript">JavaScript</TabsTrigger>
          <TabsTrigger value="nextjs">Next.js</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Installation</h2>
            <div className="bg-muted p-4 rounded-md">
              <code>npm install @your-org/translation-client</code>
            </div>

            <h2 className="text-xl font-semibold mt-6">Initialization</h2>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                {codeExamples.setup}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(codeExamples.setup, "setup")}
              >
                {copied === "setup" ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="react" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">React Integration</h2>
            <p>
              Use the <code>useTranslations</code> hook in your React
              components:
            </p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                {codeExamples.react}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(codeExamples.react, "react")}
              >
                {copied === "react" ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="javascript" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Vanilla JavaScript</h2>
            <p>
              For non-React applications, use the <code>getTranslator</code>{" "}
              function:
            </p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                {codeExamples.javascript}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() =>
                  copyToClipboard(codeExamples.javascript, "javascript")
                }
              >
                {copied === "javascript" ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="nextjs" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Next.js Integration</h2>
            <p>Integration with both client and server components:</p>
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                {codeExamples.nextjs}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(codeExamples.nextjs, "nextjs")}
              >
                {copied === "nextjs" ? (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-12 p-6 border rounded-md bg-muted/30">
        <h2 className="text-xl font-semibold mb-4">
          Publishing Your Client Library
        </h2>
        <p className="mb-4">
          To make integration easier for your users, you can publish the client
          library as an npm package:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>Create a new repository for your client library</li>
          <li>
            Copy the <code>external-translation-client.ts</code> file
          </li>
          <li>Add package.json, README, and other necessary files</li>
          <li>
            Publish to npm with <code>npm publish</code>
          </li>
        </ol>
        <p className="mt-4 text-sm text-muted-foreground">
          This will allow your users to install and use your translation client
          with a simple npm install command.
        </p>
      </div>
    </div>
  );
}
