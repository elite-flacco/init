import React, { useState, useEffect } from 'react';
import { Plane } from 'lucide-react';
import { TravelerTypeSelection } from './components/TravelerTypeSelection';
import { DestinationKnowledgeSelection } from './components/DestinationKnowledgeSelection';
import { PickMyDestinationFlow } from './components/PickMyDestinationFlow';
import { AIDestinationRecommendationResults } from './components/AIDestinationRecommendationResults';
import { AITripPlanningPrompts } from './components/AITripPlanningPrompts';
import { AITravelPlan } from './components/AITravelPlan';
import { PlaceholderMessage } from './components/PlaceholderMessage';
import { TravelerType, Destination, DestinationKnowledge, PickDestinationPreferences } from './types/travel';
import { AITripPlanningResponse } from './services/aiTripPlanningService';
import { AIDestinationResponse, aiDestinationService } from './services/aiDestinationService';
import { generateDevMockData, generateDevMockDestinationData } from './data/mock/travelData';
import { ErrorBoundary } from './components/ErrorBoundary';

type AppStep = 'traveler-type' | 'destination-knowledge' | 'pick-destination' | 'destination-recommendations' | 'planning' | 'plan' | 'placeholder';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('traveler-type');
  const [selectedTravelerType, setSelectedTravelerType] = useState<TravelerType | null>(null);
  const [destinationKnowledge, setDestinationKnowledge] = useState<DestinationKnowledge | null>(null);
  const [pickDestinationPreferences, setPickDestinationPreferences] = useState<PickDestinationPreferences | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [aiTripPlanningResponse, setAiTripPlanningResponse] = useState<AITripPlanningResponse | null>(null);
  const [aiDestinationResponse, setAiDestinationResponse] = useState<AIDestinationResponse | null>(null);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [destinationError, setDestinationError] = useState<string | null>(null);

  // Development shortcuts - check for URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const devMode = urlParams.get('dev');
    
    if (devMode === 'plan') {
      const { travelerType, destination, response } = generateDevMockData();
      
      setSelectedTravelerType(travelerType);
      setSelectedDestination(destination);
      setAiTripPlanningResponse(response);
      setCurrentStep('plan');
    } else if (devMode === 'destinations') {
      const { travelerType, destinationResponse } = generateDevMockDestinationData();
      
      setSelectedTravelerType(travelerType);
      setAiDestinationResponse(destinationResponse);
      setCurrentStep('destination-recommendations');
    }
  }, []);

  const handleTravelerTypeSelect = (type: TravelerType) => {
    setSelectedTravelerType(type);
    if (type.showPlaceholder) {
      setCurrentStep('placeholder');
    } else {
      setCurrentStep('destination-knowledge');
    }
  };

  const handleDestinationKnowledgeSelect = (knowledge: DestinationKnowledge) => {
    console.log('Destination knowledge selected:', knowledge);
    setDestinationKnowledge(knowledge);
    if (knowledge.type === 'yes') {
      // Skip to planning if they already know where to go
      setCurrentStep('planning');
    } else {
      // Go to pick destination flow
      console.log('Setting step to pick-destination');
      setCurrentStep('pick-destination');
    }
  };

  const handlePickDestinationComplete = (preferences: PickDestinationPreferences) => {
    setPickDestinationPreferences(preferences);
    generateDestinationRecommendations(preferences);
  };

  const generateDestinationRecommendations = async (preferences?: PickDestinationPreferences) => {
    if (!selectedTravelerType) return;
    
    setIsLoadingDestinations(true);
    setDestinationError(null);
    setCurrentStep('destination-recommendations');
    
    try {
      const response = await aiDestinationService.getDestinationRecommendations({
        travelerType: selectedTravelerType,
        preferences: preferences || pickDestinationPreferences || undefined,
        destinationKnowledge: destinationKnowledge
          ? {
              type: destinationKnowledge.type,
              label: destinationKnowledge.label || '',
              description: destinationKnowledge.description || ''
            }
          : { type: 'no-clue', label: '', description: '' },
      });
      
      setAiDestinationResponse(response);
    } catch (err) {
      console.error('Failed to get AI recommendations:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unable to get AI recommendations. Please try again.';
      setDestinationError(errorMessage);
    } finally {
      setIsLoadingDestinations(false);
    }
  };

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination);
    setCurrentStep('planning');
  };

  const handlePlanningComplete = (response: AITripPlanningResponse) => {
    setAiTripPlanningResponse(response);
    setCurrentStep('plan');
  };

  const handleRegeneratePlan = () => {
    setCurrentStep('planning');
    setAiTripPlanningResponse(null);
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
        setAiTripPlanningResponse(null);
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
          <PlaceholderMessage travelerType={selectedTravelerType} />
        )}

        {currentStep === 'destination-knowledge' && (
          <DestinationKnowledgeSelection 
            onSelect={handleDestinationKnowledgeSelect}
          />
        )}

        {currentStep === 'pick-destination' && destinationKnowledge && selectedTravelerType && (
          <>
            {console.log('Rendering PickMyDestinationFlow with:', { destinationKnowledge, selectedTravelerType })}
            <PickMyDestinationFlow
              destinationKnowledge={destinationKnowledge}
              travelerType={selectedTravelerType}
              onComplete={handlePickDestinationComplete}
            />
          </>
        )}

        {currentStep === 'destination-recommendations' && (
          isLoadingDestinations ? (
            <div className="max-w-7xl mx-auto p-6">
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
                  <span className="w-8 h-8 text-primary animate-pulse">✨</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  AI is analyzing your preferences...
                </h2>
                <p className="text-foreground-secondary mb-8">
                  Finding the perfect destinations that match your travel style
                </p>
                <div className="flex justify-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          ) : destinationError ? (
            <div className="max-w-7xl mx-auto p-6">
              <div className="text-center py-16">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Oops! Something went wrong
                  </h2>
                  <p className="text-foreground-secondary mb-8">{destinationError}</p>
                  <button
                    onClick={() => generateDestinationRecommendations()}
                    className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <span className="w-4 h-4 mr-2">↻</span>
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          ) : aiDestinationResponse ? (
            <AIDestinationRecommendationResults
              aiResponse={aiDestinationResponse}
              onSelect={handleDestinationSelect}
              onBack={handleBack}
              onRegenerate={() => generateDestinationRecommendations()}
            />
          ) : null
        )}

        {currentStep === 'planning' && selectedTravelerType && (
          <AITripPlanningPrompts
            destination={selectedDestination}
            travelerType={selectedTravelerType}
            destinationKnowledge={destinationKnowledge}
            pickDestinationPreferences={pickDestinationPreferences}
            onComplete={handlePlanningComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'plan' && aiTripPlanningResponse && selectedTravelerType && (
          (() => {
            // Create a default destination if user said they know where to go but no destination was selected
            // Try to extract destination name from AI response if available
            const destinationName = aiTripPlanningResponse.plan?.destination?.name || 
                                   selectedDestination?.name || 
                                   '';
            
            const destination = selectedDestination || {
              id: 'user-destination',
              name: destinationName,
              country: 'Unknown',
              description: 'Your chosen destination',
              image: '',
              highlights: [],
              bestTime: 'Year-round',
              budget: '3-4 days'
            };
            
            return (
              <ErrorBoundary>
                <AITravelPlan
                  destination={destination}
                  travelerType={selectedTravelerType}
                  aiResponse={aiTripPlanningResponse}
                  onRegeneratePlan={handleRegeneratePlan}
                />
              </ErrorBoundary>
            );
          })()
        )}
        </div>
      </main>
    </div>
  );
}

export default App;