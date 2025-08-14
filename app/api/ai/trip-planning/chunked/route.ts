import { NextRequest, NextResponse } from "next/server";
import {
  TravelerType,
  Destination,
  TripPreferences,
} from "../../../../../src/types/travel";
import { getAIConfig } from "../../config";
import { 
  calculateMaxTokensForRequest, 
  getModelTokenLimit 
} from "../../../../../src/lib/tokenUtils";

export interface AITripPlanningRequest {
  destination: Destination;
  travelerType: TravelerType;
  preferences: TripPreferences;
}

export interface ChunkInfo {
  chunkId: number;
  totalChunks: number;
  section: string;
  description: string;
}

export interface ChunkedAIResponse {
  chunk: ChunkInfo;
  data: Record<string, unknown>;
  isComplete: boolean;
}

// Note: Individual chunks are processed independently without session storage

async function callAI(prompt: string, maxTokens?: number): Promise<string> {
  const config = getAIConfig();
  const { provider, apiKey } = config;

  if (provider === "mock") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return `{"mockResponse": "This is a mock response for chunk testing"}`;
  }

  const actualMaxTokens = maxTokens || config.maxTokens || 4000;

  if (provider === "openai") {
    const controller = new AbortController();
    // Reduce timeout to 120 seconds for better UX
    const timeoutId = setTimeout(() => {
      console.warn('OpenAI API request timed out after 120s');
      controller.abort();
    }, 120000);

    try {
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
          temperature: config.temperature,
        }),
        signal: controller.signal,
      });

      // Clear timeout on successful response
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "No response from AI";
    } catch (error) {
      // Ensure timeout is always cleared
      clearTimeout(timeoutId);
      throw error;
    }
  }

  if (provider === "anthropic") {
    const controller = new AbortController();
    // Reduce timeout to 60 seconds for better UX  
    const timeoutId = setTimeout(() => {
      console.warn('Anthropic API request timed out after 60s');
      controller.abort();
    }, 60000);

    try {
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

      // Clear timeout on successful response
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content[0]?.text || "No response from AI";
    } catch (error) {
      // Ensure timeout is always cleared
      clearTimeout(timeoutId);
      throw error;
    }
  }

  throw new Error(`Unsupported AI provider: ${provider}`);
}

// Define the chunks for travel planning
const TRAVEL_PLAN_CHUNKS = [
  {
    id: 1,
    section: "locations",
    description: "Neighborhoods, hotels, restaurants, and bars",
    prompt: (request: AITripPlanningRequest) => generateLocationsPrompt(request)
  },
  {
    id: 2,
    section: "attractions",
    description: "Places to visit and must-try local food and drink",
    prompt: (request: AITripPlanningRequest) => generateFoodPrompt(request)
  },
  {
    id: 3,
    section: "practical",
    description: "Weather, safety, transportation, and money",
    prompt: (request: AITripPlanningRequest) => generatePracticalPrompt(request)
  },
  {
    id: 4,
    section: "cultural",
    description: "Activities, history, and detailed itinerary",
    prompt: (request: AITripPlanningRequest) => generateCulturalPrompt(request)
  }
];

