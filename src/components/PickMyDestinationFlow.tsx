import React from 'react';
import { PickDestinationPreferences, DestinationKnowledge, TravelerType } from '../types/travel';
import { ProgressiveForm } from './ProgressiveForm';
import { Question } from './QuestionStep';
import { regionQuestion, getQuestionsByTravelerType } from '../data/travelQuestions';

interface PickMyDestinationFlowProps {
  destinationKnowledge: DestinationKnowledge;
  travelerType: TravelerType;
  onComplete: (preferences: PickDestinationPreferences) => void;
}

export function PickMyDestinationFlow({ 
  destinationKnowledge, 
  travelerType,
  onComplete 
}: PickMyDestinationFlowProps) {
  
  // Safety check - should not happen with proper App.tsx logic, but just in case
  if (!destinationKnowledge) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Something went wrong
            </h2>
            <p className="text-foreground-secondary">
              Missing destination knowledge data. Please go back and try again.
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
      if (destinationKnowledge.type === 'country') {
        questions = [regionQuestion, ...questions];
      }

      return questions;
    } catch {
      return [];
    }
  };

  const handleFormComplete = (answers: Record<string, string>) => {
    const preferences: PickDestinationPreferences = {
      region: answers.region || '',
      timeOfYear: answers.timeOfYear || '',
      duration: answers.duration || '',
      budget: answers.budget || '',
      tripType: answers.tripType || '',
      specialActivities: answers.specialActivities || '',
      weather: answers.weather || '',
      priority: answers.priority || '',
      destinationType: answers.destinationType || ''
    };
    onComplete(preferences);
  };

  const questions = getQuestions();
  
  if (questions.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Loading questions...
            </h2>
            <p className="text-foreground-secondary">
              Preparing your destination selection form
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <ProgressiveForm
          questions={questions}
          onComplete={handleFormComplete}
          title="Let's Find Your Perfect Destination"
          subtitle="Answer each question to help us create your dream travel experience ✈️"
        />
      </div>
    </div>
  );
}