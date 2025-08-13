import {
  ArrowLeft,
  Compass,
} from "lucide-react";
import React, { useState } from "react";
import {
  commonFinalTripPlanningQuestions,
  commonTripPlanningQuestions,
  destinationInputQuestion,
  getTripPlanningQuestionsByTravelerType,
} from "../data/travelQuestions";
import { trackTravelEvent } from "../lib/analytics";
import {
  AITripPlanningRequest,
  AITripPlanningResponse,
} from "../services/aiTripPlanningService";
import {
  Destination,
  DestinationKnowledge,
  PickDestinationPreferences,
  TravelerType,
  TripPreferences,
} from "../types/travel";
import { ProgressiveForm } from "./ProgressiveForm";
import { Question } from "./QuestionStep";

interface AITripPlanningPromptsProps {
  destination: Destination | null;
  travelerType: TravelerType;
  destinationKnowledge: DestinationKnowledge | null;
  pickDestinationPreferences: PickDestinationPreferences | null;
  onComplete: (response?: AITripPlanningResponse, streamingRequest?: AITripPlanningRequest) => void;
  onBack: () => void;
}

export function AITripPlanningPrompts({
  destination,
  travelerType,
  destinationKnowledge,
  pickDestinationPreferences,
  onComplete,
  onBack,
}: AITripPlanningPromptsProps) {
  const [generationError, setGenerationError] = useState<string | null>(null);


  const getDestinationName = () => {
    if (destination) return destination.name;
    if (pickDestinationPreferences?.region)
      return pickDestinationPreferences.region;
    if (destinationKnowledge?.type === "yes") return "your chosen destination";
    return "your dream destination";
  };

  const getQuestions = (): Question[] => {
    const questions: Question[] = [];

    // Add destination question first if user knows where they want to go but no destination is selected
    if (!destination && destinationKnowledge?.type === "yes") {
      questions.push(destinationInputQuestion);
    }

    // Add common questions, but skip duration/budget if we already have them from pick destination flow
    const filteredCommonQuestions = commonTripPlanningQuestions.filter(
      (question) => {
        if (
          question.id === "timeOfYear" &&
          pickDestinationPreferences?.timeOfYear
        )
          return false;
        if (question.id === "duration" && pickDestinationPreferences?.duration)
          return false;
        if (question.id === "budget" && pickDestinationPreferences?.budget)
          return false;
        if (question.id === "priority" && pickDestinationPreferences?.priority)
          return false;
        return true;
      },
    );

    questions.push(...filteredCommonQuestions);

    // Add traveler type specific questions
    const typeSpecificQuestions = getTripPlanningQuestionsByTravelerType(
      travelerType.id,
    );
    questions.push(...typeSpecificQuestions);

    questions.push(...commonFinalTripPlanningQuestions);

    return questions;
  };

  const handleFormComplete = async (answers: Record<string, string>) => {
    // If no destination is selected but user said they know where to go, create a destination from their input
    const effectiveDestination =
      destination ||
      (destinationKnowledge?.type === "yes"
        ? {
          id: "user-destination",
          name: answers.destination || "Your Destination",
          country: "Unknown",
          description: "Your chosen destination",
          image: "https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
          highlights: ["User selected destination"],
          bestTime: "Year-round",
          budget: "$$$",
          estimatedCost: "",
          matchReason: "",
          keyActivities: [],
        }
        : null);

    if (!effectiveDestination) {
      setGenerationError("No destination selected");
      return;
    }

    setGenerationError(null);

    // Add delay to allow the form's transition to complete and create anticipation
    setTimeout(async () => {

      try {
        const preferences: TripPreferences = {
          timeOfYear:
            pickDestinationPreferences?.timeOfYear || answers.timeOfYear || "",
          duration:
            pickDestinationPreferences?.duration || answers.duration || "",
          budget: pickDestinationPreferences?.budget || answers.budget || "",
          specialActivities: answers.specialActivities || "",
          activities: [],
          accommodation: answers.accommodation || "",
          transportation: answers.transportation || "",
          // wantRestaurants: answers.restaurants === 'Yes please! - I live to eat 🤤',
          // wantBars: answers.bars === 'Absolutely! - It\'s 5 o\'clock somewhere! 🍹',
          wantRestaurants: true,
          wantBars: true,
          tripType: pickDestinationPreferences?.tripType || "leisure",
          priority: pickDestinationPreferences?.priority || "",
          vibe: pickDestinationPreferences?.vibe || "",
          // Explorer specific answers
          activityLevel: answers.activityLevel,
          riskTolerance: answers.riskTolerance,
          spontaneity: answers.spontaneity,
          // Type A specific answers
          scheduleDetail: answers.scheduleDetail,
          bookingPreference: answers.bookingPreference,
          backupPlans: answers.backupPlans,
          // Bougie specific answers
          luxuryLevel: answers.luxuryLevel,
          serviceLevel: answers.serviceLevel,
          exclusivity: answers.exclusivity,
          // Chill specific answers
          relaxationStyle: answers.relaxationStyle,
          pacePreference: answers.pacePreference,
          stressLevel: answers.stressLevel,
        };

        // Track AI trip planning request
        trackTravelEvent.requestAIRecommendations('trip_plan');

        // Create streaming request data
        const streamingRequest: AITripPlanningRequest = {
          destination: effectiveDestination,
          preferences,
          travelerType,
        };

        // Pass the streaming request to the travel plan component
        onComplete(undefined, streamingRequest);
      } catch (error) {
        console.error("Failed to create trip planning request:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create trip planning request. Please try again.";

        // Track trip planning error
        trackTravelEvent.error('trip_planning_request_failed', errorMessage);

        setGenerationError(errorMessage);
      }
    }, 2600);
  };

  if (generationError) {
    return (
      <div className="flex items-center justify-center relative overflow-hidden">

        <div className="relative z-10 text-center p-8 max-w-2xl">
          {/* Adventure Error Container */}
          <div className="transform -rotate-1 hover:rotate-0 transition-transform duration-700">
            <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 rounded-3xl p-8 lg:p-12 shadow-adventure-float relative overflow-hidden">
              {/* Adventure Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-xl opacity-50 -z-10"></div>

              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/30 rounded-full mb-6 transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl animate-bounce-subtle">🚫</div>
              </div>

              <h3 className="text-2xl lg:text-3xl font-display font-bold mb-4 bg-gradient-to-br from-primary via-primary-dark to-secondary bg-clip-text text-transparent">
                Houston, we have a problem...
              </h3>

              <p className="text-lg text-foreground-secondary mb-8 leading-relaxed">
                {generationError}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setGenerationError(null);
                  }}
                  className="group btn-3d-gradient"
                >
                  <div className="flex items-center justify-center">
                    <Compass className="w-5 h-5 mr-3 group-hover:rotate-45 transition-transform duration-500" />
                    Give It Another Shot
                  </div>
                </button>

                <button
                  onClick={onBack}
                  className="group btn-3d-outline"
                >
                  <div className="flex items-center justify-center">
                    <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
                    Go Back
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <ProgressiveForm
          questions={getQuestions()}
          onComplete={handleFormComplete}
          title={`Let's plan your ${getDestinationName()} trip!`}
          subtitle="Answer a few questions and we'll craft a travel plan that's perfectly you"
        />
      </div>
    </div>
  );
}
