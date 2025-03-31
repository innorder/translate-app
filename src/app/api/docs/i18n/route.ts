import { NextResponse } from "next/server";

/**
 * API endpoint to provide i18n integration documentation
 */
export async function GET() {
  return NextResponse.json({
    title: "Translation Management i18n Integration",
    description:
      "How to use the Translation Management App like i18next in your applications",
    instructions: {
      setup: `
# Translation Management i18n Integration

## Setup

1. Install the client library:

\`\`\`bash
npm install @your-org/translation-client
\`\`\`

2. Initialize the client in your application:

\`\`\`javascript
import { initTranslations } from '@your-org/translation-client';

// Initialize once at app startup
initTranslations({
  apiKey: 'your-api-key', // Get this from the Translation Management App
  baseUrl: 'https://your-translation-app.com/api/translations',
});
\`\`\`
      `,
      react: `
## React Integration

\`\`\`jsx
import { useTranslations } from '@your-org/translation-client';

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
}
\`\`\`

### With Custom Locale and Namespace

\`\`\`jsx
function MyComponent() {
  const [locale, setLocale] = useState('en');
  const { t } = useTranslations({ locale, namespace: 'admin' });
  
  return (
    <div>
      <select onChange={(e) => setLocale(e.target.value)}>
        <option value="en">English</option>
        <option value="fr">French</option>
        <option value="es">Spanish</option>
      </select>
      <h1>{t('dashboard')}</h1>
    </div>
  );
}
\`\`\`
      `,
      javascript: `
## Vanilla JavaScript

\`\`\`javascript
import { initTranslations, getTranslator } from '@your-org/translation-client';

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
}
\`\`\`
      `,
      nextjs: `
## Next.js Integration

### Client Components

\`\`\`jsx
'use client';

import { useTranslations } from '@your-org/translation-client';

export default function ClientComponent() {
  const { t } = useTranslations();
  return <div>{t('welcome')}</div>;
}
\`\`\`

### Server Components

\`\`\`jsx
import { headers } from 'next/headers';

// This is a code example for documentation purposes only
const getTranslationsExample = (locale) => {
  // Example code showing how to fetch translations
  return {
    code: \`
const res = await fetch(
  \\\`https://your-translation-app.com/api/translations?locale=\\\${locale}\\\`,
  {
    headers: {
      'Authorization': \\\`Bearer \\\${process.env.TRANSLATION_API_KEY}\\\`,
      'Project-ID': 'your-project-id',
    },
    next: { revalidate: 3600 }, // Cache for 1 hour
  }
);

return res.json();
\`
  };
};

export default async function ServerComponent() {
  const headersList = headers();
  const locale = headersList.get('x-locale') || 'en';
  
  const translations = await getTranslations(locale);
  
  function t(key, params = {}) {
    if (!translations[key]) return key;
    
    let text = translations[key];
    Object.entries(params).forEach(([paramName, value]) => {
      text = text.replace(new RegExp(\`{{\${paramName}}}\`, 'g'), value);
    });
    
    return text;
  }
  
  return <div>{t('welcome')}</div>;
}
\`\`\`
      `,
    },
  });
}
