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
  const getQuestions = (): Question[] => {
    // Get base questions for the traveler type
    let questions = [...getQuestionsByTravelerType(travelerType.id)];

    // Add region question if they know the country
    if (destinationKnowledge.type === 'country') {
      questions = [regionQuestion, ...questions];
    }

    return questions;
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

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <ProgressiveForm
          questions={getQuestions()}
          onComplete={handleFormComplete}
          title="Let's Find Your Perfect Destination"
          subtitle="Answer each question to help us create your dream travel experience ✈️"
        />
      </div>
    </div>
  );
}