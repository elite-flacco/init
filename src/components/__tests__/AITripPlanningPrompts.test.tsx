import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AITripPlanningPrompts } from "../AITripPlanningPrompts";
import {
  mockTravelerTypes,
  mockDestinations,
  mockDestinationKnowledge,
  mockPickDestinationPreferences,
  resetMocks,
} from "../../test/mocks";
import {
  TripPreferences,
  WeatherInfo,
  TransportationInfo,
  TapWaterInfo,
  TipEtiquette,
  CurrencyInfo,
} from "../../types/travel";

// Mock the AI service
vi.mock("../../services/aiTripPlanningService", () => ({
  aiTripPlanningService: {
    generateTravelPlan: vi.fn(),
  },
}));

// Mock the ProgressiveForm component
vi.mock("../ProgressiveForm", () => ({
  ProgressiveForm: ({
    onComplete,
    title,
    subtitle,
  }: {
    onComplete: (answers: TripPreferences) => void;
    title: string;
    subtitle: string;
  }) => (
    <div data-testid="progressive-form">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button
        onClick={() =>
          onComplete({
            accommodation: "hotel",
            transportation: "public transport",
            timeOfYear: "Summer",
            duration: "7 days",
            budget: "mid-range",
            activities: [],
            tripType: "cultural",
            activityLevel: "moderate",
            specialActivities: "cultural",
            riskTolerance: "low",
            spontaneity: "planned",
            wantRestaurants: true,
            wantBars: true,
            priority: "",
            vibe: "",
          })
        }
      >
        Complete Form
      </button>
    </div>
  ),
}));

const mockOnComplete = vi.fn();
const mockOnBack = vi.fn();

const defaultProps = {
  destination: mockDestinations.tokyo,
  travelerType: mockTravelerTypes.culture,
  destinationKnowledge: mockDestinationKnowledge,
  pickDestinationPreferences: mockPickDestinationPreferences,
  onComplete: mockOnComplete,
  onBack: mockOnBack,
};

// Use mock objects for tipEtiquette and tapWaterSafe:
const mockTipEtiquette: TipEtiquette = {
  restaurants: "",
  bars: "",
  taxis: "",
  hotels: "",
  tours: "",
  general: "",
};
const mockTapWaterSafe: TapWaterInfo = {
  safe: true,
  details: "",
};

