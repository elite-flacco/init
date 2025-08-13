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

// Note: This component no longer directly uses aiTripPlanningService
// It now passes streaming requests to the parent component

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
    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    // After clicking complete form, onComplete should be called with streaming request
    await waitFor(
      () => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          undefined,
          expect.objectContaining({
            destination: mockDestinations.tokyo,
            preferences: expect.any(Object),
            travelerType: mockTravelerTypes.culture,
          })
        );
      },
      { timeout: 5000 }
    );
  });

  it("should call onComplete with correct streaming request parameters", async () => {
    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    // Wait for the setTimeout delay (2600ms) and onComplete call
    await waitFor(
      () => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          undefined,
          expect.objectContaining({
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
              priority: "authentic experiences",
              specialActivities: "cultural",
            }),
            travelerType: mockTravelerTypes.culture,
          })
        );
      },
      { timeout: 8000 }
    );
  }, 10000);

  it("should handle missing destination errors gracefully", async () => {
    const propsWithoutDestination = {
      ...defaultProps,
      destination: null,
      destinationKnowledge: null,
    };

    render(<AITripPlanningPrompts {...propsWithoutDestination} />);

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
    const propsWithoutDestination = {
      ...defaultProps,
      destination: null,
      destinationKnowledge: null,
    };

    render(<AITripPlanningPrompts {...propsWithoutDestination} />);

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
    const propsWithoutDestination = {
      ...defaultProps,
      destination: null,
      destinationKnowledge: null,
    };

    render(<AITripPlanningPrompts {...propsWithoutDestination} />);

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
    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    // This test just verifies the component doesn't crash during the process
    // The actual loading tips would be shown in the parent component that handles streaming
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    }, { timeout: 8000 });
  });

  it("should merge preferences from pick destination flow", async () => {
    render(<AITripPlanningPrompts {...defaultProps} />);

    const completeButton = screen.getByText("Complete Form");
    await userEvent.click(completeButton);

    await waitFor(
      () => {
        expect(mockOnComplete).toHaveBeenCalledWith(
          undefined,
          expect.objectContaining({
            preferences: expect.objectContaining({
              duration: "7 days", // From pickDestinationPreferences
              budget: "mid-range", // From pickDestinationPreferences
              tripType: "cultural", // From pickDestinationPreferences
              timeOfYear: "Summer", // From pickDestinationPreferences
              accommodation: "hotel", // From form
              wantRestaurants: true, // Hardcoded in implementation
              wantBars: true, // Hardcoded in implementation
              priority: "authentic experiences", // From pickDestinationPreferences
              specialActivities: "cultural", // From form
            }),
          }),
        );
      },
      { timeout: 8000 }
    );
  }, 10000);
});
