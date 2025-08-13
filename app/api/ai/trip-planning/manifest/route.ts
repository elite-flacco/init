import { NextRequest, NextResponse } from "next/server";
import {
  TravelerType,
  Destination,
  TripPreferences,
} from "../../../../../src/types/travel";
import { getAIConfig } from "../../config";

export interface AITripPlanningRequest {
  destination: Destination;
  travelerType: TravelerType;
  preferences: TripPreferences;
}

export interface TravelPlanManifest {
  sessionId: string;
  destination: Destination;
  overview: {
    duration: string;
    budget: string;
    bestFor: string[];
    highlights: string[];
    vibe: string;
  };
  sections: {
    id: string;
    title: string;
    description: string;
    estimatedItems: number;
    priority: number;
    preview: string[];
  }[];
  quickRecommendations: {
    topAttractions: string[];
    mustTryFood: string[];
    neighborhoods: string[];
    budgetTips: string[];
  };
}

async function callAI(prompt: string, maxTokens?: number): Promise<string> {
  const config = getAIConfig();
  const { provider, apiKey } = config;

  if (provider === "mock") {
    // Fast mock response for development
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return JSON.stringify({
      overview: {
        duration: "7 days",
        budget: "Mid-range ($100-200/day)",
        bestFor: ["First-time visitors", "Culture enthusiasts", "Food lovers"],
        highlights: ["Historic temples", "Street food tours", "Traditional markets", "River cruises"],
        vibe: "Vibrant, cultural, bustling with authentic experiences"
      },
      sections: [
        {
          id: "basics",
          title: "Places & Accommodations",
          description: "Top attractions, neighborhoods, and where to stay",
          estimatedItems: 15,
          priority: 1,
          preview: ["Grand Palace", "Wat Pho Temple", "Chatuchak Market"]
        },
        {
          id: "dining",
          title: "Food & Dining",
          description: "Restaurants, street food, and local specialties",
          estimatedItems: 20,
          priority: 2,
          preview: ["Pad Thai at street stalls", "Tom Yum Goong", "Mango sticky rice"]
        },
        {
          id: "practical",
          title: "Practical Information",
          description: "Transportation, weather, money, and safety tips",
          estimatedItems: 12,
          priority: 3,
          preview: ["BTS Skytrain system", "Humid tropical climate", "Thai Baht currency"]
        },
        {
          id: "cultural",
          title: "Culture & Itinerary",
          description: "Activities, history, and day-by-day planning",
          estimatedItems: 18,
          priority: 4,
          preview: ["Cooking classes", "Temple etiquette", "Royal history"]
        }
      ],
      quickRecommendations: {
        topAttractions: ["Grand Palace", "Wat Arun", "Floating Markets", "Jim Thompson House"],
        mustTryFood: ["Pad Thai", "Som Tam", "Tom Yum Goong", "Mango Sticky Rice"],
        neighborhoods: ["Old City (Rattanakosin)", "Sukhumvit", "Silom", "Thonburi"],
        budgetTips: ["Use BTS/MRT for transport", "Eat at street stalls", "Visit temples (free entry)", "Shop at local markets"]
      }
    });
  }

  const actualMaxTokens = maxTokens || 1500; // Smaller limit for fast response

  if (provider === "openai") {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: actualMaxTokens,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response from AI";
  }

  if (provider === "anthropic") {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model || "claude-3-sonnet-20240229",
        max_tokens: actualMaxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || "No response from AI";
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

function generateManifestPrompt(request: AITripPlanningRequest): string {
  const { destination, travelerType, preferences } = request;
  
  return `You are a travel planning expert. Generate a FAST, high-level travel plan manifest for:

DESTINATION: ${destination.name}, ${destination.country}
TRAVELER: ${travelerType.name} - ${travelerType.description}
DURATION: ${preferences.duration}
BUDGET: ${preferences.budget}
TIME OF YEAR: ${preferences.timeOfYear}
TRIP TYPE: ${preferences.tripType}

Create a JSON manifest with:
1. Overview (destination vibe, best highlights, what it's perfect for)
2. Quick preview of top 3-4 items for each section
3. Essential recommendations visitors need immediately

CRITICAL: Keep response under 1500 tokens for speed. Focus on the most important/popular items only.

Return ONLY valid JSON matching this structure:

{
  "overview": {
    "duration": "string",
    "budget": "string", 
    "bestFor": ["string"],
    "highlights": ["string"],
    "vibe": "string"
  },
  "sections": [
    {
      "id": "basics|dining|practical|cultural",
      "title": "string",
      "description": "string", 
      "estimatedItems": number,
      "priority": number,
      "preview": ["string"]
    }
  ],
  "quickRecommendations": {
    "topAttractions": ["string"],
    "mustTryFood": ["string"], 
    "neighborhoods": ["string"],
    "budgetTips": ["string"]
  }
}`;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: AITripPlanningRequest = await request.json();

    if (!body.destination || !body.travelerType || !body.preferences) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[Manifest API] Generating manifest for ${body.destination.name}, session ${sessionId}`);

    const prompt = generateManifestPrompt(body);
    const aiResponse = await callAI(prompt, 1500);
    
    // Parse AI response
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsedManifest;
    try {
      parsedManifest = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('[Manifest API] JSON parsing failed:', parseError);
      throw new Error(`Invalid JSON in manifest: ${parseError}`);
    }

    const manifest: TravelPlanManifest = {
      sessionId,
      destination: body.destination,
      overview: parsedManifest.overview,
      sections: parsedManifest.sections,
      quickRecommendations: parsedManifest.quickRecommendations
    };

    const duration = Date.now() - startTime;
    console.log(`[Manifest API] Generated manifest in ${duration}ms for session ${sessionId}`);

    return NextResponse.json(manifest);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[Manifest API] Request failed:', {
      duration,
      error: error instanceof Error ? error.message : String(error),
    });
    
    return NextResponse.json(
      {
        error: "Failed to generate travel plan manifest",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}