export function generateLocationsPrompt(request: AITripPlanningRequest): string {
  const { destination, travelerType, preferences } = request;
  
  let prompt = `You are an expert travel planner AI. Create a detailed, personalized travel plan for the following traveler:

DESTINATION: ${destination.name}, ${destination.country}
Destination Description: ${destination.description}
Best Time to Visit: ${destination.bestTime}

TRAVELER PROFILE:
Type: ${travelerType.name} - ${travelerType.description}

TRIP PREFERENCES:
- Time of Year: ${preferences.timeOfYear}
- Duration: ${preferences.duration}
- Budget: ${preferences.budget}
- Accommodation: ${preferences.accommodation}
- Transportation: ${preferences.transportation}
- Wants Restaurant Recommendations: ${preferences.wantRestaurants ? "Yes" : "No"}
- Wants Bar/Nightlife Recommendations: ${preferences.wantBars ? "Yes" : "No"}
- Trip Type: ${preferences.tripType}
- Special Activities Requested: ${preferences.specialActivities}
`;

  // Add traveler type specific preferences
  if (preferences.activityLevel) {
    prompt += `- Activity Level: ${preferences.activityLevel}\n`;
  }
  if (preferences.riskTolerance) {
    prompt += `- Risk Tolerance: ${preferences.riskTolerance}\n`;
  }
  if (preferences.spontaneity) {
    prompt += `- Spontaneity: ${preferences.spontaneity}\n`;
  }
  if (preferences.scheduleDetail) {
    prompt += `- Schedule Detail: ${preferences.scheduleDetail}\n`;
  }
  if (preferences.bookingPreference) {
    prompt += `- Booking Preference: ${preferences.bookingPreference}\n`;
  }
  if (preferences.backupPlans) {
    prompt += `- Backup Plans: ${preferences.backupPlans}\n`;
  }
  if (preferences.luxuryLevel) {
    prompt += `- Luxury Level: ${preferences.luxuryLevel}\n`;
  }
  if (preferences.serviceLevel) {
    prompt += `- Service Level: ${preferences.serviceLevel}\n`;
  }
  if (preferences.exclusivity) {
    prompt += `- Exclusivity: ${preferences.exclusivity}\n`;
  }
  if (preferences.relaxationStyle) {
    prompt += `- Relaxation Style: ${preferences.relaxationStyle}\n`;
  }
  if (preferences.pacePreference) {
    prompt += `- Pace Preference: ${preferences.pacePreference}\n`;
  }
  if (preferences.stressLevel) {
    prompt += `- Stress Level: ${preferences.stressLevel}\n`;
  }

  const baseDays = parseInt(preferences.duration) || 7;
  const restaurantCount = Math.ceil(baseDays * 4);
  const barCount = Math.ceil(baseDays * 2);

  prompt += `

Please create a comprehensive travel plan that includes ALL of the following detailed sections:

1. NEIGHBORHOOD BREAKDOWNS (3-5 MOST POPULAR NEIGHBORHOODS)
   - Summary of 3-5 most popular neighborhoods with their unique vibes
   - Pros and cons of each neighborhood for travelers, especially in terms of accommodation and food options, location (whether it's close to major attractions), touristy v.s. local, safety, accessibility
   - Best neighborhoods for different types of activities
   - What makes each neighborhood unique and worth visiting, include this in the summary
   - One-liner suggestion on best for, e.g. "Best for first-timers" or "Best for families"

2. HOTEL RECOMMENDATIONS
   - For each neighborhood listed above, provide EXACTLY THREE (3) separate and distinct accommodation options
   - Each option must match the traveler's accommodation type preference (${preferences.accommodation}) and budget (${preferences.budget})
   - For each of the 3 options per neighborhood, include: name, amenities, price range, and detailed descriptions
   - Include link to Airbnb listing if applicable (for Airbnb preferences), otherwise use empty string ""
   - CRITICAL: You must provide 3 different accommodation options for EACH neighborhood - do not provide only 1 option per neighborhood

3. RESTAURANT RECOMMENDATIONS
   - Adjust number based on trip length and activity level: ${restaurantCount} recommendations
   - Include AT LEAST FIVE (5) restaurants for each neighborhood listed above that align with the traveler's budget preferences
   - Vary by cuisine type and neighborhood
   - Include specific dishes to try at each restaurant
   - Include if reservations are recommended / required - "Yes" or "No"

4. BAR/NIGHTLIFE RECOMMENDATIONS
   - Adjust the number of bars based on trip length and activity level: ${barCount} recommendations
   - Only return data if traveler's preference for "Wants Bar/Nightlife Recommendations" is "Yes"
   - Include AT LEAST THREE (2) bars for each neighborhood listed above that align with the traveler's budget preferences
   - Categorize by type: beer bars, wine bars, cocktail lounges, dive bars
   - Include atmosphere descriptions and what makes each unique
   - Match to traveler's nightlife preferences

Focus on creating authentic experiences that match their travel style while being comprehensive and practical. Consider their budget constraints, time limitations, and personal preferences throughout all recommendations.

CRITICAL: Your response MUST be ONLY a valid JSON object. Do not include any text before or after the JSON. 

Use this exact structure, MAKE SURE there is a comma after each field:

{
  "neighborhoods": [{"name": "string", "summary": "string", "vibe": "string", "pros": ["string"], "cons": ["string"], "bestFor": "string"}],
  "hotelRecommendations": [{"name": "string", "neighborhood": "string", "priceRange": "string", "description": "string", "amenities": ["string"], "airbnbLink": "string"}],
  ${preferences.wantRestaurants ? `"restaurants": [{"name": "string", "cuisine": "string", "priceRange": "string", "description": "string", "neighborhood": "string", "specialDishes": ["string"], "reservationsRecommended": "string"}],` : ''}
  ${preferences.wantBars ? `"bars": [{"name": "string", "type": "string", "atmosphere": "string", "description": "string", "category": "string", "neighborhood": "string"}]` : ''}
}

START YOUR RESPONSE WITH { AND END WITH }. NO OTHER TEXT.`;

  return prompt;
}

