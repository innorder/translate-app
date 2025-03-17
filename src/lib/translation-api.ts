/**
 * Translation API service
 * Handles communication with Google Translate API
 */

interface TranslateRequest {
  sourceLanguage: string;
  targetLanguages: string[];
  text: string;
  apiKey: string;
}

interface TranslateResponse {
  translations: {
    [language: string]: string;
  };
  success: boolean;
  error?: string;
}

/**
 * Translates text using Google Translate API
 */
export async function translateText({
  sourceLanguage,
  targetLanguages,
  text,
  apiKey,
}: TranslateRequest): Promise<TranslateResponse> {
  if (!apiKey) {
    return {
      translations: {},
      success: false,
      error: "API key is required",
    };
  }

  if (!text) {
    return {
      translations: {},
      success: false,
      error: "Text is required",
    };
  }

  try {
    // Create a result object to store translations
    const translations: { [language: string]: string } = {};

    // For each target language, make a request to Google Translate API
    for (const targetLang of targetLanguages) {
      // Skip if target language is the same as source language
      if (targetLang === sourceLanguage) continue;

      const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLang,
          format: "text",
        }),
      });

      const data = await response.json();

      if (
        response.ok &&
        data.data &&
        data.data.translations &&
        data.data.translations[0]
      ) {
        translations[targetLang] = data.data.translations[0].translatedText;
      } else {
        console.error("Translation error:", data.error || "Unknown error");
        // Still continue with other languages
      }
    }

    return {
      translations,
      success: Object.keys(translations).length > 0,
    };
  } catch (error) {
    console.error("Translation API error:", error);
    return {
      translations: {},
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Tests if the API key is valid by attempting a simple translation
 */
export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const result = await translateText({
      sourceLanguage: "en",
      targetLanguages: ["fr"],
      text: "Hello",
      apiKey,
    });

    return result.success;
  } catch (error) {
    return false;
  }
}
