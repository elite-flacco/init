import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";
import { aiDestinationService } from "../aiDestinationService";
import {
  mockTravelerTypes,
  mockDestinationKnowledge,
  mockPickDestinationPreferences,
  resetMocks,
} from "../../test/mocks";
import { destinations } from "../../data/mock/destinations";

// Type declaration for Node.js global
declare const global: typeof globalThis & { fetch: typeof globalThis.fetch };

// Add global.fetch mock for Node.js environment
beforeAll(() => {
  global.fetch = vi.fn();
});

describe("aiDestinationService", () => {
  beforeEach(() => {
    resetMocks();
    // Mock successful API response
    const mockResponse = {
      destinations: destinations.slice(0, 3),
      reasoning: "Perfect destinations for your travel style",
      confidence: 0.9,
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });
  });

  describe("getDestinationRecommendations", () => {
    it("should return recommendations for explorer traveler type", async () => {
      const request = {
        travelerType: mockTravelerTypes.explorer,
        destinationKnowledge: {
          type: "yes" as const,
          label: "Test Destination",
          description: "Test description",
        },
      };

      const response =
        await aiDestinationService.getDestinationRecommendations(request);

      expect(response).toBeDefined();
      expect(response.destinations).toBeInstanceOf(Array);
      expect(response.destinations.length).toBeGreaterThan(0);
      expect(response.confidence).toBeGreaterThan(0.8);
      expect(response.confidence).toBeLessThanOrEqual(1);
      expect(global.fetch).toHaveBeenCalledWith("/api/ai/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
    });

    it("should return recommendations with preferences", async () => {
      const request = {
        travelerType: mockTravelerTypes.culture,
        preferences: mockPickDestinationPreferences,
        destinationKnowledge: mockDestinationKnowledge,
      };

      const response =
        await aiDestinationService.getDestinationRecommendations(request);

      expect(response).toBeDefined();
      expect(response.destinations).toBeInstanceOf(Array);
      expect(response.reasoning).toBeDefined();
      expect(global.fetch).toHaveBeenCalledWith("/api/ai/destinations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
    });

    it("should handle API errors gracefully", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const request = {
        travelerType: mockTravelerTypes.explorer,
        destinationKnowledge: {
          type: "yes" as const,
          label: "Test Destination",
          description: "Test description",
        },
      };

      await expect(
        aiDestinationService.getDestinationRecommendations(request),
      ).rejects.toThrow("Failed to get destination recommendations");
    });

    it("should handle network errors gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      const request = {
        travelerType: mockTravelerTypes.explorer,
        destinationKnowledge: {
          type: "yes" as const,
          label: "Test Destination",
          description: "Test description",
        },
      };

      await expect(
        aiDestinationService.getDestinationRecommendations(request),
      ).rejects.toThrow("Network error");
    });

    it("should validate response structure", async () => {
      const request = {
        travelerType: mockTravelerTypes.culture,
        destinationKnowledge: {
          type: "yes" as const,
          label: "Test Destination",
          description: "Test description",
        },
      };

      const response =
        await aiDestinationService.getDestinationRecommendations(request);

      response.destinations.forEach((destination) => {
        expect(destination).toHaveProperty("id");
        expect(destination).toHaveProperty("name");
        expect(destination).toHaveProperty("country");
        expect(destination).toHaveProperty("description");
        expect(destination).toHaveProperty("image");
        expect(destination).toHaveProperty("highlights");
        expect(destination).toHaveProperty("bestTimeToVisit");
        expect(destination).toHaveProperty("estimatedCost");
      });
    });
  });
});