export function generateFoodPrompt(request: AITripPlanningRequest): string {
  const { destination, travelerType, preferences } = request;
  const baseDays = parseInt(preferences.duration) || 7;
  const activityMultiplier = preferences.activityLevel === "high" ? 4 : preferences.activityLevel === "low" ? 2 : 3;
  const placesCount = Math.ceil(baseDays * activityMultiplier);

  let prompt = `You are an expert travel planner AI. Create a detailed, personalized travel plan for the following traveler:

DESTINATION: ${destination.name}, ${destination.country}
Destination Description: ${destination.description}
Best Time to Visit: ${destination.bestTime}

TRAVELER PROFILE:
Type: ${travelerType.name} - ${travelerType.description}

TRIP PREFERENCES:
- Time of Year: ${preferences.timeOfYear}
- Duration: ${preferences.duration}
- Budget: ${preferences.budget}
- Accommodation: ${preferences.accommodation}
- Transportation: ${preferences.transportation}
- Wants Restaurant Recommendations: ${preferences.wantRestaurants ? "Yes" : "No"}
- Wants Bar/Nightlife Recommendations: ${preferences.wantBars ? "Yes" : "No"}
- Trip Type: ${preferences.tripType}
- Special Activities Requested: ${preferences.specialActivities}
`;

  // Add traveler type specific preferences
  if (preferences.activityLevel) {
    prompt += `- Activity Level: ${preferences.activityLevel}\n`;
  }
  if (preferences.riskTolerance) {
    prompt += `- Risk Tolerance: ${preferences.riskTolerance}\n`;
  }
  if (preferences.spontaneity) {
    prompt += `- Spontaneity: ${preferences.spontaneity}\n`;
  }
  if (preferences.scheduleDetail) {
    prompt += `- Schedule Detail: ${preferences.scheduleDetail}\n`;
  }
  if (preferences.bookingPreference) {
    prompt += `- Booking Preference: ${preferences.bookingPreference}\n`;
  }
  if (preferences.backupPlans) {
    prompt += `- Backup Plans: ${preferences.backupPlans}\n`;
  }
  if (preferences.luxuryLevel) {
    prompt += `- Luxury Level: ${preferences.luxuryLevel}\n`;
  }
  if (preferences.serviceLevel) {
    prompt += `- Service Level: ${preferences.serviceLevel}\n`;
  }
  if (preferences.exclusivity) {
    prompt += `- Exclusivity: ${preferences.exclusivity}\n`;
  }
  if (preferences.relaxationStyle) {
    prompt += `- Relaxation Style: ${preferences.relaxationStyle}\n`;
  }
  if (preferences.pacePreference) {
    prompt += `- Pace Preference: ${preferences.pacePreference}\n`;
  }
  if (preferences.stressLevel) {
    prompt += `- Stress Level: ${preferences.stressLevel}\n`;
  }

  prompt += `

Please create a comprehensive travel plan that includes ALL of the following detailed sections:

1. PLACES TO VISIT
   - Adjust number of attractions based on trip length and activity level: ${placesCount} recommendations
   - Main attractions categorized by type (cultural, historical, natural, entertainment, etc.)
   - Include priority ranking for each attraction based on user preferences and general popularity
   - For each place, include ticket booking information: whether tickets are required or recommended, booking advice (e.g. "Book at least 2 weeks in advance during peak season"), peak time DURING THE DAY (e.g. ["early morning", "late afternoon"]), average wait times to get in (e.g. "15-30 minutes")

2. MUST-TRY LOCAL FOOD AND DRINK
   - Provide most quintessential food items as structured objects with names, descriptions, and categories
   - Include main dishes, desserts, drinks, and snacks with specific descriptions
   - Add where to find each item and price ranges when relevant
   - Focus on authentic local specialties that are unique to this destination
   - Include seasonal or regional variations if applicable
    - Provide cultural context about why these foods are important to the local culture

Focus on creating authentic experiences that match their travel style while being comprehensive and practical. Consider their budget constraints, time limitations, and personal preferences throughout all recommendations.

CRITICAL: Your response MUST be ONLY a valid JSON object. Do not include any text before or after the JSON. 

Use this exact structure, MAKE SURE there is a comma after each field:

{
  "placesToVisit": [{"name": "string", "description": "string", "category": "string", "priority": number, "ticketInfo": {"required": boolean, "recommended": boolean, "bookingAdvice": "string", "peakTime": ["string"], "averageWaitTime": "string"}}],
  "mustTryFood": {"items": [{"name": "string", "description": "string", "category": "main|dessert|drink|snack", "whereToFind": "string", "priceRange": "string", "culturalContext": "string"}]}
}

START YOUR RESPONSE WITH { AND END WITH }. NO OTHER TEXT.`;

  return prompt;
}

