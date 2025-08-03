import { vi } from "vitest";
import {
  Destination,
  PickDestinationPreferences,
  TripPreferences,
  DestinationKnowledge,
} from "../types/travel";
import { destinations } from "../data/mock/destinations";
import { travelerTypesLookup } from "../data/mock/travelerTypes";
import { generateTravelPlan } from "../data/mock/travelData";

// Re-export centralized mock data for tests
export const mockTravelerTypes = travelerTypesLookup;

// Use centralized destinations and convert to lookup object
export const mockDestinations: Record<string, Destination> =
  destinations.reduce(
    (acc, dest) => {
      acc[dest.id] = dest;
      return acc;
    },
    {} as Record<string, Destination>,
  );

export const mockDestinationKnowledge: DestinationKnowledge = {
  type: "no-clue",
  label: "No idea where to go",
  description: "I want help choosing a destination",
};

export const mockPickDestinationPreferences: PickDestinationPreferences = {
  timeOfYear: "Summer",
  duration: "7 days",
  budget: "mid-range",
  tripType: "cultural",
  destinationType: "city",
  specialActivities: "museums and historical sites",
  weather: "warm",
  priority: "authentic experiences",
};

export const mockTripPreferences: TripPreferences = {
  timeOfYear: "Summer",
  duration: "7 days",
  budget: "mid-range",
  activities: ["sightseeing", "food"],
  accommodation: "hotel",
  transportation: "public transport",
  wantRestaurants: true,
  wantBars: false,
  tripType: "cultural",
  activityLevel: "moderate",
  riskTolerance: "low",
  spontaneity: "planned",
};

// Generate dynamic AI response using centralized mock data
function generateMockAIResponse() {
  const mockDestination = destinations[0]; // Use first destination
  const mockTravelerType = mockTravelerTypes.culture;
  const mockPreferences = mockTripPreferences;

  const travelPlan = generateTravelPlan(
    mockDestination,
    mockPreferences,
    mockTravelerType,
  );

  // Create the complete response structure expected by the trip planning service
  const tripPlanningResponse = {
    plan: travelPlan,
    reasoning: `Generated a comprehensive travel plan for ${mockDestination.name} based on your ${mockTravelerType.name} travel style and preferences.`,
    confidence: 0.9,
    personalizations: [
      `Customized for ${mockTravelerType.name} travel style`,
      `${mockPreferences.budget} budget accommodations and activities`,
      `${mockPreferences.activityLevel} activity level itinerary`,
    ],
  };

  return {
    openai: {
      choices: [
        {
          message: {
            content: JSON.stringify(tripPlanningResponse),
          },
        },
      ],
    },
    anthropic: {
      content: [
        {
          text: JSON.stringify(tripPlanningResponse),
        },
      ],
    },
  };
}

export const mockAIResponse = generateMockAIResponse();

// Helper function to create mock fetch responses
export const mockFetchResponse = (data: unknown, ok = true, status = 200) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  } as Response);
};

// Reset all mocks
export const resetMocks = () => {
  vi.clearAllMocks();
  if (
    global.fetch &&
    typeof (global.fetch as { mockReset?: () => void }).mockReset === "function"
  ) {
    (global.fetch as { mockReset: () => void }).mockReset();
  }
};
