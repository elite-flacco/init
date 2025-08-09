import { NextRequest, NextResponse } from "next/server";
import {
  TravelerType,
  Destination,
  TripPreferences,
} from "../../../../src/types/travel";
import { getAIConfig } from "../config";
import { generateDevMockData } from "../../../../src/data/mock/travelData";

export interface AITripPlanningRequest {
  destination: Destination;
  travelerType: TravelerType;
  preferences: TripPreferences;
}

async function callAI(prompt: string): Promise<string> {
  const config = getAIConfig();
  const { provider, apiKey } = config;

  if (provider === "mock") {
    // Mock response for development
    await new Promise((resolve) => setTimeout(resolve, 30000));
    const mockData = generateDevMockData();
    return JSON.stringify(mockData.response.plan);
  }

  // Real AI API calls
  if (provider === "openai") {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout

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
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout

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

function getRestaurantCount(preferences: TripPreferences): string {
  const baseDays = parseInt(preferences.duration) || 7;
  return Math.ceil(baseDays * 4).toString();
}

function getBarCount(preferences: TripPreferences): string {
  const baseDays = parseInt(preferences.duration) || 7;
  return Math.ceil(baseDays * 2).toString();
}

function getPlacesCount(preferences: TripPreferences): string {
  const baseDays = parseInt(preferences.duration) || 7;
  const activityMultiplier =
    preferences.activityLevel === "high"
      ? 4
      : preferences.activityLevel === "low"
        ? 2
        : 3;
  return Math.ceil(baseDays * activityMultiplier).toString();
}

function generateTripPlanningPrompt(request: AITripPlanningRequest): string {
  const { destination, travelerType, preferences } = request;

  let prompt = `You are an expert travel planner AI. Create a detailed, personalized travel plan for the following traveler:

DESTINATION: ${destination.name}, ${destination.country}
Destination Description: ${destination.description}
Best Time to Visit: ${destination.bestTime}
Typical Budget: ${destination.budget}

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
   - Adjust number of attractions based on trip length and activity level: ${getPlacesCount(preferences)} recommendations
   - Main attractions categorized by type (cultural, historical, natural, entertainment, etc.)
   - Include priority ranking for each attraction based on user preferences and general popularity
   - For each place, include ticket booking information: whether tickets are required or recommended, booking advice (e.g. "Book at least 2 weeks in advance during peak season"), peak time DURING THE DAY (e.g. early morning, late afternoon), average wait times to get in

2. NEIGHBORHOOD BREAKDOWNS (3-5 MOST POPULAR NEIGHBORHOODS)
   - Summary of 3-5 most popular neighborhoods with their unique vibes
   - Pros and cons of each neighborhood for travelers, especially in terms of accommodation and food options, location (whether it's close to major attractions), touristy v.s. local, safety, accessibility
   - Best neighborhoods for different types of activities
   - What makes each neighborhood unique and worth visiting, include this in the summary
   - One-liner suggestion on best for, e.g. "Best for first-timers" or "Best for families"

3. HOTEL RECOMMENDATIONS
   - For each neighborhood listed above, provide EXACTLY THREE (3) separate and distinct accommodation options
   - Each option must match the traveler's accommodation type preference (${preferences.accommodation}) and budget (${preferences.budget})
   - For each of the 3 options per neighborhood, include: name, amenities, price range, and detailed descriptions
   - Include link to Airbnb listing if applicable (for Airbnb preferences)
   - CRITICAL: You must provide 3 different accommodation options for EACH neighborhood - do not provide only 1 option per neighborhood

4. RESTAURANT RECOMMENDATIONS
   - Adjust number based on trip length and activity level: ${getRestaurantCount(preferences)} recommendations
   - Include AT LEAST FIVE (5) restaurants per neighborhood 
   - Vary by cuisine type, price range, and neighborhood
   - Include specific dishes to try at each restaurant
   - Include if reservations are recommended / required - "Yes" or "No"

5. BAR/NIGHTLIFE RECOMMENDATIONS
   - Adjust the number of bars based on trip length and activity level: ${getBarCount(preferences)} recommendations
   - Only return data if traveler's preference for "Wants Bar/Nightlife Recommendations" is "Yes"
   - Categorize by type: beer bars, wine bars, cocktail lounges, dive bars
   - Include atmosphere descriptions and what makes each unique
   - Match to traveler's nightlife preferences
   - Include neighborhood of each bar

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
   - For each airport, include: distance to city center, ALL transportation options (including train, bus, taxi, rideshare)with cost, duration, and important notes/warnings (e.g., "be careful with unofficial taxis")
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

12. LOCAL ACTIVITIES AND EXPERIENCES
    - Destination-specific experiences (cooking classes, cultural workshops, unique tours)
    - Activities that can't be found elsewhere
    - Seasonal or time-sensitive opportunities during their travel dates
    - Specify experience provider type for each activity

13. MUST-TRY LOCAL FOOD AND DRINK
    - Provide most quintessential food items as structured objects with names, descriptions, and categories
    - Include main dishes, desserts, drinks, and snacks with specific descriptions
    - Add where to find each item and price ranges when relevant

14. TAP WATER SAFETY
    - Is tap water safe to drink?

15. LOCAL EVENTS DURING TRAVEL TIME
    - Festivals, markets, or special events happening during their visit
    - Cultural celebrations or seasonal events
    - How to participate or attend (e.g. best place to celebrate NYE in Bangkok)

16. EXTENDED HISTORICAL CONTEXT (AROUND 300 WORDS)
    - Comprehensive modern history covering major periods
    - Key historical sites and their significance
    - How history influences current culture and attractions
    - Cultural evolution and modern-day implications
    - Stories and legends that shaped the destination

17. DETAILED DAY-BY-DAY ITINERARY
    - Incorporate all above elements into a practical daily schedule
    - Adjust daily activities based on preferred activity level: ${preferences.activityLevel || "medium"}
    - High activity: 4-6 activities per day
    - Medium activity: 3-4 activities per day  
    - Low activity: 2-3 activities per day
    - Consider travel time between locations
    - Balance must-see attractions with authentic local experiences
    - ENSURE number of days aligns with trip duration

Focus on creating authentic experiences that match their travel style while being comprehensive and practical. Consider their budget constraints, time limitations, and personal preferences throughout all recommendations.

CRITICAL: Your response MUST be ONLY a valid JSON object. Do not include any text before or after the JSON. 

Use this exact structure, MAKE SURE there is a comma after each field:

{
  "placesToVisit": [{"name": "string", "description": "string", "category": "string", "priority": number, "ticketInfo": {"required": boolean, "recommended": boolean, "bookingAdvice": "string", "peakTime": ["string"], "averageWaitTime": "string"}}],
  "neighborhoods": [{"name": "string", "summary": "string", "vibe": "string", "pros": ["string"], "cons": ["string"]}],
  "hotelRecommendations": [{"name": "string", "neighborhood": "string", "priceRange": "string", "description": "string", "amenities": ["string"], "airbnbLink": "string"}],
  "restaurants": [{"name": "string", "cuisine": "string", "priceRange": "string", "description": "string", "neighborhood": "string", "specialDishes": ["string"], "reservationsRecommended": "string"}],
  "bars": [{"name": "string", "type": "string", "atmosphere": "string", "description": "string", "category": "string", "neighborhood": "string"}],
  "weatherInfo": {"season": "string", "temperature": "string", "conditions": "string", "humidity": "string", "dayNightTempDifference": "string", "airQuality": "string", "feelsLikeWarning": "string", "recommendations": ["string"]},
  "socialEtiquette": ["string"],
  "safetyTips": ["string"],
  "transportationInfo": {"publicTransport": "string", "creditCardPayment": boolean, "airportTransport": {"airports": [{"name": "string", "code": "string", "distanceToCity": "string", "transportOptions": [{"type": "string", "cost": "string", "duration": "string", "description": "string", "notes": ["string"]}]}]}, "ridesharing": "string", "taxiInfo": {"available": boolean, "averageCost": "string", "tips": ["string"]}},
  "localCurrency": {"currency": "string", "cashNeeded": boolean, "creditCardUsage": "string", "tips": ["string"], "exchangeRate": {"from": "USD", "to": "string", "rate": number, "lastUpdated": "string"}},
  "tipEtiquette": {"restaurants": "string", "bars": "string", "taxis": "string", "hotels": "string", "tours": "string", "general": "string"},
  "activities": [{"name": "string", "type": "string", "description": "string", "duration": "string", "localSpecific": boolean, "experienceType": "airbnb|getyourguide|viator|other"}],
  "mustTryFood": {"items": [{"name": "string", "description": "string", "category": "main|dessert|drink|snack", "whereToFind": "string", "priceRange": "string"}]},
  "tapWaterSafe": {"safe": boolean, "details": "string"},
  "localEvents": [{"name": "string", "type": "string", "description": "string", "dates": "string", "location": "string"}],
  "history": "string",
  "itinerary": [{"day": number, "title": "string", "activities": [{"time": "string", "title": "string", "description": "string", "location": "string", "icon": "string"}]}]
}

START YOUR RESPONSE WITH { AND END WITH }. NO OTHER TEXT.`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const body: AITripPlanningRequest = await request.json();

    if (!body.destination || !body.travelerType || !body.preferences) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const prompt = generateTripPlanningPrompt(body);

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

    const parsedResponse = JSON.parse(cleanResponse);

    // Wrap the response in the expected AITripPlanningResponse format
    const wrappedResponse = {
      plan: {
        destination: body.destination, // Include the destination from the request
        ...parsedResponse,
      },
      reasoning:
        "AI-generated travel plan based on your preferences and destination",
      confidence: 0.9,
      personalizations: [
        `Customized for ${body.travelerType.name} traveler type`,
        `Tailored to ${body.preferences.budget} budget`,
        `Optimized for ${body.preferences.duration} trip duration`,
      ],
    };

    return NextResponse.json(wrappedResponse);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate trip plan",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
