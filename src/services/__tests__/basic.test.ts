import { describe, it, expect } from "@jest/globals";
import {
  mockTravelerTypes,
  mockDestinations,
  mockTripPreferences,
} from "../../test/mocks";

describe("Basic Service Tests", () => {
  it("should have valid mock data", () => {
    expect(mockTravelerTypes.culture).toBeDefined();
    expect(mockTravelerTypes.culture.id).toBe("culture");
    expect(mockTravelerTypes.culture.name).toBe("Typical Overthinker");

    expect(mockDestinations.tokyo).toBeDefined();
    expect(mockDestinations.tokyo.id).toBe("tokyo");
    expect(mockDestinations.tokyo.name).toBe("Tokyo");

    expect(mockTripPreferences.duration).toBe("7 days");
    expect(mockTripPreferences.budget).toBe("mid-range");
  });

  it("should import AI services without errors", async () => {
    const destinationService = await import("../aiDestinationService");
    const tripPlanningService = await import("../aiTripPlanningService");

    expect(destinationService.aiDestinationService).toBeDefined();
    expect(tripPlanningService.aiTripPlanningService).toBeDefined();
  });

  it("should have valid AI config", async () => {
    const { getAIConfig } = await import("../../../app/api/ai/config");
    const config = getAIConfig();

    expect(config).toBeDefined();
    expect(config.provider).toBe("mock");
    expect(config.model).toBe("gpt-4");
    expect(config.enableChunking).toBe(true);
    expect(config.chunkTokenLimit).toBe(4000);
    expect(config.maxChunks).toBe(4);
  });
});
