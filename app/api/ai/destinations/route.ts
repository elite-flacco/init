import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { destinations } from "../../../../src/data/mock/destinations";
import {
  Destination,
  PickDestinationPreferences,
  TravelerType,
} from "../../../../src/types/travel";
import { getAIConfig, modelSupportsTemperature } from "../config";

export interface AIDestinationRequest {
  travelerType: TravelerType;
  preferences?: PickDestinationPreferences;
  destinationKnowledge: {
    type: "yes" | "country" | "no-clue";
    label: string;
    description: string;
  };
  excludeDestinations?: string[];
}

// JSON Schema for structured destination recommendations
const DESTINATION_SCHEMA = {
  type: "object",
  properties: {
    destinations: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          country: { type: "string" },
          description: { type: "string" },
          bestTimeToVisit: { type: "string" },
          keyActivities: {
            type: "array",
            items: { type: "string", pattern: "^[A-Z][^\n\r]*$" },
          },
          matchReason: { type: "string" },
          estimatedCost: { type: "string" },
          highlights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string", pattern: "^[A-Z][^\n\r]*$" },
                description: { type: "string" },
              },
              required: ["name", "description"],
              additionalProperties: false,
            },
          },
          details: { type: "string" },
        },
        required: [
          "name",
          "country",
          "description",
          "bestTimeToVisit",
          "keyActivities",
          "matchReason",
          "estimatedCost",
          "highlights",
          "details",
        ],
        additionalProperties: false,
      },
    },
    summary: { type: "string" },
  },
  required: ["destinations", "summary"],
  additionalProperties: false,
};

async function callAI(
  prompt: string,
  excludeDestinations: string[] = [],
): Promise<string> {
  const config = getAIConfig();
  const { provider, apiKey } = config;

  if (provider === "mock" || !apiKey) {
    // Mock response for development using actual destinations data
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Filter out previously shown destinations
    const availableDestinations = destinations.filter(
      (dest) =>
        !excludeDestinations.some(
          (excluded) => excluded.toLowerCase() === dest.name.toLowerCase(),
        ),
    );

    // If no destinations are available after filtering, use all destinations
    const destinationsToUse =
      availableDestinations.length > 0 ? availableDestinations : destinations;

    // Select 2-3 random destinations from filtered data
    const shuffledDestinations = [...destinationsToUse].sort(
      () => 0.5 - Math.random(),
    );
    const selectedDestinations = shuffledDestinations.slice(0, 3);

    // Transform destinations to match AI response format
    const transformedDestinations = selectedDestinations.map((dest) => ({
      name: dest.name,
      country: dest.country,
      description: dest.description,
      bestTimeToVisit: dest.bestTimeToVisit,
      keyActivities: dest.highlights,
      matchReason: dest.matchReason,
      estimatedCost: dest.estimatedCost,
      highlights: dest.highlights,
      details: dest.details,
    }));

    return JSON.stringify({
      destinations: transformedDestinations,
      summary:
        "Based on your preferences for authentic experiences and adventure level, I've selected destinations that offer the perfect balance of cultural immersion and natural beauty from our curated collection.",
    });
  }

  // Real AI API calls
  if (provider === "openai") {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    try {
      const response = await openai.responses.create({
        model: config.model || "gpt-4o-2024-08-06",
        input: [{ role: "user", content: prompt }],
        text: {
          format: {
            type: "json_schema",
            schema: DESTINATION_SCHEMA,
            strict: true,
            name: "destination_recommendations",
          },
        },
        max_output_tokens: config.maxTokens,
        ...(modelSupportsTemperature(config.model || "") && {
          temperature: config.temperature,
        }),
      });

      return response.output_text || "No response from AI";
    } catch (error) {
      console.error("OpenAI API Error Details:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `OpenAI API error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
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
      const errorData = await response.json().catch(() => ({}));
      console.error("Anthropic API Error Details:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(
        `Anthropic API error: ${response.statusText} - ${JSON.stringify(errorData)}`,
      );
    }

    const data = await response.json();
    return data.content[0]?.text || "No response from AI";
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

function generatePrompt(request: AIDestinationRequest): string {
  const {
    travelerType,
    preferences,
    destinationKnowledge,
    excludeDestinations,
  } = request;

  const prompt = `You are an expert travel advisor specializing in personalized destination recommendations. Your task is to recommend 3-6 destinations that perfectly match this traveler's personality and preferences.

## TRAVELER PROFILE
**Type:** ${travelerType.name} - ${travelerType.description}
**Destination Knowledge:** ${destinationKnowledge.label} - ${destinationKnowledge.description}

${
  excludeDestinations && excludeDestinations.length > 0
    ? `## PREVIOUS RECOMMENDATIONS TO AVOID
The following destinations have already been recommended and should NOT be included in your response:
${excludeDestinations.map((dest) => `- ${dest}`).join("\n")}

Please suggest completely different destinations that have not been mentioned before.`
    : ""
}

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
  .map(([key, value]) => `- **${key}:** ${value?.trim()}`)
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
- **Off the Beaten Path:** Hidden gems, little-known, remote locations, local secrets, authentic experiences, FEWER tourists
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
  - Top 4-5 activities that align with their interests and personality
6. Match Reason
  - Specific explanation connecting this destination to their traveler type traits
7. Estimated Cost
  - Typical average daily cost of the destination for the specified budget level and time of year
8. Highlights
  - Top 3-4 highlights that align with their interests and personality
9. Details
  - 3-4 detailed paragraphs covering: cultural highlights, food scene, accommodation options, transportation, must-see attractions, local customs, and practical travel tips (3-4 paragraphs)

## RESPONSE FORMAT
Return ONLY ONE valid JSON object. 

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

    const aiResponse = await callAI(prompt, body.excludeDestinations || []);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("JSON Parse Error:", {
        error: parseError,
        responsePreview: aiResponse.substring(0, 500),
      });
      throw new Error("Invalid JSON response from AI");
    }

    // Validate the parsed response structure
    if (!parsedResponse || !Array.isArray(parsedResponse.destinations)) {
      console.error("Invalid AI response structure:", {
        hasDestinations: !!parsedResponse?.destinations,
        isArray: Array.isArray(parsedResponse?.destinations),
        responseKeys: parsedResponse ? Object.keys(parsedResponse) : "null",
      });
      throw new Error("AI response missing destinations array");
    }

    // Transform AI response to our destination format
    parsedResponse.destinations.forEach((dest: Destination) => {
      dest.id = `ai-${dest.name.toLowerCase().replace(/\s+/g, "-")}`;
      dest.image =
        "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop";
    });

    return NextResponse.json({
      destinations: parsedResponse.destinations,
      reasoning:
        parsedResponse.summary ||
        parsedResponse.reasoning ||
        "AI-generated recommendations",
      confidence: 85, // Default confidence score
    });
  } catch (error) {
    console.error("Destination API Error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Failed to generate destination recommendations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
