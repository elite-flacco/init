import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { AITripPlanningPrompts } from "../AITripPlanningPrompts";
import {
  mockTravelerTypes,
  mockDestinations,
  mockDestinationKnowledge,
  mockPickDestinationPreferences,
} from "../../test/mocks";

// Simple tests that don't require complex mocking
describe("AITripPlanningPrompts - Simple Tests", () => {
  const mockOnComplete = jest.fn();
  const mockOnBack = jest.fn();

  const defaultProps = {
    destination: mockDestinations.tokyo,
    travelerType: mockTravelerTypes.culture,
    destinationKnowledge: mockDestinationKnowledge,
    pickDestinationPreferences: mockPickDestinationPreferences,
    onComplete: mockOnComplete,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    mockOnComplete.mockClear();
    mockOnBack.mockClear();
  });

  it("should render with destination name in title", () => {
    render(<AITripPlanningPrompts {...defaultProps} />);
    expect(screen.getByText("Let's plan your Tokyo trip!")).toBeInTheDocument();
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

  it("should render the progressive form", () => {
    render(<AITripPlanningPrompts {...defaultProps} />);

    // Check for form content
    expect(
      screen.getByText(
        "Answer a few questions and we'll craft a travel plan that's perfectly you",
      ),
    ).toBeInTheDocument();

    // Check for first question
    expect(screen.getByText(/Where do you want to crash/)).toBeInTheDocument();

    // Check for accommodation options
    expect(
      screen.getByText("Hostel - Meet people, save money"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Hotel - Classic comfort zone"),
    ).toBeInTheDocument();
  });

  it("should render without crashing when props are provided", () => {
    expect(() => {
      render(<AITripPlanningPrompts {...defaultProps} />);
    }).not.toThrow();
  });

  it("should handle null destination gracefully", () => {
    const propsWithNullDestination = {
      ...defaultProps,
      destination: null,
    };

    expect(() => {
      render(<AITripPlanningPrompts {...propsWithNullDestination} />);
    }).not.toThrow();
  });
});
