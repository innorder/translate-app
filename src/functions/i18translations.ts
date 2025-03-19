/**
 * Translation utility functions for Next.js applications
 */

// Cache for translations to avoid unnecessary API calls
const translationCache: Record<string, Record<string, string>> = {};

/**
 * Fetch translations for server-side rendering (getStaticProps/getServerSideProps)
 */
export async function getTranslations(locale = "en", namespace = "default") {
  const cacheKey = `${locale}:${namespace}`;

  // Return cached translations if available
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    // Log the URL we're fetching from
    const url = `https://hopeful-shannon3-tq6dv.dev-2.tempolabs.ai/api/translations?namespace=${namespace}&locale=${locale}`;
    console.log("Fetching translations from:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: "Bearer trn_367w2zjowfe_i9oh4g1o4",
        "Project-ID": "translation-project-123",
      },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch translations: ${response.status}`,
        response,
      );
      // Log more detailed error information
      const text = await response
        .text()
        .catch(() => "Could not read response text");
      console.error("Response body:", text);
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
 * For getServerSideProps usage - fetch multiple namespaces
 */
export async function getServerSideTranslations(
  locale = "en",
  namespaces = ["default"],
) {
  try {
    const promises = namespaces.map((namespace) =>
      getTranslations(locale, namespace),
    );

    const results = await Promise.all(promises);

    // Merge all namespace results
    return results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  } catch (error) {
    console.error("Translation fetch error:", error);
    return {};
  }
}

/**
 * Client-side hook for using translations
 * Note: This is kept for backward compatibility, but useTranslation from context is preferred
 */
export function useTranslations(initialData: Record<string, string> = {}) {
  const t = (key: string, params: Record<string, string> = {}) => {
    if (!initialData[key]) return key;

    let text = initialData[key];
    Object.entries(params).forEach(([paramName, value]) => {
      text = text.replace(new RegExp(`{{${paramName}}}`, "g"), value);
    });

    return text;
  };

  return { t, translations: initialData };
}
