import { describe, it, expect } from "vitest";
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
    const { getAIConfig } = await import("../../config/ai");
    const config = getAIConfig();

    expect(config).toBeDefined();
    expect(config.provider).toBe("mock");
    expect(config.model).toBe("gpt-4");
  });
});
