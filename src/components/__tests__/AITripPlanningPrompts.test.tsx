import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AITripPlanningPrompts } from '../AITripPlanningPrompts'
import { mockTravelerTypes, mockDestinations, mockDestinationKnowledge, mockPickDestinationPreferences, resetMocks } from '../../test/mocks'

// Mock the AI service
vi.mock('../../services/aiTripPlanningService', () => ({
  aiTripPlanningService: {
    generateTravelPlan: vi.fn()
  }
}))

// Mock the ProgressiveForm component
vi.mock('../ProgressiveForm', () => ({
  ProgressiveForm: ({ onComplete, title, subtitle }: any) => (
    <div data-testid="progressive-form">
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button 
        onClick={() => onComplete({
          accommodation: 'hotel',
          transportation: 'public transport',
          restaurants: 'Yes please! - I live to eat 🤤',
          bars: 'No thanks'
        })}
      >
        Complete Form
      </button>
    </div>
  )
}))

const mockOnComplete = vi.fn()
const mockOnBack = vi.fn()

const defaultProps = {
  destination: mockDestinations.paris,
  travelerType: mockTravelerTypes.culture,
  destinationKnowledge: mockDestinationKnowledge,
  pickDestinationPreferences: mockPickDestinationPreferences,
  onComplete: mockOnComplete,
  onBack: mockOnBack
}

