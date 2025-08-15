import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase admin with proper method chaining
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq, single: mockSingle }));
const mockInsert = vi.fn(() => ({ error: null }));
const mockDelete = vi.fn(() => ({
  eq: vi.fn(() => ({ error: null })),
  lt: vi.fn(() => ({
    select: vi.fn(() => ({ data: [], error: null })),
  })),
}));
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  select: mockSelect,
  delete: mockDelete,
}));

vi.mock("../../lib/supabase", () => ({
  supabaseAdmin: {
    from: mockFrom,
  },
}));

const mockPlanInput = {
  id: "test-123",
  destination: {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    description: "Amazing city",
    image: "test.jpg",
    highlights: ["temples"],
    bestTime: "Spring",
    budget: "$100/day",
  },
  travelerType: {
    id: "culture",
    name: "Culture Explorer",
    description: "Loves culture",
    icon: "🏛️",
    showPlaceholder: false,
  },
  aiResponse: {
    plan: {
      destination: {
        id: "tokyo",
        name: "Tokyo",
        country: "Japan",
        description: "Amazing city",
        image: "test.jpg",
        highlights: ["temples"],
        bestTime: "Spring",
        budget: "$100/day",
      },
      neighborhoods: [],
      hotelRecommendations: [],
      placesToVisit: [],
      restaurants: [],
      bars: [],
      activities: [],
      itinerary: [],
      weatherInfo: {},
      transportationInfo: {},
      localCurrency: {},
      tipEtiquette: {
        restaurants: "",
        bars: "",
        taxis: "",
        hotels: "",
        tours: "",
        general: "",
      },
      tapWaterSafe: { safe: true, details: "" },
      socialEtiquette: [],
      safetyTips: [],
      mustTryFood: { items: [] },
      localEvents: [],
      history: "",
    },
    reasoning: "Great plan",
    confidence: 0.9,
    personalizations: [],
  },
  expiresAt: "2024-02-01T00:00:00Z",
};

const mockDbRow = {
  id: "test-123",
  destination: mockPlanInput.destination,
  traveler_type: mockPlanInput.travelerType,
  ai_response: mockPlanInput.aiResponse,
  created_at: "2024-01-01T00:00:00Z",
  expires_at: "2030-01-01T00:00:00Z", // Future date so it doesn't expire
};

describe("SharedPlanService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSharedPlan", () => {
    it("should create shared plan successfully", async () => {
      mockInsert.mockReturnValue({ error: null });

      const { SharedPlanService } = await import("../sharedPlanService");
      const result = await SharedPlanService.createSharedPlan(mockPlanInput);

      expect(result).toMatchObject({
        id: "test-123",
        destination: mockPlanInput.destination,
        travelerType: mockPlanInput.travelerType,
        aiResponse: mockPlanInput.aiResponse,
        expiresAt: mockPlanInput.expiresAt,
      });
      expect(result).toHaveProperty("createdAt");
      expect(mockFrom).toHaveBeenCalledWith("shared_plans");
      expect(mockInsert).toHaveBeenCalledWith({
        id: "test-123",
        destination: mockPlanInput.destination,
        traveler_type: mockPlanInput.travelerType,
        ai_response: mockPlanInput.aiResponse,
        expires_at: mockPlanInput.expiresAt,
        created_at: expect.any(String),
      });
    });

    it("should handle database errors during creation", async () => {
      mockInsert.mockReturnValue({ error: { message: "Database error" } });

      const { SharedPlanService } = await import("../sharedPlanService");

      await expect(
        SharedPlanService.createSharedPlan(mockPlanInput),
      ).rejects.toThrow("Failed to create shared plan.");
    });
  });

  describe("getSharedPlan", () => {
    it("should retrieve shared plan successfully", async () => {
      mockSingle.mockResolvedValue({ data: mockDbRow, error: null });

      const { SharedPlanService } = await import("../sharedPlanService");
      const result = await SharedPlanService.getSharedPlan("test-123");

      expect(result).toMatchObject({
        id: "test-123",
        destination: mockPlanInput.destination,
        travelerType: mockPlanInput.travelerType,
        aiResponse: mockPlanInput.aiResponse,
      });
      expect(result).toHaveProperty("createdAt");
      expect(result).toHaveProperty("expiresAt");
      expect(mockFrom).toHaveBeenCalledWith("shared_plans");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("id", "test-123");
    });

    it("should return null for non-existent plan", async () => {
      mockSingle.mockResolvedValue({ data: null, error: { code: "PGRST116" } });

      const { SharedPlanService } = await import("../sharedPlanService");
      const result = await SharedPlanService.getSharedPlan("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null for expired plan", async () => {
      const expiredDbRow = {
        ...mockDbRow,
        expires_at: "2020-01-01T00:00:00Z", // Past date
      };
      mockSingle.mockResolvedValue({ data: expiredDbRow, error: null });

      // Mock the deleteSharedPlan method
      const mockDeleteEq = vi.fn(() => ({ error: null }));
      const mockDeleteLt = vi.fn(() => ({
        select: vi.fn(() => ({ data: [], error: null })),
      }));
      mockDelete.mockReturnValue({ eq: mockDeleteEq, lt: mockDeleteLt });

      const { SharedPlanService } = await import("../sharedPlanService");
      const result = await SharedPlanService.getSharedPlan("expired-plan");

      expect(result).toBeNull();
      // Should have attempted to delete the expired plan
      expect(mockDeleteEq).toHaveBeenCalledWith("id", "expired-plan");
    });

    it("should handle database errors during retrieval", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: {
          message: "Database connection failed",
          code: "CONNECTION_ERROR",
        },
      });

      const { SharedPlanService } = await import("../sharedPlanService");

      await expect(SharedPlanService.getSharedPlan("test-123")).rejects.toThrow(
        "Failed to fetch shared plan.",
      );
    });
  });

  describe("cleanupExpiredPlans", () => {
    it("should cleanup expired plans successfully", async () => {
      const mockSelectForCleanup = vi.fn(() => ({
        data: [{ id: "expired-1" }, { id: "expired-2" }],
        error: null,
      }));
      const mockLt = vi.fn(() => ({ select: mockSelectForCleanup }));
      const mockEq = vi.fn(() => ({ error: null }));
      mockDelete.mockReturnValue({ eq: mockEq, lt: mockLt });

      const { SharedPlanService } = await import("../sharedPlanService");
      const count = await SharedPlanService.cleanupExpiredPlans();

      expect(count).toBe(2);
      expect(mockFrom).toHaveBeenCalledWith("shared_plans");
      expect(mockLt).toHaveBeenCalledWith("expires_at", expect.any(String));
    });

    it("should handle cleanup errors gracefully", async () => {
      const mockSelectForCleanup = vi.fn(() => ({
        data: null,
        error: { message: "Cleanup failed" },
      }));
      const mockLt = vi.fn(() => ({ select: mockSelectForCleanup }));
      const mockEq = vi.fn(() => ({ error: null }));
      mockDelete.mockReturnValue({ eq: mockEq, lt: mockLt });

      const { SharedPlanService } = await import("../sharedPlanService");
      const count = await SharedPlanService.cleanupExpiredPlans();

      expect(count).toBe(0);
    });
  });
});
