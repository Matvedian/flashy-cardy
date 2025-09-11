import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for translation request
const TranslateRequestSchema = z.object({
  text: z.string().min(1, "Text is required").max(1000, "Text is too long"),
  fromLanguage: z.string().min(1, "Source language is required"),
  toLanguage: z.string().min(1, "Target language is required"),
  context: z.string().optional(), // Optional context for better translations
});

// Supported languages for MyMemory
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'es': 'Spanish', 
  'fr': 'French',
  'de': 'German',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'zh': 'Chinese (Mandarin)',
  'ar': 'Arabic',
  'ru': 'Russian',
  'hi': 'Hindi',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'pl': 'Polish',
  'tr': 'Turkish',
  'th': 'Thai',
  'vi': 'Vietnamese',
} as const;

// MyMemory specific language code mapping
const MYMEMORY_LANGUAGE_MAPPING: Record<string, string> = {
  'zh': 'zh-CN', // Chinese Mandarin
  'no': 'nb',    // Norwegian
};

// MyMemory API response interface
interface MyMemoryResponse {
  responseStatus: number | string;
  responseDetails?: string;
  responseData?: {
    translatedText?: string;
  };
}

// MyMemory API translation function - Completely free, no API key required
const translateWithMyMemory = async (text: string, from: string, to: string): Promise<string> => {
  // Map language codes for MyMemory if needed
  const fromCode = MYMEMORY_LANGUAGE_MAPPING[from] || from;
  const toCode = MYMEMORY_LANGUAGE_MAPPING[to] || to;
  
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`;
  
  console.log(`MyMemory translation: ${fromCode} -> ${toCode}`);
  
  // Set up request with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'FlashyCardy/1.0',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`MyMemory API error: HTTP ${response.status}`);
    }
    
    const data: MyMemoryResponse = await response.json();
    console.log('MyMemory response:', data);
    
    // Check if translation was successful
    if (data.responseStatus !== 200 && data.responseStatus !== "200") {
      throw new Error(`MyMemory error: ${data.responseDetails || 'Translation failed'}`);
    }
    
    const translatedText = data.responseData?.translatedText?.trim();
    
    if (!translatedText) {
      throw new Error("MyMemory returned empty translation");
    }
    
    // Check if translation is meaningful (not just returning the same text)
    if (translatedText.toLowerCase() === text.toLowerCase().trim()) {
      throw new Error("MyMemory returned identical text - may not support this language pair");
    }
    
    console.log(`MyMemory translation successful: "${text}" -> "${translatedText}"`);
    return translatedText;
    
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('MyMemory translation timeout - please try again');
      }
      console.error('MyMemory translation error:', error);
      throw new Error(`Translation failed: ${error.message}`);
    }
    
    throw new Error('Unknown translation error');
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('Translation API request received');
    
    // Check authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    console.log(`Translation request from user: ${userId}`);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = TranslateRequestSchema.parse(body);

    const { text, fromLanguage, toLanguage } = validatedData;

    console.log(`Translation request: "${text}" (${fromLanguage} -> ${toLanguage})`);

    // Check if languages are supported
    if (!SUPPORTED_LANGUAGES[fromLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
      return NextResponse.json(
        { error: `Unsupported source language: ${fromLanguage}` }, 
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGUAGES[toLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
      return NextResponse.json(
        { error: `Unsupported target language: ${toLanguage}` }, 
        { status: 400 }
      );
    }

    // If source and target languages are the same, return original text
    if (fromLanguage === toLanguage) {
      console.log('Same language pair, returning original text');
      return NextResponse.json({
        translation: text,
        fromLanguage,
        toLanguage,
        originalText: text,
        service: "none",
        message: "Same language - no translation needed"
      });
    }

    const fromLangName = SUPPORTED_LANGUAGES[fromLanguage as keyof typeof SUPPORTED_LANGUAGES];
    const toLangName = SUPPORTED_LANGUAGES[toLanguage as keyof typeof SUPPORTED_LANGUAGES];

    // Use MyMemory for translation
    try {
      const translation = await translateWithMyMemory(text, fromLanguage, toLanguage);

      console.log('Translation successful, returning response');

      // Return the translation
      return NextResponse.json({
        translation,
        fromLanguage,
        toLanguage,
        originalText: text,
        fromLanguageName: fromLangName,
        toLanguageName: toLangName,
        service: "MyMemory",
        message: "Translated using MyMemory (free service)"
      });

    } catch (translationError: unknown) {
      const errorMessage = translationError instanceof Error ? translationError.message : 'Unknown error';
      console.error("MyMemory translation failed:", errorMessage);
      
      return NextResponse.json(
        { 
          error: "Free translation service temporarily unavailable. Please try again later.",
          details: errorMessage,
          service: "MyMemory"
        }, 
        { status: 503 }
      );
    }

  } catch (error) {
    console.error("Translation API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: error.issues 
        }, 
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// GET endpoint to return supported languages and service info
export async function GET() {
  return NextResponse.json({
    supportedLanguages: SUPPORTED_LANGUAGES,
    service: "MyMemory",
    info: "Free translation service - no API key required",
    languageCount: Object.keys(SUPPORTED_LANGUAGES).length,
    status: "active"
  });
}