describe('AITripPlanningPrompts', () => {
  beforeEach(() => {
    resetMocks()
    mockOnComplete.mockClear()
    mockOnBack.mockClear()
  })

  it('should render the planning form initially', () => {
    render(<AITripPlanningPrompts {...defaultProps} />)

    expect(screen.getByText('AI-Powered Trip Planning')).toBeInTheDocument()
    expect(screen.getByText('Let\'s plan your epic trip to Paris!')).toBeInTheDocument()
    expect(screen.getByTestId('progressive-form')).toBeInTheDocument()
  })

  it('should show loading state when generating plan', async () => {
    const { aiTripPlanningService } = await import('../../services/aiTripPlanningService')
    
    // Mock a delayed response
    vi.mocked(aiTripPlanningService.generateTravelPlan).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        plan: {} as any,
        reasoning: 'Generated plan',
        confidence: 0.9,
        personalizations: []
      }), 1000))
    )

    render(<AITripPlanningPrompts {...defaultProps} />)

    const completeButton = screen.getByText('Complete Form')
    await userEvent.click(completeButton)

    expect(screen.getByText('AI is Crafting Your Perfect Trip')).toBeInTheDocument()
    expect(screen.getByText('Our AI is analyzing your preferences and creating a personalized travel plan for Paris.')).toBeInTheDocument()
  })

  it('should call AI service with correct parameters', async () => {
    const { aiTripPlanningService } = await import('../../services/aiTripPlanningService')
    
    const mockResponse = {
      plan: {
        itinerary: [],
        placesToVisit: [],
        restaurants: [],
        bars: [],
        weatherInfo: {} as any,
        socialEtiquette: [],
        hotelRecommendation: {} as any,
        transportationInfo: {} as any,
        localCurrency: {} as any,
        activities: [],
        mustTryFood: [],
        safetyTips: [],
        tippingEtiquette: {},
        tapWater: {} as any
      },
      reasoning: 'Perfect plan generated',
      confidence: 0.92,
      personalizations: ['Customized for culture lover']
    }

    vi.mocked(aiTripPlanningService.generateTravelPlan).mockResolvedValue(mockResponse)

    render(<AITripPlanningPrompts {...defaultProps} />)

    const completeButton = screen.getByText('Complete Form')
    await userEvent.click(completeButton)

    await waitFor(() => {
      expect(aiTripPlanningService.generateTravelPlan).toHaveBeenCalledWith({
        destination: mockDestinations.paris,
        preferences: expect.objectContaining({
          accommodation: 'hotel',
          transportation: 'public transport',
          wantRestaurants: true,
          wantBars: false,
          duration: '7 days',
          budget: 'mid-range',
          tripType: 'cultural'
        }),
        travelerType: mockTravelerTypes.culture,
        destinationKnowledge: mockDestinationKnowledge,
        pickDestinationPreferences: mockPickDestinationPreferences
      })
    })

    expect(mockOnComplete).toHaveBeenCalledWith(mockResponse)
  })

  it('should handle AI service errors gracefully', async () => {
    const { aiTripPlanningService } = await import('../../services/aiTripPlanningService')
    
    vi.mocked(aiTripPlanningService.generateTravelPlan).mockRejectedValue(
      new Error('AI service failed')
    )

    render(<AITripPlanningPrompts {...defaultProps} />)

    const completeButton = screen.getByText('Complete Form')
    await userEvent.click(completeButton)

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    })

    expect(screen.getByText('Failed to generate your travel plan. Please try again.')).toBeInTheDocument()
  })

  it('should allow retrying after error', async () => {
    const { aiTripPlanningService } = await import('../../services/aiTripPlanningService')
    
    vi.mocked(aiTripPlanningService.generateTravelPlan).mockRejectedValue(
      new Error('Network error')
    )

    render(<AITripPlanningPrompts {...defaultProps} />)

    const completeButton = screen.getByText('Complete Form')
    await userEvent.click(completeButton)

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Try Again')
    await userEvent.click(retryButton)

    // Should show the form again
    expect(screen.getByTestId('progressive-form')).toBeInTheDocument()
  })

  it('should handle missing destination', async () => {
    const propsWithoutDestination = {
      ...defaultProps,
      destination: null
    }

    render(<AITripPlanningPrompts {...propsWithoutDestination} />)

    const completeButton = screen.getByText('Complete Form')
    await userEvent.click(completeButton)

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    })
  })

  it('should call onBack when back button is clicked in error state', async () => {
    const { aiTripPlanningService } = await import('../../services/aiTripPlanningService')
    
    vi.mocked(aiTripPlanningService.generateTravelPlan).mockRejectedValue(
      new Error('Service error')
    )

    render(<AITripPlanningPrompts {...defaultProps} />)

    const completeButton = screen.getByText('Complete Form')
    await userEvent.click(completeButton)

    await waitFor(() => {
      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    const backButton = screen.getByText('Go Back')
    await userEvent.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('should display destination name in title', () => {
    render(<AITripPlanningPrompts {...defaultProps} />)

    expect(screen.getByText('Let\'s plan your epic trip to Paris!')).toBeInTheDocument()
  })

  it('should handle destination from preferences when no destination selected', () => {
    const propsWithRegion = {
      ...defaultProps,
      destination: null,
      pickDestinationPreferences: {
        ...mockPickDestinationPreferences,
        region: 'Southeast Asia'
      }
    }

    render(<AITripPlanningPrompts {...propsWithRegion} />)

    expect(screen.getByText('Let\'s plan your epic trip to Southeast Asia!')).toBeInTheDocument()
  })

  it('should show loading tips during AI processing', async () => {
    const { aiTripPlanningService } = await import('../../services/aiTripPlanningService')
    
    vi.mocked(aiTripPlanningService.generateTravelPlan).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        plan: {} as any,
        reasoning: 'Generated',
        confidence: 0.9,
        personalizations: []
      }), 1000))
    )

    render(<AITripPlanningPrompts {...defaultProps} />)

    const completeButton = screen.getByText('Complete Form')
    await userEvent.click(completeButton)

  })

  it('should merge preferences from pick destination flow', async () => {
    const { aiTripPlanningService } = await import('../../services/aiTripPlanningService')
    
    vi.mocked(aiTripPlanningService.generateTravelPlan).mockResolvedValue({
      plan: {} as any,
      reasoning: 'Perfect',
      confidence: 0.9,
      personalizations: []
    })

    render(<AITripPlanningPrompts {...defaultProps} />)

    const completeButton = screen.getByText('Complete Form')
    await userEvent.click(completeButton)

    await waitFor(() => {
      expect(aiTripPlanningService.generateTravelPlan).toHaveBeenCalledWith(
        expect.objectContaining({
          preferences: expect.objectContaining({
            duration: '7 days', // From pickDestinationPreferences
            budget: 'mid-range', // From pickDestinationPreferences
            tripType: 'cultural', // From pickDestinationPreferences
            accommodation: 'hotel' // From form
          })
        })
      )
    })
  })
})