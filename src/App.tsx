import React, { useState } from 'react';
import { Plane } from 'lucide-react';
import { TravelerTypeSelection } from './components/TravelerTypeSelection';
import { DestinationKnowledgeSelection } from './components/DestinationKnowledgeSelection';
import { PickMyDestinationFlow } from './components/PickMyDestinationFlow';
import { DestinationRecommendationResults } from './components/DestinationRecommendationResults';
import { TripPlanningPrompts } from './components/TripPlanningPrompts';
import { TravelPlan } from './components/TravelPlan';
import { PlaceholderMessage } from './components/PlaceholderMessage';
import { TravelerType, Destination, TripPreferences, DestinationKnowledge, PickDestinationPreferences } from './types/travel';

type AppStep = 'traveler-type' | 'destination-knowledge' | 'pick-destination' | 'destination-recommendations' | 'planning' | 'plan' | 'placeholder';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('traveler-type');
  const [selectedTravelerType, setSelectedTravelerType] = useState<TravelerType | null>(null);
  const [destinationKnowledge, setDestinationKnowledge] = useState<DestinationKnowledge | null>(null);
  const [pickDestinationPreferences, setPickDestinationPreferences] = useState<PickDestinationPreferences | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [tripPreferences, setTripPreferences] = useState<TripPreferences | null>(null);

  const handleTravelerTypeSelect = (type: TravelerType) => {
    setSelectedTravelerType(type);
    if (type.showPlaceholder) {
      setCurrentStep('placeholder');
    } else {
      setCurrentStep('destination-knowledge');
    }
  };

  const handleDestinationKnowledgeSelect = (knowledge: DestinationKnowledge) => {
    setDestinationKnowledge(knowledge);
    if (knowledge.type === 'yes') {
      // Skip to planning if they already know where to go
      setCurrentStep('planning');
    } else {
      // Go to pick destination flow
      setCurrentStep('pick-destination');
    }
  };

  const handlePickDestinationComplete = (preferences: PickDestinationPreferences) => {
    setPickDestinationPreferences(preferences);
    setCurrentStep('destination-recommendations');
  };

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentStep('planning');
  };

  const handlePlanningComplete = (preferences: TripPreferences) => {
    setTripPreferences(preferences);
    setCurrentStep('plan');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'placeholder':
        setCurrentStep('traveler-type');
        setSelectedTravelerType(null);
        break;
      case 'destination-knowledge':
        setCurrentStep(selectedTravelerType?.showPlaceholder ? 'placeholder' : 'traveler-type');
        if (!selectedTravelerType?.showPlaceholder) {
          setSelectedTravelerType(null);
        }
        break;
      case 'pick-destination':
        setCurrentStep('destination-knowledge');
        setDestinationKnowledge(null);
        break;
      case 'destination-recommendations':
        setCurrentStep('pick-destination');
        setPickDestinationPreferences(null);
        break;
      case 'planning':
        if (destinationKnowledge?.type === 'yes') {
          setCurrentStep('destination-knowledge');
          setDestinationKnowledge(null);
        } else {
          setCurrentStep('destination-recommendations');
          setSelectedDestination(null);
        }
        break;
      case 'plan':
        setCurrentStep('planning');
        setTripPreferences(null);
        break;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-background-muted">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between relative">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg shadow-md">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">TravelAI</h1>
                <p className="text-sm text-foreground-secondary">AI-Powered Travel Planning</p>
              </div>
            </div>
            
            {/* Back Button - Only show when not on the first step */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              {currentStep !== 'traveler-type' && (
                <button 
                  onClick={handleBack}
                  className="back-button group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary flex items-center text-foreground-muted hover:text-foreground transition-colors"
                  aria-label="Go back to previous step"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="w-5 h-5 mr-1"
                  >
                    <path d="m12 19-7-7 7-7"></path>
                    <path d="M19 12H5"></path>
                  </svg>
                  <span className="text-sm font-medium">Back</span>
                </button>
              )}
            </div>
            
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center space-x-6">
              {[
                { step: 'traveler-type', label: 'You', 
                  active: currentStep === 'traveler-type',
                  completed: ['destination-knowledge', 'pick-destination', 'destination-recommendations', 'planning', 'plan'].includes(currentStep)
                },
                { step: 'destination', label: 'Destination', 
                  active: ['destination-knowledge', 'pick-destination', 'destination-recommendations'].includes(currentStep),
                  completed: ['planning', 'plan'].includes(currentStep)
                },
                { step: 'planning', label: 'Planning', 
                  active: currentStep === 'planning',
                  completed: currentStep === 'plan'
                },
                { step: 'plan', label: 'Your Plan', 
                  active: currentStep === 'plan',
                  completed: false
                }
              ].map(({ step, label, active, completed }) => (
                <div key={step} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full transition-colors ${
                    active ? 'bg-primary' : 
                    completed ? 'bg-success' : 'bg-border'
                  }`} />
                  <span className={`text-sm font-medium transition-colors ${
                    active ? 'text-primary-dark' : 
                    completed ? 'text-success' : 'text-foreground-muted'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 pb-32px-4 sm:px-6">
        <div className="container mx-auto">
        {currentStep === 'traveler-type' && (
          <TravelerTypeSelection onSelect={handleTravelerTypeSelect} />
        )}

        {currentStep === 'placeholder' && selectedTravelerType && (
          <PlaceholderMessage 
            travelerType={selectedTravelerType}
            onContinue={() => setCurrentStep('destination-knowledge')}
          />
        )}

        {currentStep === 'destination-knowledge' && (
          <DestinationKnowledgeSelection 
            onSelect={handleDestinationKnowledgeSelect}
          />
        )}

        {currentStep === 'pick-destination' && destinationKnowledge && selectedTravelerType && (
          <PickMyDestinationFlow
            destinationKnowledge={destinationKnowledge}
            travelerType={selectedTravelerType}
            onComplete={handlePickDestinationComplete}
          />
        )}

        {currentStep === 'destination-recommendations' && pickDestinationPreferences && (
          <DestinationRecommendationResults
            preferences={pickDestinationPreferences}
            onSelect={handleDestinationSelect}
          />
        )}

        {currentStep === 'planning' && selectedTravelerType && (
          <TripPlanningPrompts
            destination={selectedDestination}
            travelerType={selectedTravelerType}
            destinationKnowledge={destinationKnowledge}
            pickDestinationPreferences={pickDestinationPreferences}
            onComplete={handlePlanningComplete}
          />
        )}

        {currentStep === 'plan' && tripPreferences && selectedTravelerType && (
          (() => {
            // Create a default destination if user said they know where to go but no destination was selected
            const destination = selectedDestination || {
              id: 'user-destination',
              name: 'Your Destination',
              country: 'Unknown',
              description: 'Your chosen destination',
              image: '',
              highlights: [],
              bestTime: 'Year-round',
              budget: '3-4 days'
            };
            
            console.log('Rendering TravelPlan with props:', {
              destination,
              preferences: tripPreferences,
              travelerType: selectedTravelerType
            });
            return (
              <TravelPlan
                destination={destination}
                preferences={tripPreferences}
                travelerType={selectedTravelerType}
              />
            );
          })()
        )}
        </div>
      </main>
    </div>
  );
}

export default App;