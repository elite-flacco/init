import { Destination, TripPreferences, TravelerType, DestinationKnowledge, PickDestinationPreferences } from '../types/travel';
import { ProgressiveForm } from './ProgressiveForm';
import { Question } from './QuestionStep';
import { getTripPlanningQuestionsByTravelerType, commonTripPlanningQuestions } from '../data/travelQuestions';

interface TripPlanningPromptsProps {
  destination: Destination | null;
  travelerType: TravelerType;
  destinationKnowledge: DestinationKnowledge | null;
  pickDestinationPreferences: PickDestinationPreferences | null;
  onComplete: (preferences: TripPreferences) => void;
}

export function TripPlanningPrompts({ 
  destination, 
  travelerType, 
  pickDestinationPreferences, 
  onComplete
}: TripPlanningPromptsProps) {
  const getDestinationName = () => {
    if (destination) return destination.name;
    if (pickDestinationPreferences?.region) return pickDestinationPreferences.region;
    return 'your dream destination';
  };

  const getQuestions = (): Question[] => {
    const questions: Question[] = [];
    
    // Add common questions, but skip duration/budget if we already have them from pick destination flow
    const filteredCommonQuestions = commonTripPlanningQuestions.filter(question => {
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

  const handleFormComplete = (answers: Record<string, string>) => {
    const preferences: TripPreferences = {
      duration: pickDestinationPreferences?.duration || answers.duration || '',
      budget: pickDestinationPreferences?.budget || answers.budget || '',
      activities: [],
      accommodation: answers.accommodation || '',
      transportation: answers.transportation || '',
      wantRestaurants: answers.restaurants === 'Yes please! - I live to eat 🤤',
      wantBars: answers.bars === 'Absolutely! - It\'s 5 o\'clock somewhere! 🍹',
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
    
    onComplete(preferences);
  };

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-8">

        <ProgressiveForm
          questions={getQuestions()}
          onComplete={handleFormComplete}
          title={`Let's plan your epic trip to ${getDestinationName()}!`}
          subtitle="Time to get into the nitty-gritty! Answer each question and we'll automatically move to the next one ✨"
        />
      </div>
    </div>
  );
}