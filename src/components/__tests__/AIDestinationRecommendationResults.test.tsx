import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AIDestinationRecommendationResults } from "../AIDestinationRecommendationResults";
import { mockDestinations, resetMocks } from "../../test/mocks";

// Mock the useDestinationImage hook to prevent async state updates
vi.mock("../../hooks/useDestinationImage", () => ({
  useDestinationImage: vi.fn(() => ({
    imageUrl: null,
    imageUrls: null,
    isLoading: false,
    error: null,
  })),
}));

const mockOnSelect = vi.fn();
const mockOnBack = vi.fn();
const mockOnRegenerate = vi.fn();

const mockAiResponse = {
  destinations: [mockDestinations.bali, mockDestinations.tokyo],
  reasoning: "These destinations match your cultural interests perfectly.",
  confidence: 0.92,
};

const defaultProps = {
  aiResponse: mockAiResponse,
  onSelect: mockOnSelect,
  onBack: mockOnBack,
  onRegenerate: mockOnRegenerate,
};

describe("AIDestinationRecommendationResults", () => {
  beforeEach(() => {
    resetMocks();
    mockOnSelect.mockClear();
    mockOnBack.mockClear();
    mockOnRegenerate.mockClear();
  });

  it("should display AI recommendations", () => {
    render(<AIDestinationRecommendationResults {...defaultProps} />);

    expect(screen.getByText("Your Top Hits")).toBeInTheDocument();
    expect(
      screen.getByText("We think you'll love these 😉"),
    ).toBeInTheDocument();
  });

  it("should render destination cards for each destination", () => {
    render(<AIDestinationRecommendationResults {...defaultProps} />);

    // Check that destination cards are rendered (assuming DestinationCard shows destination names)
    expect(screen.getByText("Bali")).toBeInTheDocument();
    expect(screen.getByText("Tokyo")).toBeInTheDocument();
  });

  it("should show regenerate button when onRegenerate is provided", () => {
    render(<AIDestinationRecommendationResults {...defaultProps} />);

    expect(screen.getByText("Show Me More")).toBeInTheDocument();
  });

  it("should not show regenerate button when onRegenerate is not provided", () => {
    const propsWithoutRegenerate = {
      ...defaultProps,
      onRegenerate: undefined,
    };

    render(<AIDestinationRecommendationResults {...propsWithoutRegenerate} />);

    expect(screen.queryByText("Show Me More")).not.toBeInTheDocument();
  });

  it("should call onRegenerate when regenerate button is clicked", async () => {
    render(<AIDestinationRecommendationResults {...defaultProps} />);

    const regenerateButton = screen.getByText("Show Me More");
    await userEvent.click(regenerateButton);

    expect(mockOnRegenerate).toHaveBeenCalledTimes(1);
  });

  it("should handle empty destination results", () => {
    const emptyResponse = {
      destinations: [],
      reasoning: "No matching destinations found",
      confidence: 0.5,
    };

    const propsWithEmptyResults = {
      ...defaultProps,
      aiResponse: emptyResponse,
    };

    render(<AIDestinationRecommendationResults {...propsWithEmptyResults} />);

    expect(
      screen.getByText("Hmm, our AI is having a moment. Let's try this again."),
    ).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("should call onRegenerate when try different recommendations button is clicked", async () => {
    const emptyResponse = {
      destinations: [],
      reasoning: "No matching destinations found",
      confidence: 0.5,
    };

    const propsWithEmptyResults = {
      ...defaultProps,
      aiResponse: emptyResponse,
    };

    render(<AIDestinationRecommendationResults {...propsWithEmptyResults} />);

    const tryDifferentButton = screen.getByText("Try Again");
    await userEvent.click(tryDifferentButton);

    expect(mockOnRegenerate).toHaveBeenCalledTimes(1);
  });

  it("should not show empty state message when there are destinations", () => {
    render(<AIDestinationRecommendationResults {...defaultProps} />);

    expect(
      screen.queryByText(
        "Hmm, our AI is having a moment. Let's try this again.",
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("should render correct number of destination cards", () => {
    render(<AIDestinationRecommendationResults {...defaultProps} />);

    // Should render 2 destination cards for the mock data
    const destinationCards = screen.getAllByText(/Bali|Tokyo/);
    expect(destinationCards).toHaveLength(2);
  });

  it("should handle single destination", () => {
    const singleDestinationResponse = {
      destinations: [mockDestinations.bali],
      reasoning: "Perfect match for your preferences",
      confidence: 0.95,
    };

    const propsWithSingleDestination = {
      ...defaultProps,
      aiResponse: singleDestinationResponse,
    };

    render(
      <AIDestinationRecommendationResults {...propsWithSingleDestination} />,
    );

    expect(screen.getByText("Bali")).toBeInTheDocument();
    expect(screen.queryByText("Tokyo")).not.toBeInTheDocument();
  });
});
