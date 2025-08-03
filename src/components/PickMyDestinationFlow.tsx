import React from "react";
import {
  PickDestinationPreferences,
  DestinationKnowledge,
  TravelerType,
} from "../types/travel";
import { ProgressiveForm } from "./ProgressiveForm";
import { Question } from "./QuestionStep";
import {
  regionQuestion,
  getQuestionsByTravelerType,
} from "../data/travelQuestions";

interface PickMyDestinationFlowProps {
  destinationKnowledge: DestinationKnowledge;
  travelerType: TravelerType;
  onComplete: (preferences: PickDestinationPreferences) => void;
}

export function PickMyDestinationFlow({
  destinationKnowledge,
  travelerType,
  onComplete,
}: PickMyDestinationFlowProps) {
  // Safety check - should not happen with proper App.tsx logic, but just in case
  if (!destinationKnowledge) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h3 className="mb-4">Oops, we hit a snag</h3>
            <p>
              Looks like some info got lost along the way. Mind going back and
              starting fresh?
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getQuestions = (): Question[] => {
    try {
      // Get base questions for the traveler type
      let questions = [...getQuestionsByTravelerType(travelerType.id)];

      // Add region question if they know the country
      if (destinationKnowledge.type === "country") {
        questions = [regionQuestion, ...questions];
      }

      return questions;
    } catch {
      return [];
    }
  };

  const handleFormComplete = (answers: Record<string, string>) => {
    const preferences: PickDestinationPreferences = {
      region: answers.region || "",
      timeOfYear: answers.timeOfYear || "",
      duration: answers.duration || "",
      budget: answers.budget || "",
      tripType: answers.tripType || "",
      specialActivities: answers.specialActivities || "",
      weather: answers.weather || "",
      priority: answers.priority || "",
      destinationType: answers.destinationType || "",
    };
    onComplete(preferences);
  };

  const questions = getQuestions();

  if (questions.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h3 className="mb-4">Getting things ready...</h3>
            <p>
              Just prepping some questions that'll help us find your perfect
              spot
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background-muted">
      <div className="container mx-auto px-4 py-8">
        <ProgressiveForm
          questions={questions}
          onComplete={handleFormComplete}
          title="🗺️ Chart Your Adventure Course"
          subtitle="Share your travel dreams with us, and we'll uncover destinations that match your wanderlust spirit perfectly. Every answer brings you closer to your next great adventure!"
        />
      </div>
    </div>
  );
}
