import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { aiTripPlanningService } from "../aiTripPlanningService";
import {
  mockTravelerTypes,
  mockDestinations,
  mockDestinationKnowledge,
  mockPickDestinationPreferences,
  mockTripPreferences,
  resetMocks,
} from "../../test/mocks";
import { generateTravelPlan } from "../../data/mock/travelData";

describe("aiTripPlanningService", () => {
  beforeEach(() => {
    resetMocks();

    // Create a mock travel plan
    const mockDestination = mockDestinations.tokyo || {
      id: "tokyo",
      name: "Tokyo",
      country: "Japan",
      description: "Perfect blend of traditional culture and modern innovation",
      image: "/images/tokyo.jpg",
      highlights: [
        {
          name: "Ancient temples",
          description: "Historic shrines and temples",
        },
        { name: "Cherry blossoms", description: "Beautiful sakura season" },
      ],
      bestTimeToVisit: "Spring",
      estimatedCost: "$$",
      keyActivities: ["Temple visits", "Cherry blossom viewing"],
      matchReason: "Perfect for culture enthusiasts",
    };

    const mockPlan = generateTravelPlan(
      mockDestination,
      mockTripPreferences,
      mockTravelerTypes.culture,
    );

    const mockResponse = {
      plan: mockPlan,
      reasoning:
        "Generated a comprehensive travel plan based on your preferences",
      confidence: 0.9,
      personalizations: [
        "Customized for culture traveler",
        "Mid-range budget activities",
      ],
    };

    // Mock the chunked session initialization
    const mockSession = {
      sessionId: "test-session-123",
      chunks: [
        { id: 1, section: "places", description: "Places to visit and hotels" },
        { id: 2, section: "food", description: "Restaurants and bars" },
        {
          id: 3,
          section: "info",
          description: "Weather, safety and transport",
        },
        {
          id: 4,
          section: "activities",
          description: "Activities and itinerary",
        },
      ],
      totalChunks: 4,
    };

    // Mock the individual chunk responses - chunk 4 contains the complete plan as per service logic
    const mockChunkData = {
      1: {
        placesToVisit: mockPlan.placesToVisit,
        hotelRecommendations: mockPlan.hotelRecommendations,
        neighborhoods: mockPlan.neighborhoods,
      },
      2: {
        restaurants: mockPlan.restaurants,
        bars: mockPlan.bars,
        mustTryFood: mockPlan.mustTryFood,
      },
      3: {
        weatherInfo: mockPlan.weatherInfo,
        safetyTips: mockPlan.safetyTips,
        transportationInfo: mockPlan.transportationInfo,
        localCurrency: mockPlan.localCurrency,
        socialEtiquette: mockPlan.socialEtiquette,
        tipEtiquette: mockPlan.tipEtiquette,
        tapWaterSafe: mockPlan.tapWaterSafe,
      },
      4: mockPlan, // Complete plan in the final chunk as per service implementation
    };

    globalThis.fetch = jest.fn().mockImplementation((url: string) => {
      if (
        url.includes("/api/ai/trip-planning/chunked") &&
        !url.includes("?chunk=")
      ) {
        // Initialize chunked session
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSession),
        });
      } else if (url.includes("?chunk=")) {
        // Return specific chunk
        const chunkId = parseInt(url.match(/chunk=(\d+)/)?.[1] || "1");
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              chunk: mockSession.chunks.find((c) => c.id === chunkId),
              data: mockChunkData[chunkId as keyof typeof mockChunkData] || {},
              isComplete: chunkId === 4,
              sessionId: "test-session-123",
            }),
        });
      }

      // Fallback for any other requests
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });
    });
  });

  describe("generateTravelPlan", () => {
    const baseRequest = {
      destination: mockDestinations.tokyo || {
        id: "tokyo",
        name: "Tokyo",
        country: "Japan",
        description:
          "Perfect blend of traditional culture and modern innovation",
        image: "/images/tokyo.jpg",
        highlights: [
          {
            name: "Ancient temples",
            description: "Historic shrines and temples",
          },
          { name: "Cherry blossoms", description: "Beautiful sakura season" },
        ],
        bestTimeToVisit: "Spring",
        estimatedCost: "$$",
        keyActivities: ["Temple visits", "Cherry blossom viewing"],
        matchReason: "Perfect for culture enthusiasts",
      },
      preferences: mockTripPreferences,
      travelerType: mockTravelerTypes.culture,
    };

    it("should generate a complete travel plan", async () => {
      const response =
        await aiTripPlanningService.generateTravelPlan(baseRequest);

      expect(response).toBeDefined();
      expect(response.plan).toBeDefined();
      expect(response.reasoning).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0.8);
      expect(response.personalizations).toBeInstanceOf(Array);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/ai/trip-planning/chunked",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(baseRequest),
        },
      );
    });

    it("should include all required plan components", async () => {
      const response =
        await aiTripPlanningService.generateTravelPlan(baseRequest);

      const { plan } = response;

      expect(plan.placesToVisit).toBeInstanceOf(Array);
      expect(plan.restaurants).toBeInstanceOf(Array);
      expect(plan.bars).toBeInstanceOf(Array);
      expect(plan.weatherInfo).toBeDefined();
      expect(plan.socialEtiquette).toBeInstanceOf(Array);
      expect(plan.hotelRecommendations).toBeDefined();
      expect(plan.transportationInfo).toBeDefined();
      expect(plan.localCurrency).toBeDefined();
      expect(plan.activities).toBeInstanceOf(Array);
      expect(plan.itinerary).toBeInstanceOf(Array);
      expect(plan.mustTryFood).toBeDefined();
      expect(plan.mustTryFood.items).toBeInstanceOf(Array);
      expect(plan.safetyTips).toBeInstanceOf(Array);
      expect(plan.tipEtiquette).toBeDefined();
      expect(plan.tapWaterSafe).toBeDefined();
    });

    it("should include destination knowledge in planning", async () => {
      const requestWithKnowledge = {
        ...baseRequest,
        destinationKnowledge: mockDestinationKnowledge,
        pickDestinationPreferences: mockPickDestinationPreferences,
      };

      const response =
        await aiTripPlanningService.generateTravelPlan(requestWithKnowledge);

      expect(response).toBeDefined();
      expect(response.plan).toBeDefined();
      expect(response.reasoning).toBeDefined();
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/ai/trip-planning/chunked",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestWithKnowledge),
        },
      );
    });

    it("should handle API errors gracefully", async () => {
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: () => Promise.resolve({ error: "Server error" }),
      });

      await expect(
        aiTripPlanningService.generateTravelPlan(baseRequest),
      ).rejects.toThrow(
        "Failed to initialize chunked session: Internal Server Error",
      );
    });

    it("should handle network errors gracefully", async () => {
      globalThis.fetch = jest
        .fn()
        .mockRejectedValue(new Error("Network error"));

      await expect(
        aiTripPlanningService.generateTravelPlan(baseRequest),
      ).rejects.toThrow("Network error");
    });

    it("should return valid itinerary structure", async () => {
      const response =
        await aiTripPlanningService.generateTravelPlan(baseRequest);

      response.plan.itinerary.forEach((day) => {
        expect(day).toHaveProperty("day");
        expect(day).toHaveProperty("title");
        expect(day).toHaveProperty("activities");
        expect(day.activities).toBeInstanceOf(Array);

        day.activities.forEach((activity) => {
          expect(activity).toHaveProperty("time");
          expect(activity).toHaveProperty("title");
          expect(activity).toHaveProperty("description");
          expect(activity).toHaveProperty("location");
          expect(activity).toHaveProperty("icon");
        });
      });
    });

    it("should return valid restaurant structure", async () => {
      const response =
        await aiTripPlanningService.generateTravelPlan(baseRequest);

      response.plan.restaurants.forEach((restaurant) => {
        expect(restaurant).toHaveProperty("name");
        expect(restaurant).toHaveProperty("cuisine");
        expect(restaurant).toHaveProperty("priceRange");
        expect(restaurant).toHaveProperty("description");
      });
    });

    it("should return confidence score in valid range", async () => {
      const response =
        await aiTripPlanningService.generateTravelPlan(baseRequest);

      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it("should include destination in the plan response", async () => {
      const response =
        await aiTripPlanningService.generateTravelPlan(baseRequest);

      expect(response.plan.destination).toBeDefined();
      expect(response.plan.destination.name).toBe(baseRequest.destination.name);
      expect(response.plan.destination.country).toBe(
        baseRequest.destination.country,
      );
      expect(response.plan.destination.id).toBe(baseRequest.destination.id);
    });
  });
});
