import { motion } from "framer-motion";
import {
  ArrowLeft,
  Compass,
  Map,
} from "lucide-react";
import React, { useState } from "react";
import {
  commonTripPlanningQuestions,
  destinationInputQuestion,
  getTripPlanningQuestionsByTravelerType,
} from "../data/travelQuestions";
import {
  AITripPlanningResponse,
  aiTripPlanningService,
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
import { TravelPlanLoading } from "./ui/TravelPlanLoading";

interface AITripPlanningPromptsProps {
  destination: Destination | null;
  travelerType: TravelerType;
  destinationKnowledge: DestinationKnowledge | null;
  pickDestinationPreferences: PickDestinationPreferences | null;
  onComplete: (response: AITripPlanningResponse) => void;
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
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isFormCompleted, setIsFormCompleted] = useState(false);

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
        return true;
      },
    );

    questions.push(...filteredCommonQuestions);

    // Add traveler type specific questions
    const typeSpecificQuestions = getTripPlanningQuestionsByTravelerType(
      travelerType.id,
    );
    questions.push(...typeSpecificQuestions);

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
            image: "/images/placeholder-destination.jpg",
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

    // Add delay to allow the form's transition to complete and fade out
    setTimeout(async () => {
      setIsGeneratingPlan(true);

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

        const aiResponse = await aiTripPlanningService.generateTravelPlan({
          destination: effectiveDestination,
          preferences,
          travelerType,
          destinationKnowledge,
          pickDestinationPreferences,
        });

        onComplete(aiResponse);
      } catch (error) {
        console.error("Failed to generate AI travel plan:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Our AI had a brain freeze. Mind giving it another shot?";
        setGenerationError(errorMessage);
        setIsGeneratingPlan(false);
      }
    }, 2100);
  };

  if (generationError) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Adventure Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 left-10 text-4xl opacity-[0.03] animate-float-slow transform rotate-12">
            🗺️
          </div>
          <div className="absolute bottom-20 right-10 text-3xl opacity-[0.03] animate-float-slow transform -rotate-6">
            🧭
          </div>
        </div>

        <div className="relative z-10 text-center p-8 max-w-2xl">
          {/* Adventure Error Container */}
          <div className="transform -rotate-1 hover:rotate-0 transition-transform duration-700">
            <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 rounded-3xl p-8 lg:p-12 shadow-adventure-float relative overflow-hidden">
              {/* Adventure Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-xl opacity-50 -z-10"></div>

              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/30 rounded-full mb-6 transform hover:scale-110 transition-transform duration-300">
                <div className="text-4xl animate-bounce-subtle">🚫</div>
              </div>

              <h3 className="text-2xl lg:text-3xl font-display font-bold mb-4 bg-gradient-to-br from-primary via-accent to-secondary bg-clip-text text-transparent">
                Houston, we have a problem...
              </h3>

              <p className="text-lg text-foreground-secondary mb-8 leading-relaxed">
                {generationError}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setGenerationError(null);
                    setIsFormCompleted(false);
                  }}
                  className="group px-8 py-4 bg-gradient-to-br from-primary/20 to-accent/30 hover:from-primary/30 hover:to-accent/40 border border-border/50 hover:border-primary/50 rounded-xl font-semibold text-foreground hover:text-primary shadow-card hover:shadow-adventure-float transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-center">
                    <Compass className="w-5 h-5 mr-3 group-hover:rotate-45 transition-transform duration-500" />
                    Give It Another Shot
                  </div>
                </button>

                <button
                  onClick={onBack}
                  className="group px-8 py-4 bg-background/80 hover:bg-secondary/20 border border-border/50 hover:border-secondary/50 rounded-xl font-semibold text-foreground-secondary hover:text-foreground shadow-card hover:shadow-adventure-float transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
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

  // If generating plan, show enhanced loading state with fade in
  if (isGeneratingPlan) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <TravelPlanLoading
          isVisible={true}
          destinationName={getDestinationName()}
        />
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Adventure Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 text-4xl opacity-[0.03] animate-float-slow transform rotate-12">
          🗺️
        </div>
        <div className="absolute top-60 right-20 text-3xl opacity-[0.04] animate-float-delayed transform -rotate-12">
          🧭
        </div>
        <div className="absolute bottom-40 left-20 text-5xl opacity-[0.02] animate-float transform rotate-45">
          ⛰️
        </div>
        <div className="absolute bottom-20 right-10 text-3xl opacity-[0.03] animate-float-slow transform -rotate-6">
          🎒
        </div>
      </div>

      <div className="relative z-10 container max-w-5xl mx-auto px-4 py-8">
        {/* Adventure Planning Header */}
        <div className="text-center mb-12">
          <div className="transform -rotate-1 hover:rotate-0 transition-transform duration-700 mb-8">
            <div className="inline-block bg-gradient-to-br from-primary/20 via-accent/15 to-secondary/20 rounded-3xl p-8 lg:p-12 border-2 border-border/30 backdrop-blur-xl shadow-adventure-float relative">
              {/* Adventure Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 rounded-3xl blur-xl opacity-50 -z-10 animate-adventure-float"></div>

              <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6 bg-gradient-to-br from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
                Let's Plan Your {getDestinationName()} Trip!
              </h2>

              <p className="text-lg lg:text-xl text-foreground-secondary max-w-3xl mx-auto leading-relaxed">
                Time to plan something awesome for {getDestinationName()}.
                Just answer a few quick questions and we'll craft a travel plan that's perfectly you.
              </p>
            </div>
          </div>
        </div>

        {/* Adventure Form Container */}
        <div className="relative">
          <div className="transform rotate-1 hover:rotate-0 transition-transform duration-700">
            <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 rounded-3xl p-8 lg:p-10 shadow-card hover:shadow-adventure-float transition-all duration-500 relative overflow-hidden">
              {/* Adventure Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-accent/10 to-primary/20 rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-700 -z-10"></div>

              {/* Adventure Pattern */}
              <div className="absolute top-6 right-6 text-3xl opacity-20 hover:opacity-40 transition-opacity duration-500 animate-spin-slow">
                🧭
              </div>

              <ProgressiveForm
                questions={getQuestions()}
                onComplete={handleFormComplete}
                title=""
                subtitle=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
