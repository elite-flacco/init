"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { trackTravelEvent, trackPageView } from "../src/lib/analytics";
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
import { AITripPlanningResponse } from "../src/services/aiTripPlanningService";
import {
  AIDestinationResponse,
  aiDestinationService,
} from "../src/services/aiDestinationService";
import {
  generateDevMockData,
  generateDevMockDestinationData,
} from "../src/data/mock/travelData";
import { DestinationLoading } from "../src/components/ui/DestinationLoading";

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
  const [aiDestinationResponse, setAiDestinationResponse] =
    useState<AIDestinationResponse | null>(null);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [previousStep, setPreviousStep] = useState<AppStep | null>(null);

  // Track step changes
  useEffect(() => {
    if (previousStep && previousStep !== currentStep) {
      trackTravelEvent.navigateStep(previousStep, currentStep);
    }
    
    // Track page view for step changes
    trackPageView(`/step/${currentStep}`, `Travel Planning - ${currentStep}`);
    
    setPreviousStep(currentStep);
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
    trackTravelEvent.selectTravelerType(type.title);

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

    if (knowledge.type === "no-clue") {
      setCurrentStep("pick-destination");
    } else {
      // User knows where they want to go, ask them to specify
      setCurrentStep("destination-input");
    }
  };

  const handlePickDestinationComplete = (
    preferences: PickDestinationPreferences,
  ) => {
    setPickDestinationPreferences(preferences);
    
    // Track destination preferences completion
    trackTravelEvent.completeDestinationPreferences(preferences);
    
    // Add delay to allow form transition to complete and fade out before showing loading
    setTimeout(() => {
      generateDestinationRecommendations(preferences);
    }, 2100);
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

  const handleTripPlanningComplete = (response: AITripPlanningResponse) => {
    try {
      setAiTripPlanningResponse(response);
      
      // Track trip planning completion
      trackTravelEvent.completeTripPlanning();
      
      setCurrentStep("plan");
    } catch (error) {
      // Track error and stay on planning step
      trackTravelEvent.error('trip_planning_failed');
    }
  };

  const handleRegeneratePlan = () => {
    // Track plan regeneration
    trackTravelEvent.regeneratePlan();
    
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
      budget: "Variable",
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
          <DestinationKnowledgeSelection
            travelerType={selectedTravelerType!}
            onSelect={handleDestinationKnowledgeSelect}
          />
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
        if (isLoadingDestinations) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <DestinationLoading isVisible={true} />
            </motion.div>
          );
        }

        if (destinationError) {
          return (
            <div className="max-w-7xl mx-auto p-6">
              <div className="text-center py-20">
                <div className="max-w-2xl mx-auto">
                  {/* Error icon */}
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-error/20 to-warning/20 rounded-full animate-pulse"></div>
                    <div className="relative w-12 h-12 bg-gradient-to-br from-error/10 to-warning/10 rounded-full flex items-center justify-center border border-error/30">
                      <span className="text-2xl">😅</span>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-error bg-clip-text text-transparent mb-4">
                    Oops, we hit a snag
                  </h2>
                  <p className="text-lg text-foreground-secondary mb-8 leading-relaxed">
                    Our AI took a little coffee break. {destinationError}
                  </p>

                  <button
                    onClick={() => generateDestinationRecommendations()}
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-primary hover:from-primary hover:to-primary-700 text-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 font-medium"
                  >
                    <svg
                      className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      ></path>
                    </svg>
                    Let's Try This Again
                  </button>
                </div>
              </div>
            </div>
          );
        }

        if (!aiDestinationResponse || !selectedTravelerType) {
          return (
            <div className="text-center py-16">
              <p>Loading destination recommendations...</p>
            </div>
          );
        }

        return (
          <AIDestinationRecommendationResults
            aiResponse={aiDestinationResponse}
            onSelect={handleDestinationSelect}
            onBack={() => setCurrentStep("pick-destination")}
            onRegenerate={() => generateDestinationRecommendations()}
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
            aiResponse={aiTripPlanningResponse!}
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
      <div className="fixed top-6 left-6 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary to-primary p-2 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:scale-105 group">
            <Plane className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              TravelAI
            </h1>
            <p className="text-xs text-foreground-secondary font-medium hidden sm:block">
              AI-Powered Travel Planning
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Elements - Right Side */}
      {currentStep !== "plan" && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center space-y-4">
          {/* Back Button */}
          {currentStep !== "traveler-type" && (
            <button
              onClick={handleBack}
              className="group inline-flex items-center p-3 text-sm font-medium text-foreground-muted hover:text-primary bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-border/50 hover:border-primary/30 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              aria-label="Go back to previous step"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
            </button>
          )}
          
          {/* Progress Indicator */}
          <TravelProgressIndicator currentStep={currentStep} vertical={true} />
        </div>
      )}

      {/* Main content */}
      <main className="relative p-20 px-4 sm:px-6">
        <div className="container mx-auto relative z-10">
          <div className="relative">{renderCurrentStep()}</div>
        </div>
      </main>
    </div>
  );
}
