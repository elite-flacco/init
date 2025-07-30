'use client'

import { useState, useEffect } from 'react'
import { Plane } from 'lucide-react'
import { TravelerTypeSelection } from '../src/components/TravelerTypeSelection'
import { DestinationKnowledgeSelection } from '../src/components/DestinationKnowledgeSelection'
import { PickMyDestinationFlow } from '../src/components/PickMyDestinationFlow'
import { AIDestinationRecommendationResults } from '../src/components/AIDestinationRecommendationResults'
import { AITripPlanningPrompts } from '../src/components/AITripPlanningPrompts'
import { AITravelPlan } from '../src/components/AITravelPlan'
import { PlaceholderMessage } from '../src/components/PlaceholderMessage'
import { TravelerType, Destination, DestinationKnowledge, PickDestinationPreferences } from '../src/types/travel'
import { AITripPlanningResponse } from '../src/services/aiTripPlanningService'
import { AIDestinationResponse, aiDestinationService } from '../src/services/aiDestinationService'
import { generateDevMockData, generateDevMockDestinationData } from '../src/data/mock/travelData'
import { destinations } from '../src/data/mock/destinations'

type AppStep = 'traveler-type' | 'destination-knowledge' | 'pick-destination' | 'destination-recommendations' | 'planning' | 'plan' | 'placeholder'

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('traveler-type')
  const [selectedTravelerType, setSelectedTravelerType] = useState<TravelerType | null>(null)
  const [destinationKnowledge, setDestinationKnowledge] = useState<DestinationKnowledge | null>(null)
  const [pickDestinationPreferences, setPickDestinationPreferences] = useState<PickDestinationPreferences | null>(null)
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [aiTripPlanningResponse, setAiTripPlanningResponse] = useState<AITripPlanningResponse | null>(null)
  const [aiDestinationResponse, setAiDestinationResponse] = useState<AIDestinationResponse | null>(null)
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false)
  const [destinationError, setDestinationError] = useState<string | null>(null)

  // Development shortcuts - check for URL parameters
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const urlParams = new URLSearchParams(window.location.search)
    const devMode = urlParams.get('dev')
    
    if (devMode === 'plan') {
      try {
        const { travelerType, destination, response } = generateDevMockData()
        
        setSelectedTravelerType(travelerType)
        setSelectedDestination(destination)
        setAiTripPlanningResponse(response)
        setCurrentStep('plan')
      } catch (error) {
        console.error('Error loading dev mock data:', error)
      }
    } else if (devMode === 'destinations') {
      try {
        const { travelerType, destinationResponse } = generateDevMockDestinationData()
        
        setSelectedTravelerType(travelerType)
        setAiDestinationResponse(destinationResponse)
        setCurrentStep('destination-recommendations')
      } catch (error) {
        console.error('Error loading dev destination data:', error)
      }
    }
  }, [])

  const handleTravelerTypeSelect = (type: TravelerType) => {
    setSelectedTravelerType(type)
    
    // Show placeholder for types that have it enabled
    if (type.showPlaceholder) {
      setCurrentStep('placeholder')
    } else {
      setCurrentStep('destination-knowledge')
    }
  }

  const handleDestinationKnowledgeSelect = (knowledge: DestinationKnowledge) => {
    setDestinationKnowledge(knowledge)
    
    if (knowledge.type === 'no-clue') {
      setCurrentStep('pick-destination')
    } else {
      // For now, when user knows destination, set a default one
      // TODO: Add proper destination input component
      setSelectedDestination(destinations[0]) // Set Tokyo as default
      setCurrentStep('planning')
    }
  }

  const handlePickDestinationComplete = async (preferences: PickDestinationPreferences) => {
    setPickDestinationPreferences(preferences)
    setIsLoadingDestinations(true)
    setDestinationError(null)
    
    try {
      if (!selectedTravelerType || !destinationKnowledge) {
        throw new Error('Missing required data')
      }

      const response = await aiDestinationService.getDestinationRecommendations({
        travelerType: selectedTravelerType,
        preferences,
        destinationKnowledge
      })
      
      setAiDestinationResponse(response)
      setCurrentStep('destination-recommendations')
    } catch (error) {
      console.error('Error getting destination recommendations:', error)
      setDestinationError('Failed to get destination recommendations. Please try again.')
    } finally {
      setIsLoadingDestinations(false)
    }
  }

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination)
    setCurrentStep('planning')
  }

  const handleTripPlanningComplete = (response: AITripPlanningResponse) => {
    try {
      console.log('Trip planning complete:', response)
      setAiTripPlanningResponse(response)
      setCurrentStep('plan')
    } catch (error) {
      console.error('Error handling trip planning completion:', error)
      // Stay on planning step if there's an error
    }
  }

  const handleRegeneratePlan = () => {
    setCurrentStep('planning')
  }

  const handleBackToDestinations = () => {
    setCurrentStep('destination-recommendations')
  }

  const handleContinueFromPlaceholder = () => {
    setCurrentStep('destination-knowledge')
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'traveler-type':
        return <TravelerTypeSelection onSelect={handleTravelerTypeSelect} />
      
      case 'placeholder':
        return (
          <PlaceholderMessage 
            travelerType={selectedTravelerType!}
            onContinue={handleContinueFromPlaceholder}
          />
        )
      
      case 'destination-knowledge':
        return (
          <DestinationKnowledgeSelection 
            travelerType={selectedTravelerType!}
            onSelect={handleDestinationKnowledgeSelect}
          />
        )
      
      case 'pick-destination':
        if (!destinationKnowledge || !selectedTravelerType) {
          return (
            <div className="text-center py-16">
              <p>Loading destination selection...</p>
            </div>
          )
        }
        return (
          <PickMyDestinationFlow 
            destinationKnowledge={destinationKnowledge}
            travelerType={selectedTravelerType}
            onComplete={handlePickDestinationComplete}
          />
        )
      
      case 'destination-recommendations':
        if (!aiDestinationResponse || !selectedTravelerType) {
          return (
            <div className="text-center py-16">
              <p>Loading destination recommendations...</p>
            </div>
          )
        }
        return (
          <AIDestinationRecommendationResults
            aiResponse={aiDestinationResponse}
            onSelect={handleDestinationSelect}
            onBack={() => setCurrentStep('pick-destination')}
          />
        )
      
      case 'planning':
        return (
          <AITripPlanningPrompts
            destination={selectedDestination}
            travelerType={selectedTravelerType!}
            destinationKnowledge={destinationKnowledge}
            pickDestinationPreferences={pickDestinationPreferences}
            onComplete={handleTripPlanningComplete}
            onBack={aiDestinationResponse ? handleBackToDestinations : undefined}
          />
        )
      
      case 'plan':
        return (
          <AITravelPlan
            destination={selectedDestination!}
            travelerType={selectedTravelerType!}
            aiResponse={aiTripPlanningResponse!}
            onRegeneratePlan={handleRegeneratePlan}
          />
        )
      
      default:
        return <TravelerTypeSelection onSelect={handleTravelerTypeSelect} />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - only show when not on plan step */}
      {currentStep !== 'plan' && (
        <header className="bg-primary text-white py-6 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Plane className="w-8 h-8 mr-3" />
              <h1 className="text-2xl font-bold">Travel Planner</h1>
            </div>
          </div>
        </header>
      )}
      
      {/* Main content */}
      <main>
        {renderCurrentStep()}
      </main>
    </div>
  )
}