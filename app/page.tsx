"use client";

import { useState, useEffect } from "react";
import { Plane } from "lucide-react";
import { trackTravelEvent, trackPageView } from "../src/lib/analytics";
import { useTypingEffect } from "../src/hooks/useTypingEffect";
import { TravelerTypeSelection } from "../src/components/TravelerTypeSelection";
import { DestinationKnowledgeSelection } from "../src/components/DestinationKnowledgeSelection";
import { DestinationInputComponent } from "../src/components/DestinationInputComponent";
import { PickMyDestinationFlow } from "../src/components/PickMyDestinationFlow";
import { AIDestinationRecommendationResults } from "../src/components/AIDestinationRecommendationResults";
import { AITripPlanningPrompts } from "../src/components/AITripPlanningPrompts";
import { AITravelPlan } from "../src/components/AITravelPlan";
import { PlaceholderMessage } from "../src/components/PlaceholderMessage";
import { TravelProgressIndicator } from "../src/components/TravelProgressIndicator";
import {
  TravelerType,
  Destination,
  DestinationKnowledge,
  PickDestinationPreferences,
} from "../src/types/travel";
import { AITripPlanningResponse, AITripPlanningRequest } from "../src/services/aiTripPlanningService";
import {
  AIDestinationResponse,
  aiDestinationService,
} from "../src/services/aiDestinationService";
import {
  generateDevMockData,
  generateDevMockDestinationData,
} from "../src/data/mock/travelData";

