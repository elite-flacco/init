import { NextRequest, NextResponse } from "next/server";
import { destinations } from "../../../../src/data/mock/destinations";
import {
  PickDestinationPreferences,
  TravelerType,
} from "../../../../src/types/travel";
import { getAIConfig } from "../config";

export interface AIDestinationRequest {
  travelerType: TravelerType;
  preferences?: PickDestinationPreferences;
  destinationKnowledge: {
    type: "yes" | "country" | "no-clue";
    label: string;
    description: string;
  };
}

async function callAI(prompt: string): Promise<string> {
  const config = getAIConfig();
  const { provider, apiKey } = config;

  if (provider === "mock" || !apiKey) {
    // Mock response for development using actual destinations data
    await new Promise((resolve) => setTimeout(resolve, 30000));

    // Select 2-3 random destinations from our mock data
    const shuffledDestinations = [...destinations].sort(
      () => 0.5 - Math.random(),
    );
    const selectedDestinations = shuffledDestinations.slice(0, 3);

    // Transform destinations to match AI response format
    const transformedDestinations = selectedDestinations.map((dest) => ({
      name: dest.name,
      country: dest.country,
      description: dest.description,
      bestTimeToVisit: dest.bestTime,
      keyActivities: dest.highlights.join(", "),
      matchReason: `Perfect match for your travel style with ${dest.highlights[0].toLowerCase()} and authentic experiences`,
      estimatedCost: dest.budget,
      details: `${
        dest.description
      }. This destination offers amazing experiences including ${dest.highlights
        .join(", ")
        .toLowerCase()}.`,
    }));

    return JSON.stringify({
      destinations: transformedDestinations,
      reasoning:
        "Based on your preferences for authentic experiences and adventure level, I've selected destinations that offer the perfect balance of cultural immersion and natural beauty from our curated collection.",
      confidence: 85,
    });
  }

  // Real AI API calls
  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`OpenAI API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response from AI";
  }

  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.model || "claude-3-sonnet-20240229",
        max_tokens: config.maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || "No response from AI";
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

function generatePrompt(request: AIDestinationRequest): string {
  const { travelerType, preferences, destinationKnowledge } = request;

  const prompt = `You are an expert travel advisor specializing in personalized destination recommendations. Your task is to recommend 3-6 destinations that perfectly match this traveler's personality and preferences.

## TRAVELER PROFILE
**Type:** ${travelerType.name} - ${travelerType.description}
**Destination Knowledge:** ${destinationKnowledge.label} - ${destinationKnowledge.description}

${
  preferences
    ? `## TRAVEL PREFERENCES
${Object.entries({
  "Travel Season": preferences.timeOfYear,
  "Trip Duration": preferences.duration,
  "Budget Level": preferences.budget,
  "Preferred Activities": preferences.tripType,
  "Special Interests": preferences.specialActivities,
  "Weather Preference": preferences.weather,
  "Travel Priority": preferences.priority,
  "Destination Type": preferences.destinationType,
  "Preferred Region": preferences.region,
})
  .filter(([, value]) => value?.trim())
  .map(([key, value]) => `- **${key}:** ${value.trim()}`)
  .join("\n")}`
    : ""
}

## RECOMMENDATION GUIDELINES
Match destinations to traveler type:
- **Explorer Travelers:** Adventure, spontaneity, unique experiences, social opportunities
- **Type A Travelers:** Efficiency, must-see attractions, well-planned itineraries, cultural highlights
- **Overthinker Travelers:** Safety, comfort, familiar cuisines, English-speaking areas, established tourism
- **Chill Travelers:** Relaxation, natural beauty, slower pace, wellness activities

Destination type priorities:
- **Major Hits:** Iconic landmarks, world-famous attractions, bucket-list destinations
- **Off the Beaten Path:** Hidden gems, local secrets, authentic experiences, fewer tourists
- **Up and Coming:** Emerging destinations, trending hotspots, recently accessible places

Please include ALL of the following in your response for each destination:

1. Destination Name
  - Start with upper case
2. Country Name
  - Start with upper case
3. Description
  - 2-3 sentences description of the destination
4. Best Time to Visit
  - Optimal timing to visit this destination, explaining the weather conditions, activities available, cultural events, and crowds
5. Key Activities
  - Top 4-5 activities that align with their interests and personality, start each activity with upper case
6. Match Reason
  - Specific explanation connecting this destination to their traveler type traits
7. Estimated Cost
  - Typical average daily cost of the destination for the specified budget level and time of year
8. Highlights
  - Top 3-4 highlights that align with their interests and personality, start each highlight with upper case
9. Details
  - 3-4 detailed paragraphs covering: cultural highlights, food scene, accommodation options, transportation, must-see attractions, local customs, and practical travel tips (3-4 paragraphs)

## RESPONSE FORMAT
Return ONLY valid JSON with this exact structure, make sure there is comma after each field:

{
  "destinations": [
    {
      "name": "string",
      "country": "string", 
      "description": "string",
      "bestTimeToVisit": "string",
      "keyActivities": ["string"],
      "matchReason": "string",
      "estimatedCost": "string",
      "highlights": ["string"],
      "details": "string"
    }
  ],
  "summary": "string"
}

CRITICAL REQUIREMENTS:
- All destinations must strongly align with the traveler's personality type
- Prioritize their stated destination type preference (major hits/off beaten path/up and coming)
- Consider budget, season, and activity preferences in every recommendation
- Provide diverse options that offer different experiences within their preferences
- Include specific, actionable details in the "details" field
- Ensure JSON is perfectly formatted and parseable`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body: AIDestinationRequest = await request.json();

    if (!body.travelerType || !body.destinationKnowledge) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate comprehensive prompt based on traveler type and preferences
    const prompt = generatePrompt(body);

    const aiResponse = await callAI(prompt);

    // Parse AI response - it might be wrapped in markdown code blocks
    let cleanResponse = aiResponse.trim();
    if (cleanResponse.startsWith("```json")) {
      cleanResponse = cleanResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanResponse.startsWith("```")) {
      cleanResponse = cleanResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanResponse);
    } catch {
      throw new Error('Invalid JSON response from AI');
    }

    // Map AI response to actual destination objects from our data
    const recommendedDestinations = parsedResponse.destinations.map(
      (aiDest: {
        name: string;
        details: string;
        country?: string;
        description?: string;
        highlights?: string[];
        bestTimeToVisit?: string;
        estimatedCost?: string;
        keyActivities?: string[];
        matchReason?: string;
      }) => {
        // Try to find matching destination in our data, or create a basic one
        const existingDest = destinations.find(
          (dest) => dest.name.toLowerCase() === aiDest.name.toLowerCase(),
        );

        if (existingDest) {
          return {
            ...existingDest,
            details: aiDest.details || existingDest.details,
          };
        }

        // Create new destination object if not found in our data
        return {
          id: `ai-${aiDest.name.toLowerCase().replace(/\s+/g, "-")}`,
          name: aiDest.name,
          country: aiDest.country,
          description: aiDest.description,
          image: "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          highlights: aiDest.highlights || [],
          bestTime: aiDest.bestTimeToVisit || "Year-round",
          estimatedCost: aiDest.estimatedCost || "",
          details: aiDest.details || aiDest.description,
          keyActivities: aiDest.keyActivities || [],
          matchReason: aiDest.matchReason || "",
        };
      },
    );

    return NextResponse.json({
      destinations: recommendedDestinations,
      reasoning:
        parsedResponse.summary ||
        parsedResponse.reasoning ||
        "AI-generated recommendations",
      confidence: 85, // Default confidence score
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate destination recommendations" },
      { status: 500 },
    );
  }
}
