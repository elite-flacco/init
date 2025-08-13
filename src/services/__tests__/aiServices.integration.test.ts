import { describe, it, expect, beforeEach, vi } from "vitest";
import { aiDestinationService } from "../aiDestinationService";
import { aiTripPlanningService } from "../aiTripPlanningService";
import {
  mockTravelerTypes,
  mockDestinations,
  mockTripPreferences,
  resetMocks,
  mockDestinationKnowledge,
} from "../../test/mocks";
import { destinations } from "../../data/mock/destinations";
import { generateTravelPlan } from "../../data/mock/travelData";

describe("AI Services Integration", () => {
  beforeEach(() => {
    resetMocks();
  });

  describe("aiDestinationService", () => {
    it("should return valid recommendations", async () => {
      const mockResponse = {
        destinations: destinations.slice(0, 3),
        reasoning: "Perfect destinations for your travel style",
        confidence: 0.9,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const request = {
        travelerType: mockTravelerTypes.culture,
        destinationKnowledge: {
          type: "yes" as const,
          label: "I know where I want to go",
          description: "I have a specific destination in mind",
        },
      };

      const response =
        await aiDestinationService.getDestinationRecommendations(request);

      expect(response).toBeDefined();
      expect(response.destinations).toBeInstanceOf(Array);
      expect(response.destinations.length).toBeGreaterThan(0);
      expect(response.reasoning).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.confidence).toBeLessThanOrEqual(1);
    });

    it("should filter destinations by traveler type", async () => {
      const mockResponse = {
        destinations: destinations.slice(0, 2),
        reasoning: "Adventure destinations for your travel style",
        confidence: 0.85,
      };

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const adventureRequest = {
        travelerType: mockTravelerTypes.adventure,
        destinationKnowledge: {
          type: "no-clue" as const,
          label: "No idea where to go",
          description: "I want help choosing a destination",
        },
      };

      const response =
        await aiDestinationService.getDestinationRecommendations(
          adventureRequest,
        );

      expect(response.destinations).toBeInstanceOf(Array);
      expect(response.destinations.length).toBeGreaterThan(0);
    });
  });

  describe("aiTripPlanningService", () => {
    it("should generate complete travel plan", async () => {
      const mockDestination = mockDestinations.tokyo || destinations[0];
      const mockPlan = generateTravelPlan(
        mockDestination,
        mockTripPreferences,
        mockTravelerTypes.culture,
      );

      const mockResponse = {
        plan: mockPlan,
        reasoning: "Generated comprehensive travel plan",
        confidence: 0.9,
        personalizations: ["Customized for culture traveler"],
      };

      // Mock the chunked API calls
      const mockSession = {
        sessionId: "test-session-123",
        chunks: [
          { id: 1, section: "places", description: "Places to visit and hotels" },
          { id: 2, section: "food", description: "Restaurants and bars" },
          { id: 3, section: "info", description: "Weather, safety and transport" },
          { id: 4, section: "activities", description: "Activities and itinerary" }
        ],
        totalChunks: 4
      };

      globalThis.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/ai/trip-planning/chunked') && !url.includes('?chunk=')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSession),
          });
        } else if (url.includes('?chunk=4')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              chunk: mockSession.chunks.find(c => c.id === 4),
              data: mockPlan, // Complete plan in the final chunk
              isComplete: true,
              sessionId: "test-session-123"
            }),
          });
        } else if (url.includes('?chunk=')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              chunk: mockSession.chunks.find(c => c.id === parseInt(url.match(/chunk=(\d+)/)?.[1] || '1')),
              data: {},
              isComplete: false,
              sessionId: "test-session-123"
            }),
          });
        }
        
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });
      });

      const request = {
        destination: mockDestination,
        preferences: mockTripPreferences,
        travelerType: mockTravelerTypes.culture,
      };

      const response = await aiTripPlanningService.generateTravelPlan(request);

      expect(response).toBeDefined();
      expect(response.plan).toBeDefined();
      expect(response.reasoning).toBeDefined();
      expect(response.confidence).toBeGreaterThan(0);
      expect(response.personalizations).toBeInstanceOf(Array);

      // Verify plan structure
      expect(response.plan.itinerary).toBeInstanceOf(Array);
      expect(response.plan.restaurants).toBeInstanceOf(Array);
      expect(response.plan.placesToVisit).toBeInstanceOf(Array);
    });
  });

  describe("Error handling", () => {
    it("should handle network errors gracefully", async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const destinationRequest = {
        travelerType: mockTravelerTypes.culture,
        destinationKnowledge: mockDestinationKnowledge,
      };

      const tripRequest = {
        destination: mockDestinations.tokyo || destinations[0],
        preferences: mockTripPreferences,
        travelerType: mockTravelerTypes.culture,
      };

      // These should throw errors
      await expect(
        aiDestinationService.getDestinationRecommendations(destinationRequest),
      ).rejects.toThrow("Network error");

      await expect(
        aiTripPlanningService.generateTravelPlan(tripRequest),
      ).rejects.toThrow("Network error");
    }, 10000); // Increase timeout to 10 seconds for this test
  });
});