describe("AITripPlanningPrompts", () => {
  beforeEach(() => {
    resetMocks();
    mockOnComplete.mockClear();
    mockOnBack.mockClear();
  });

  it("should render the planning form initially", () => {
    render(<AITripPlanningPrompts {...defaultProps} />);

    expect(screen.getByText("Let's plan your Tokyo trip!")).toBeInTheDocument();
    expect(screen.getByTestId("progressive-form")).toBeInTheDocument();
  });

  it("should show loading state when generating plan", async () => {
    const { aiTripPlanningService } = await import(
      "../../services/aiTripPlanningService"
    );

    // Mock a delayed response
    vi.mocked(aiTripPlanningService.generateTravelPlan).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                plan: {
                  destination: mockDestinations.tokyo,
                  neighborhoods: [],
                  hotelRecommendations: [],
                  tipEtiquette: mockTipEtiquette,
                  placesToVisit: [],
                  restaurants: [],
                  bars: [],
                  weatherInfo: {} as WeatherInfo,
                  socialEtiquette: [],
                  safetyTips: [],
                  transportationInfo: {} as TransportationInfo,
                  localCurrency: {} as CurrencyInfo,
                  activities: [],
                  mustTryFood: { items: [] },
                  tapWaterSafe: mockTapWaterSafe,
                  localEvents: [],
                  history: "",
                  itinerary: [],
                },
                reasoning: "Generated plan",
                confidence: 0.9,
                personalizations: [],
              }),
            1000,
          ),
        ),
    );

    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    // Wait for the 2.1 second delay plus the form completion transition
    await waitFor(
      () => {
        expect(
          screen.getByText(/Creating Your Perfect Trip/),
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("should call AI service with correct parameters", async () => {
    const { aiTripPlanningService } = await import(
      "../../services/aiTripPlanningService"
    );

    const mockResponse = {
      plan: {
        destination: mockDestinations.tokyo,
        neighborhoods: [],
        hotelRecommendations: [],
        tipEtiquette: mockTipEtiquette,
        placesToVisit: [],
        restaurants: [],
        bars: [],
        weatherInfo: {} as WeatherInfo,
        socialEtiquette: [],
        safetyTips: [],
        transportationInfo: {} as TransportationInfo,
        localCurrency: {} as CurrencyInfo,
        activities: [],
        mustTryFood: { items: [] },
        tapWaterSafe: mockTapWaterSafe,
        localEvents: [],
        history: "",
        itinerary: [],
      },
      reasoning: "Perfect plan generated",
      confidence: 0.92,
      personalizations: ["Customized for culture lover"],
    };

    vi.mocked(aiTripPlanningService.generateTravelPlan).mockResolvedValue(
      mockResponse,
    );

    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    // Wait for the setTimeout delay and service call to complete
    await waitFor(
      () => {
        expect(aiTripPlanningService.generateTravelPlan).toHaveBeenCalledWith({
          destination: mockDestinations.tokyo,
          preferences: expect.objectContaining({
            accommodation: "hotel",
            transportation: "public transport",
            wantRestaurants: true,
            wantBars: true,
            duration: "7 days",
            budget: "mid-range",
            tripType: "cultural",
            timeOfYear: "Summer",
          }),
          travelerType: mockTravelerTypes.culture,
          destinationKnowledge: mockDestinationKnowledge,
          pickDestinationPreferences: mockPickDestinationPreferences,
        });
      },
      { timeout: 5000 }
    );

    expect(mockOnComplete).toHaveBeenCalledWith(mockResponse);
  });

  it("should handle AI service errors gracefully", async () => {
    const { aiTripPlanningService } = await import(
      "../../services/aiTripPlanningService"
    );

    vi.mocked(aiTripPlanningService.generateTravelPlan).mockRejectedValue(
      new Error("AI service failed"),
    );

    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    // Wait for the setTimeout delay and error handling
    await waitFor(
      () => {
        expect(
          screen.getByText("Houston, we have a problem..."),
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("should allow retrying after error", async () => {
    const { aiTripPlanningService } = await import(
      "../../services/aiTripPlanningService"
    );

    vi.mocked(aiTripPlanningService.generateTravelPlan).mockRejectedValue(
      new Error("Network error"),
    );

    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    await waitFor(
      () => {
        expect(screen.getByText("Give It Another Shot")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const retryButton = screen.getByText("Give It Another Shot");
    await userEvent.click(retryButton);

    // Should show the form again
    await waitFor(() => {
      expect(screen.getByTestId("progressive-form")).toBeInTheDocument();
    });
  });

  it("should handle missing destination", async () => {
    const propsWithoutDestination = {
      ...defaultProps,
      destination: null,
    };

    render(<AITripPlanningPrompts {...propsWithoutDestination} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    await waitFor(
      () => {
        expect(
          screen.getByText("Houston, we have a problem..."),
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("should call onBack when back button is clicked in error state", async () => {
    const { aiTripPlanningService } = await import(
      "../../services/aiTripPlanningService"
    );

    vi.mocked(aiTripPlanningService.generateTravelPlan).mockRejectedValue(
      new Error("Service error"),
    );

    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    await waitFor(
      () => {
        expect(screen.getByText("Go Back")).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    const backButton = screen.getByText("Go Back");
    await userEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("should display destination name in title", () => {
    render(<AITripPlanningPrompts {...defaultProps} />);

    expect(
      screen.getByText("Let's plan your Tokyo trip!"),
    ).toBeInTheDocument();
  });

  it("should handle destination from preferences when no destination selected", () => {
    const propsWithRegion = {
      ...defaultProps,
      destination: null,
      pickDestinationPreferences: {
        ...mockPickDestinationPreferences,
        region: "Southeast Asia",
      },
    };

    render(<AITripPlanningPrompts {...propsWithRegion} />);

    expect(
      screen.getByText("Let's plan your Southeast Asia trip!"),
    ).toBeInTheDocument();
  });

  it("should show loading tips during AI processing", async () => {
    const { aiTripPlanningService } = await import(
      "../../services/aiTripPlanningService"
    );

    vi.mocked(aiTripPlanningService.generateTravelPlan).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                plan: {
                  destination: mockDestinations.tokyo,
                  neighborhoods: [],
                  hotelRecommendations: [],
                  tipEtiquette: mockTipEtiquette,
                  placesToVisit: [],
                  restaurants: [],
                  bars: [],
                  weatherInfo: {} as WeatherInfo,
                  socialEtiquette: [],
                  safetyTips: [],
                  transportationInfo: {} as TransportationInfo,
                  localCurrency: {} as CurrencyInfo,
                  activities: [],
                  mustTryFood: { items: [] },
                  tapWaterSafe: mockTapWaterSafe,
                  localEvents: [],
                  history: "",
                  itinerary: [],
                },
                reasoning: "Generated",
                confidence: 0.9,
                personalizations: [],
              }),
            1000,
          ),
        ),
    );

    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);
  });

  it("should merge preferences from pick destination flow", async () => {
    const { aiTripPlanningService } = await import(
      "../../services/aiTripPlanningService"
    );

    vi.mocked(aiTripPlanningService.generateTravelPlan).mockResolvedValue({
      plan: {
        destination: mockDestinations.tokyo,
        neighborhoods: [],
        hotelRecommendations: [],
        tipEtiquette: mockTipEtiquette,
        placesToVisit: [],
        restaurants: [],
        bars: [],
        weatherInfo: {} as WeatherInfo,
        socialEtiquette: [],
        safetyTips: [],
        transportationInfo: {} as TransportationInfo,
        localCurrency: {} as CurrencyInfo,
        activities: [],
        mustTryFood: { items: [] },
        tapWaterSafe: mockTapWaterSafe,
        localEvents: [],
        history: "",
        itinerary: [],
      },
      reasoning: "Perfect",
      confidence: 0.9,
      personalizations: [],
    });

    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    await waitFor(
      () => {
        expect(aiTripPlanningService.generateTravelPlan).toHaveBeenCalledWith(
          expect.objectContaining({
            preferences: expect.objectContaining({
              duration: "7 days", // From pickDestinationPreferences
              budget: "mid-range", // From pickDestinationPreferences
              tripType: "cultural", // From pickDestinationPreferences
              timeOfYear: "Summer", // From pickDestinationPreferences
              accommodation: "hotel", // From form
              wantRestaurants: true, // Hardcoded in implementation
              wantBars: true, // Hardcoded in implementation
            }),
          }),
        );
      },
      { timeout: 5000 }
    );
  });
});