export function generatePracticalPrompt(request: AITripPlanningRequest): string {
  const { destination, travelerType, preferences } = request;
  
  let prompt = `You are an expert travel planner AI. Create a detailed, personalized travel plan for the following traveler:

DESTINATION: ${destination.name}, ${destination.country}
Destination Description: ${destination.description}
Best Time to Visit: ${destination.bestTime}

TRAVELER PROFILE:
Type: ${travelerType.name} - ${travelerType.description}

TRIP PREFERENCES:
- Time of Year: ${preferences.timeOfYear}
- Duration: ${preferences.duration}
- Budget: ${preferences.budget}
- Accommodation: ${preferences.accommodation}
- Transportation: ${preferences.transportation}
- Wants Restaurant Recommendations: ${preferences.wantRestaurants ? "Yes" : "No"}
- Wants Bar/Nightlife Recommendations: ${preferences.wantBars ? "Yes" : "No"}
- Trip Type: ${preferences.tripType}
- Special Activities Requested: ${preferences.specialActivities}
`;

  // Add traveler type specific preferences
  if (preferences.activityLevel) {
    prompt += `- Activity Level: ${preferences.activityLevel}\n`;
  }
  if (preferences.riskTolerance) {
    prompt += `- Risk Tolerance: ${preferences.riskTolerance}\n`;
  }
  if (preferences.spontaneity) {
    prompt += `- Spontaneity: ${preferences.spontaneity}\n`;
  }
  if (preferences.scheduleDetail) {
    prompt += `- Schedule Detail: ${preferences.scheduleDetail}\n`;
  }
  if (preferences.bookingPreference) {
    prompt += `- Booking Preference: ${preferences.bookingPreference}\n`;
  }
  if (preferences.backupPlans) {
    prompt += `- Backup Plans: ${preferences.backupPlans}\n`;
  }
  if (preferences.luxuryLevel) {
    prompt += `- Luxury Level: ${preferences.luxuryLevel}\n`;
  }
  if (preferences.serviceLevel) {
    prompt += `- Service Level: ${preferences.serviceLevel}\n`;
  }
  if (preferences.exclusivity) {
    prompt += `- Exclusivity: ${preferences.exclusivity}\n`;
  }
  if (preferences.relaxationStyle) {
    prompt += `- Relaxation Style: ${preferences.relaxationStyle}\n`;
  }
  if (preferences.pacePreference) {
    prompt += `- Pace Preference: ${preferences.pacePreference}\n`;
  }
  if (preferences.stressLevel) {
    prompt += `- Stress Level: ${preferences.stressLevel}\n`;
  }

  prompt += `

Please create a comprehensive travel plan that includes ALL of the following detailed sections:

6. DETAILED WEATHER INFORMATION
   - Humidity levels and hydration recommendations
   - Day vs night temperature differences
   - Air quality concerns if applicable
   - "Feels like" temperature warnings (heat index, wind chill)
   - Specific clothing and preparation recommendations

7. SOCIAL ETIQUETTE
   - Cultural norms and expectations (dress codes, behavior, religious considerations)
   - What travelers should be aware of to show respect
   - Common mistakes tourists make and how to avoid them

8. LOCAL SAFETY TIPS
   - Basic safety precautions specific to this destination
   - Common scams and how to avoid them
   - Emergency contact information and procedures
   - Safe vs unsafe areas and times

9. COMPREHENSIVE TRANSPORTATION INFO
   - Public transportation system overview and how to use it
   - Credit card payment options for public transport - if you can tap credit card on train/bus directly
   - Airport transportation: provide a list of ALL major airports serving the destination
   - For each airport, include: distance to city center, ALL transportation options (including train, bus, taxi, rideshare)with cost, duration, and important notes/warnings (e.g., "be careful with unofficial taxis"). If no special notes, use empty array []
   - Rideshare/taxi availability, typical costs, and tips for using them
   - Include other forms of transportation (e.g. motorbike, tuk-tuk, etc.) in taxi info
   - INCLUDE other common forms of transportation (e.g. motorbike, tuk-tuk, etc.) in taxi info

10. CURRENCY AND PAYMENT INFORMATION
    - Local currency and current exchange rate from USD
    - Where cash is essential vs where credit cards work
    - ATM availability and fees, best ATMs to use
    - Payment customs and expectations
    - Current exchange rate information (can default to USD)

11. TIPPING ETIQUETTE
    - Specific tipping guidelines for: restaurants, bars, taxis, hotels, tour guides
    - Expected percentages or amounts
    - Cultural context around tipping

12. TAP WATER SAFETY
    - Is tap water safe to drink?

Focus on creating authentic experiences that match their travel style while being comprehensive and practical. Consider their budget constraints, time limitations, and personal preferences throughout all recommendations.

CRITICAL: Your response MUST be ONLY a valid JSON object. Do not include any text before or after the JSON. 

Use this exact structure, MAKE SURE there is a comma after each field:

{
  "weatherInfo": {"season": "string", "temperature": "string", "conditions": "string", "humidity": "string", "dayNightTempDifference": "string", "airQuality": "string", "feelsLikeWarning": "string", "recommendations": ["string"]},
  "socialEtiquette": ["string"],
  "safetyTips": ["string"],
  "transportationInfo": {"publicTransport": "string", "creditCardPayment": boolean, "airportTransport": {"airports": [{"name": "string", "code": "string", "distanceToCity": "string", "transportOptions": [{"type": "string", "cost": "string", "duration": "string", "description": "string", "notes": ["string"]}]}]}, "ridesharing": "string", "taxiInfo": {"available": boolean, "averageCost": "string", "tips": ["string"]}},
  "localCurrency": {"currency": "string", "cashNeeded": boolean, "creditCardUsage": "string", "tips": ["string"], "exchangeRate": {"from": "USD", "to": "string", "rate": number, "lastUpdated": "string"}},
  "tipEtiquette": {"restaurants": "string", "bars": "string", "taxis": "string", "hotels": "string", "tours": "string", "general": "string"},
  "tapWaterSafe": {"safe": boolean, "details": "string"}
}

START YOUR RESPONSE WITH { AND END WITH }. NO OTHER TEXT.`;

  return prompt;
}

