import React, { useState } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Destination, TripPreferences, TravelerType, DestinationKnowledge, PickDestinationPreferences } from '../types/travel';
import { ProgressiveForm } from './ProgressiveForm';
import { Question } from './QuestionStep';
import { getTripPlanningQuestionsByTravelerType, commonTripPlanningQuestions, destinationInputQuestion } from '../data/travelQuestions';
import { aiTripPlanningService, AITripPlanningResponse } from '../services/aiTripPlanningService';

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
  onBack
}: AITripPlanningPromptsProps) {
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isFormCompleted, setIsFormCompleted] = useState(false);

  const getDestinationName = () => {
    if (destination) return destination.name;
    if (pickDestinationPreferences?.region) return pickDestinationPreferences.region;
    if (destinationKnowledge?.type === 'yes') return 'your chosen destination';
    return 'your dream destination';
  };

  const getQuestions = (): Question[] => {
    const questions: Question[] = [];
    
    // Add destination question first if user knows where they want to go but no destination is selected
    if (!destination && destinationKnowledge?.type === 'yes') {
      questions.push(destinationInputQuestion);
    }
    
    // Add common questions, but skip duration/budget if we already have them from pick destination flow
    const filteredCommonQuestions = commonTripPlanningQuestions.filter(question => {
      if (question.id === 'timeOfYear' && pickDestinationPreferences?.timeOfYear) return false;
      if (question.id === 'duration' && pickDestinationPreferences?.duration) return false;
      if (question.id === 'budget' && pickDestinationPreferences?.budget) return false;
      return true;
    });
    
    questions.push(...filteredCommonQuestions);
    
    // Add traveler type specific questions
    const typeSpecificQuestions = getTripPlanningQuestionsByTravelerType(travelerType.id);
    questions.push(...typeSpecificQuestions);
    
    return questions;
  };

  const handleFormComplete = async (answers: Record<string, string>) => {
    // If no destination is selected but user said they know where to go, create a destination from their input
    const effectiveDestination = destination || (destinationKnowledge?.type === 'yes' ? {
      id: 'user-destination',
      name: answers.destination || 'Your Destination',
      country: 'Unknown',
      description: 'Your chosen destination',
      image: '/images/placeholder-destination.jpg',
      highlights: ['User selected destination'],
      bestTime: 'Year-round',
      budget: '$$$'
    } : null);

    if (!effectiveDestination) {
      setGenerationError('No destination selected');
      return;
    }

    setIsGeneratingPlan(true);
    setGenerationError(null);

    try {
      const preferences: TripPreferences = {
        timeOfYear: pickDestinationPreferences?.timeOfYear || answers.timeOfYear || '',
        duration: pickDestinationPreferences?.duration || answers.duration || '',
        budget: pickDestinationPreferences?.budget || answers.budget || '',
        specialActivities: answers.specialActivities || '',
        activities: [],
        accommodation: answers.accommodation || '',
        transportation: answers.transportation || '',
        // wantRestaurants: answers.restaurants === 'Yes please! - I live to eat 🤤',
        // wantBars: answers.bars === 'Absolutely! - It\'s 5 o\'clock somewhere! 🍹',
        wantRestaurants: true,
        wantBars: true,
        tripType: pickDestinationPreferences?.tripType || 'leisure',
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
        pickDestinationPreferences
      });

      onComplete(aiResponse);
    } catch (error) {
      console.error('Failed to generate AI travel plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'Our AI had a brain freeze. Mind giving it another shot?';
      setGenerationError(errorMessage);
      setIsGeneratingPlan(false);
    }
  };


  if (generationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Houston, we have a problem...
          </h2>
          <p className="text-foreground-secondary mb-8">
            {generationError}
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={() => {
                setGenerationError(null);
                setIsFormCompleted(false);
                // Go back to form
              }}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Let's Give This Another Shot
            </button>
            <button
              onClick={onBack}
              className="inline-flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If generating plan, show loading state
  if (isGeneratingPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8 max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-full mb-6">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Cooking Up Something Amazing
          </h2>
          <p className="text-foreground-secondary mb-8 text-lg">
            Our AI is putting together the perfect {getDestinationName()} experience just for you. Grab a coffee, this might take a while...
          </p>
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Trip Planning
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center mb-4">
            Time to plan something awesome for {getDestinationName()}
          </h1>
          <p className="text-center text-foreground-secondary max-w-2xl mx-auto">
            We'll use your answers to craft a travel plan that's perfectly you.
          </p>
        </div>

        <ProgressiveForm
          questions={getQuestions()}
          onComplete={handleFormComplete}
          title=""
          subtitle=""
        />
      </div>
    </div>
  );
}