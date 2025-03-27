/**
 * Translation API service
 * Handles communication with Google Translate API
 */

interface TranslateRequest {
  sourceLanguage: string;
  targetLanguages: string[];
  text: string;
  apiKey?: string;
  projectId?: string;
}

interface TranslateResponse {
  translations: {
    [language: string]: string;
  };
  success: boolean;
  error?: string;
}

/**
 * Fetches the Google Translate API key from the database
 */
async function getApiKey(
  projectId: string = "translation-project-123",
): Promise<string | null> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const { data, error } = await supabase
      .from("projects")
      .select("google_translate_api_key")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error fetching API key:", error);
      return null;
    }

    return data?.google_translate_api_key || null;
  } catch (error) {
    console.error("Error in getApiKey:", error);
    return null;
  }
}

/**
 * Translates text using Google Translate API
 */
export async function translateText({
  sourceLanguage,
  targetLanguages,
  text,
  apiKey,
  projectId = "translation-project-123",
}: TranslateRequest & { projectId?: string }): Promise<TranslateResponse> {
  // If no API key is provided, try to fetch it from the database
  const finalApiKey = apiKey || (await getApiKey(projectId));

  if (!finalApiKey) {
    return {
      translations: {},
      success: false,
      error: "API key is required and could not be retrieved from the database",
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

    // Always include the source language text in the translations
    translations[sourceLanguage] = text;

    // For each target language, make a request to Google Translate API
    for (const targetLang of targetLanguages) {
      // Skip if target language is the same as source language
      if (targetLang === sourceLanguage) continue;

      const url = `https://translation.googleapis.com/language/translate/v2?key=${finalApiKey}`;

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
      success: Object.keys(translations).length > 1, // More than just the source language
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
export async function testApiKey(
  apiKey: string,
  projectId?: string,
): Promise<boolean> {
  try {
    const result = await translateText({
      sourceLanguage: "en",
      targetLanguages: ["fr"],
      text: "Hello",
      apiKey,
      projectId,
    });

    return result.success;
  } catch (error) {
    return false;
  }
}