export function generateCulturalPrompt(request: AITripPlanningRequest): string {
  const { destination, preferences, travelerType } = request;
  const days = parseInt(preferences.duration) || 7;
  
  let prompt = `You are an expert travel planner AI. Create a detailed, personalized travel plan for the following traveler:

DESTINATION: ${destination.name}, ${destination.country}
Destination Description: ${destination.description}
Best Time to Visit: ${destination.bestTime}

TRAVELER PROFILE:
Type: ${travelerType.name} - ${travelerType.description}

TRIP PREFERENCES:
- Time of Year: ${preferences.timeOfYear}
- Duration: ${preferences.duration}
- Budget: ${preferences.budget}
- Accommodation: ${preferences.accommodation}
- Transportation: ${preferences.transportation}
- Wants Restaurant Recommendations: ${preferences.wantRestaurants ? "Yes" : "No"}
- Wants Bar/Nightlife Recommendations: ${preferences.wantBars ? "Yes" : "No"}
- Trip Type: ${preferences.tripType}
- Special Activities Requested: ${preferences.specialActivities}
`;

  // Add traveler type specific preferences
  if (preferences.activityLevel) {
    prompt += `- Activity Level: ${preferences.activityLevel}\n`;
  }
  if (preferences.riskTolerance) {
    prompt += `- Risk Tolerance: ${preferences.riskTolerance}\n`;
  }
  if (preferences.spontaneity) {
    prompt += `- Spontaneity: ${preferences.spontaneity}\n`;
  }
  if (preferences.scheduleDetail) {
    prompt += `- Schedule Detail: ${preferences.scheduleDetail}\n`;
  }
  if (preferences.bookingPreference) {
    prompt += `- Booking Preference: ${preferences.bookingPreference}\n`;
  }
  if (preferences.backupPlans) {
    prompt += `- Backup Plans: ${preferences.backupPlans}\n`;
  }
  if (preferences.luxuryLevel) {
    prompt += `- Luxury Level: ${preferences.luxuryLevel}\n`;
  }
  if (preferences.serviceLevel) {
    prompt += `- Service Level: ${preferences.serviceLevel}\n`;
  }
  if (preferences.exclusivity) {
    prompt += `- Exclusivity: ${preferences.exclusivity}\n`;
  }
  if (preferences.relaxationStyle) {
    prompt += `- Relaxation Style: ${preferences.relaxationStyle}\n`;
  }
  if (preferences.pacePreference) {
    prompt += `- Pace Preference: ${preferences.pacePreference}\n`;
  }
  if (preferences.stressLevel) {
    prompt += `- Stress Level: ${preferences.stressLevel}\n`;
  }


  prompt += `

Please create a comprehensive travel plan that includes ALL of the following detailed sections:

1. LOCAL ACTIVITIES AND EXPERIENCES
    - Destination-specific experiences (cooking classes, cultural workshops, unique tours)
    - Activities that can't be found elsewhere
    - Seasonal or time-sensitive opportunities during their travel dates
    - Specify experience provider type for each activity

2. LOCAL EVENTS DURING TRAVEL TIME
    - Festivals, markets, or special events happening during their visit
    - Cultural celebrations or seasonal events
    - How to participate or attend (e.g. best place to celebrate NYE in Bangkok)

3. EXTENDED HISTORICAL CONTEXT (AROUND 300 WORDS)
    - Comprehensive modern history covering major periods
    - Key historical sites and their significance
    - How history influences current culture and attractions
    - Cultural evolution and modern-day implications
    - Stories and legends that shaped the destination

4. DETAILED DAY-BY-DAY ITINERARY
    - Incorporate all above elements into a practical daily schedule
    - Adjust daily activities based on preferred activity level: ${preferences.activityLevel || "medium"}
    - High activity: 4-6 activities per day
    - Medium activity: 3-4 activities per day  
    - Low activity: 2-3 activities per day
    - Consider travel time between locations
    - Balance must-see attractions with authentic local experiences
    - ENSURE number of days aligns with trip duration, and include AT LEAST FOUR (4) days of activities

Focus on creating authentic experiences that match their travel style while being comprehensive and practical. Consider their budget constraints, time limitations, and personal preferences throughout all recommendations.

CRITICAL: Your response MUST be ONLY ONE valid JSON object. Do not include any text before or after the JSON. 

Use this exact structure, MAKE SURE there is a comma after each field:

{
  "activities": [{"name": "string", "type": "string", "description": "string", "duration": "string", "localSpecific": boolean, "experienceType": "airbnb|getyourguide|viator|other"}],
  "localEvents": [{"name": "string", "type": "string", "description": "string", "dates": "string", "location": "string"}],
  "history": "string",
  "itinerary": [{"day": number, "title": "string", "activities": [{"time": "string", "title": "string", "description": "string", "location": "string", "icon": "string"}]}]
}

Ensure itinerary has at least ${days} days. START YOUR RESPONSE WITH { AND END WITH }. NO OTHER TEXT.`;

  return prompt;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let chunkParam: string | null = null;
  
  try {
    const url = new URL(request.url);
    chunkParam = url.searchParams.get('chunk');
    
    console.log(`[Chunked API] ${chunkParam ? `Chunk ${chunkParam}` : 'Session init'} request`);
    
    const body: AITripPlanningRequest = await request.json();

    if (!body.destination || !body.travelerType || !body.preferences) {
      console.error('[Chunked API] Missing required fields:', {
        hasDestination: !!body.destination,
        hasTravelerType: !!body.travelerType,
        hasPreferences: !!body.preferences,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const config = getAIConfig();
    
    // If specific chunk requested
    if (chunkParam) {
      const chunkId = parseInt(chunkParam);
      const chunk = TRAVEL_PLAN_CHUNKS.find(c => c.id === chunkId);
      
      if (!chunk) {
        console.error(`[Chunked API] Invalid chunk ID: ${chunkId}`);
        return NextResponse.json(
          { error: "Invalid chunk ID", validChunks: TRAVEL_PLAN_CHUNKS.map(c => c.id) },
          { status: 400 }
        );
      }

      console.log(`[Chunked API] Generating ${chunk.section} for ${body.destination.name}`);
      
      const prompt = chunk.prompt(body);
      const modelLimit = getModelTokenLimit(config.model || 'gpt-4');
      const maxTokens = calculateMaxTokensForRequest(prompt, modelLimit, config.provider as 'openai' | 'anthropic');
      
      let aiResponse: string;
      try {
        aiResponse = await callAI(prompt, Math.min(maxTokens, config.chunkTokenLimit || 4000));
        console.log(`[Chunked API] AI response received for chunk ${chunkId}, length: ${aiResponse.length} chars`);
      } catch (aiError) {
        console.error(`[Chunked API] AI call failed for chunk ${chunkId}:`, aiError);
        throw aiError;
      }
      
      // Parse response
      let cleanResponse = aiResponse.trim();
      if (cleanResponse.startsWith("```json")) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanResponse.startsWith("```")) {
        cleanResponse = cleanResponse.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanResponse);
        console.log(`[Chunked API] Successfully parsed JSON for chunk ${chunkId}`);
      } catch (parseError) {
        console.error(`[Chunked API] JSON parsing failed for chunk ${chunkId}:`, {
          error: parseError,
          responsePreview: cleanResponse.substring(0, 200),
          responseLength: cleanResponse.length
        });
        throw new Error(`Invalid JSON in chunk ${chunkId}: ${parseError}`);
      }

      console.log(`[Chunked API] Chunk ${chunkId} completed successfully`);

      const response: ChunkedAIResponse = {
        chunk: {
          chunkId,
          totalChunks: TRAVEL_PLAN_CHUNKS.length,
          section: chunk.section,
          description: chunk.description
        },
        data: parsedResponse,
        isComplete: false // Individual chunks are never complete by themselves
      };

      return NextResponse.json(response);
    }

    // Return chunk information for client to request individual chunks
    return NextResponse.json({
      chunks: TRAVEL_PLAN_CHUNKS.map(chunk => ({
        id: chunk.id,
        section: chunk.section,
        description: chunk.description
      })),
      totalChunks: TRAVEL_PLAN_CHUNKS.length
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorInfo = {
      chunkId: chunkParam,
      duration,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    
    console.error('[Chunked API] Request failed:', errorInfo);
    
    return NextResponse.json(
      {
        error: "Failed to generate chunked trip plan",
        details: error instanceof Error ? error.message : String(error),
        chunkId: chunkParam,
      },
      { status: 500 }
    );
  }
}