type AppStep =
  | "traveler-type"
  | "destination-knowledge"
  | "destination-input"
  | "pick-destination"
  | "destination-recommendations"
  | "planning"
  | "plan"
  | "placeholder";

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<AppStep>("traveler-type");
  const [selectedTravelerType, setSelectedTravelerType] =
    useState<TravelerType | null>(null);
  const [destinationKnowledge, setDestinationKnowledge] =
    useState<DestinationKnowledge | null>(null);
  const [pickDestinationPreferences, setPickDestinationPreferences] =
    useState<PickDestinationPreferences | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [aiTripPlanningResponse, setAiTripPlanningResponse] =
    useState<AITripPlanningResponse | null>(null);
  const [streamingTripPlanningRequest, setStreamingTripPlanningRequest] =
    useState<AITripPlanningRequest | null>(null);
  const [aiDestinationResponse, setAiDestinationResponse] =
    useState<AIDestinationResponse | null>(null);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [previousStep, setPreviousStep] = useState<AppStep | null>(null);

  // Typing effect for hero title
  const { displayedText: typedTitle, isComplete: titleComplete } = useTypingEffect({
    text: "TravelAI",
    speed: 150,
    delay: 500
  });

  // Track step changes
  useEffect(() => {
    if (previousStep && previousStep !== currentStep) {
      trackTravelEvent.navigateStep(previousStep, currentStep);
    }

    // Track page view for step changes
    trackPageView(`/step/${currentStep}`, `Travel Planning - ${currentStep}`);

    setPreviousStep(currentStep);

    // Scroll to top when navigating to plan results or any step change
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, previousStep]);

  // Development shortcuts - check for URL parameters
  useEffect(() => {
    if (typeof window === "undefined") return;

    const urlParams = new URLSearchParams(window.location.search);
    const devMode = urlParams.get("dev");

    if (devMode === "plan") {
      try {
        const { travelerType, destination, response } = generateDevMockData();

        setSelectedTravelerType(travelerType);
        setSelectedDestination(destination);
        setAiTripPlanningResponse(response);
        setCurrentStep("plan");
      } catch {
        // Failed to load dev mock data - continue normally
      }
    } else if (devMode === "destinations") {
      try {
        const { travelerType, destinationResponse } =
          generateDevMockDestinationData();

        setSelectedTravelerType(travelerType);
        setAiDestinationResponse(destinationResponse);
        setCurrentStep("destination-recommendations");
      } catch {
        // Failed to load dev mock data - continue normally
      }
    }
  }, []);

  const handleTravelerTypeSelect = (type: TravelerType) => {
    setSelectedTravelerType(type);

    // Track traveler type selection
    trackTravelEvent.selectTravelerType(type.name);

    // Show placeholder for types that have it enabled
    if (type.showPlaceholder) {
      setCurrentStep("placeholder");
    } else {
      setCurrentStep("destination-knowledge");
    }
  };

  const handleDestinationKnowledgeSelect = (
    knowledge: DestinationKnowledge,
  ) => {
    setDestinationKnowledge(knowledge);

    // Track destination knowledge selection
    trackTravelEvent.selectDestinationKnowledge(knowledge.type);

    if (knowledge.type === "yes") {
      // User knows exactly where they want to go, ask them to specify
      setCurrentStep("destination-input");
    } else {
      // User needs help finding destinations (either no clue or has region in mind)
      setCurrentStep("pick-destination");
    }
  };

  const handlePickDestinationComplete = (
    preferences: PickDestinationPreferences,
  ) => {
    setPickDestinationPreferences(preferences);

    // Track destination preferences completion
    trackTravelEvent.completeDestinationPreferences(preferences);

    // ProgressiveForm already has a 2-second transition, so we can call immediately
    generateDestinationRecommendations(preferences);
  };

  const generateDestinationRecommendations = async (
    preferences?: PickDestinationPreferences,
  ) => {
    if (!selectedTravelerType || !destinationKnowledge) {
      return;
    }

    setIsLoadingDestinations(true);
    setDestinationError(null);
    setCurrentStep("destination-recommendations");

    // Track AI recommendation request
    trackTravelEvent.requestAIRecommendations('destinations');

    try {
      const response = await aiDestinationService.getDestinationRecommendations(
        {
          travelerType: selectedTravelerType,
          preferences: preferences || pickDestinationPreferences || undefined,
          destinationKnowledge,
        },
      );

      setAiDestinationResponse(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setDestinationError(
        "Failed to get destination recommendations. Please try again.",
      );

      // Track error
      trackTravelEvent.error('destination_recommendations_failed', errorMessage);
    } finally {
      setIsLoadingDestinations(false);
    }
  };

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination);

    // Track destination selection
    trackTravelEvent.selectDestination(destination.name);

    setCurrentStep("planning");
  };

  const handleTripPlanningComplete = (response?: AITripPlanningResponse, streamingRequest?: AITripPlanningRequest) => {
    try {
      if (response) {
        // Traditional response - set the response data
        setAiTripPlanningResponse(response);
        setStreamingTripPlanningRequest(null);
      } else if (streamingRequest) {
        // Streaming mode - set the request data
        setStreamingTripPlanningRequest(streamingRequest);
        setAiTripPlanningResponse(null);
      }

      // Track trip planning completion
      trackTravelEvent.completeTripPlanning();

      setCurrentStep("plan");
    } catch {
      // Track error and stay on planning step
      trackTravelEvent.error('trip_planning_failed');
    }
  };

  const handleRegeneratePlan = () => {
    // Track plan regeneration
    trackTravelEvent.regeneratePlan();

    // Clear both response types
    setAiTripPlanningResponse(null);
    setStreamingTripPlanningRequest(null);
    
    setCurrentStep("planning");
  };

  const handleBackToDestinations = () => {
    setCurrentStep("destination-recommendations");
  };

  const handleContinueFromPlaceholder = () => {
    setCurrentStep("destination-knowledge");
  };

  const handleDestinationInput = (destinationName: string) => {
    // Track manual destination input
    trackTravelEvent.inputDestination(destinationName);

    // Create a destination object from the user input
    const customDestination: Destination = {
      id: "user-input",
      name: destinationName,
      country: "User Specified",
      description: `Your chosen destination: ${destinationName}`,
      image: "",
      highlights: [],
      bestTime: "As per your preference",
      estimatedCost: "Variable",
      keyActivities: [],
      matchReason: "",
    };
    setSelectedDestination(customDestination);
    setCurrentStep("planning");
  };

  const handleBack = () => {
    switch (currentStep) {
      case "placeholder":
        setCurrentStep("traveler-type");
        setSelectedTravelerType(null);
        break;
      case "destination-knowledge":
        setCurrentStep(
          selectedTravelerType?.showPlaceholder
            ? "placeholder"
            : "traveler-type",
        );
        if (!selectedTravelerType?.showPlaceholder) {
          setSelectedTravelerType(null);
        }
        break;
      case "destination-input":
        setCurrentStep("destination-knowledge");
        setDestinationKnowledge(null);
        setSelectedDestination(null);
        break;
      case "pick-destination":
        setCurrentStep("destination-knowledge");
        setDestinationKnowledge(null);
        break;
      case "destination-recommendations":
        setCurrentStep("pick-destination");
        setPickDestinationPreferences(null);
        break;
      case "planning":
        if (destinationKnowledge?.type === "yes") {
          setCurrentStep("destination-input");
          setSelectedDestination(null);
        } else {
          setCurrentStep("destination-recommendations");
          setSelectedDestination(null);
        }
        break;
      case "plan":
        setCurrentStep("planning");
        setAiTripPlanningResponse(null);
        setStreamingTripPlanningRequest(null);
        break;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "traveler-type":
        return <TravelerTypeSelection onSelect={handleTravelerTypeSelect} />;

      case "placeholder":
        return (
          <PlaceholderMessage
            travelerType={selectedTravelerType!}
            onContinue={handleContinueFromPlaceholder}
          />
        );

      case "destination-knowledge":
        return (
          <DestinationKnowledgeSelection onSelect={handleDestinationKnowledgeSelect} />
        );

      case "destination-input":
        return (
          <DestinationInputComponent
            travelerType={selectedTravelerType!}
            onSubmit={handleDestinationInput}
          />
        );

      case "pick-destination":
        if (!destinationKnowledge || !selectedTravelerType) {
          return (
            <div className="text-center py-16">
              <p>Loading destination selection...</p>
            </div>
          );
        }
        return (
          <PickMyDestinationFlow
            destinationKnowledge={destinationKnowledge}
            travelerType={selectedTravelerType}
            onComplete={handlePickDestinationComplete}
          />
        );

      case "destination-recommendations":
        return (
          <AIDestinationRecommendationResults
            aiResponse={aiDestinationResponse}
            onSelect={handleDestinationSelect}
            onBack={() => setCurrentStep("pick-destination")}
            onRegenerate={() => generateDestinationRecommendations()}
            isLoading={isLoadingDestinations}
            error={destinationError}
          />
        );

      case "planning":
        return (
          <AITripPlanningPrompts
            destination={selectedDestination}
            travelerType={selectedTravelerType!}
            destinationKnowledge={destinationKnowledge}
            pickDestinationPreferences={pickDestinationPreferences}
            onComplete={handleTripPlanningComplete}
            onBack={
              aiDestinationResponse ? handleBackToDestinations : undefined
            }
          />
        );

      case "plan":
        // Track when user views the final travel plan
        if (selectedDestination) {
          trackTravelEvent.viewTravelPlan(selectedDestination.name);
        }

        return (
          <AITravelPlan
            destination={selectedDestination!}
            travelerType={selectedTravelerType!}
            aiResponse={aiTripPlanningResponse || undefined}
            streamingRequest={streamingTripPlanningRequest || undefined}
            onRegeneratePlan={handleRegeneratePlan}
            onBack={handleBack}
          />
        );

      default:
        return <TravelerTypeSelection onSelect={handleTravelerTypeSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background-muted relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none animate-float"></div>
      <div
        className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none animate-float"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Logo - Top Left */}
      <div className="fixed top-2 left-2 sm:top-3 sm:left-3 z-50">
        <button
          onClick={() => setCurrentStep("traveler-type")}
          className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity duration-300"
          aria-label="Return to home"
        >
          <div className="hidden md:block bg-gradient-to-br from-primary to-primary p-1.5 sm:p-2 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 group">
            <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div className="flex flex-col items-start">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent hidden md:block">
              {typedTitle}
              <span className={`inline-block w-0.5 h-4 sm:h-5 bg-primary ml-1 ${!titleComplete ? 'animate-pulse' : 'opacity-0'}`}>
              </span>
            </h1>
            <p className={`text-xs text-foreground-secondary font-medium hidden md:block transition-opacity duration-500 ${titleComplete ? 'opacity-100' : 'opacity-0'}`}>
              AI-Powered Travel Planning
            </p>
          </div>
        </button>
      </div>

      {/* Navigation Elements - Right Side */}
      {currentStep !== "plan" && currentStep !== "traveler-type" && (
        <div className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-4">
          {/* Back Button */}

          <button
            onClick={handleBack}
            className="btn-3d-outline group inline-flex items-center p-1 sm:p-2 text-xs sm:text-sm font-medium"
            aria-label="Go back to previous step"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300"
            >
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
          </button>

          {/* Progress Indicator */}
          <TravelProgressIndicator currentStep={currentStep} vertical={true} />
        </div>
      )}

      {/* Main content */}
      <main className={`relative ${currentStep === 'placeholder' ? 'min-h-screen flex items-center justify-center' : 'py-8 px-4 sm:px-6 md:py-12 lg:py-16'}`}>
        <div className="container mx-auto relative z-10">
          <div className="relative">{renderCurrentStep()}</div>
        </div>
      </main>
    </div>
  );
}
