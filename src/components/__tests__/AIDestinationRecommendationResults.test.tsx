import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AIDestinationRecommendationResults } from '../AIDestinationRecommendationResults'
import { mockTravelerTypes, mockDestinations, mockDestinationKnowledge, mockPickDestinationPreferences, resetMocks } from '../../test/mocks'

// Mock the AI service
vi.mock('../../services/aiDestinationService', () => ({
  aiDestinationService: {
    getDestinationRecommendations: vi.fn()
  }
}))

const mockOnSelect = vi.fn()
const mockOnBack = vi.fn()

const defaultProps = {
  travelerType: mockTravelerTypes.culture,
  onSelect: mockOnSelect,
  onBack: mockOnBack
}

describe('AIDestinationRecommendationResults', () => {
  beforeEach(() => {
    resetMocks()
    mockOnSelect.mockClear()
    mockOnBack.mockClear()
  })

  it('should show loading state initially', async () => {
    const { aiDestinationService } = await import('../../services/aiDestinationService')
    
    // Mock a delayed response
    vi.mocked(aiDestinationService.getDestinationRecommendations).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        destinations: [mockDestinations.paris],
        reasoning: 'Test reasoning',
        confidence: 0.9
      }), 1000))
    )

    render(<AIDestinationRecommendationResults {...defaultProps} />)

    expect(screen.getByText('AI is analyzing your preferences...')).toBeInTheDocument()
    expect(screen.getByText('Finding the perfect destinations that match your travel style')).toBeInTheDocument()
    
    // Should show loading animation
    expect(screen.getByText('AI is analyzing your preferences...')).toBeInTheDocument()
  })

  it('should display AI recommendations after loading', async () => {
    const { aiDestinationService } = await import('../../services/aiDestinationService')
    
    vi.mocked(aiDestinationService.getDestinationRecommendations).mockResolvedValue({
      destinations: [mockDestinations.paris, mockDestinations.tokyo],
      reasoning: 'These destinations match your cultural interests perfectly.',
      confidence: 0.92
    })

    render(<AIDestinationRecommendationResults {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('AI-Curated Destinations for You')).toBeInTheDocument()
    })

    expect(screen.getByText('92% Match Confidence')).toBeInTheDocument()
    expect(screen.getByText('These destinations match your cultural interests perfectly.')).toBeInTheDocument()
  })

  it('should handle AI service errors gracefully', async () => {
    const { aiDestinationService } = await import('../../services/aiDestinationService')
    
    vi.mocked(aiDestinationService.getDestinationRecommendations).mockRejectedValue(
      new Error('AI service unavailable')
    )

    render(<AIDestinationRecommendationResults {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
    })

    expect(screen.getByText('Unable to get AI recommendations. Please try again.')).toBeInTheDocument()
  })

  it('should allow regenerating recommendations', async () => {
    const { aiDestinationService } = await import('../../services/aiDestinationService')
    
    vi.mocked(aiDestinationService.getDestinationRecommendations).mockResolvedValue({
      destinations: [mockDestinations.paris],
      reasoning: 'Initial recommendations',
      confidence: 0.85
    })

    render(<AIDestinationRecommendationResults {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Get New Suggestions')).toBeInTheDocument()
    })

    const regenerateButton = screen.getByText('Get New Suggestions')
    await userEvent.click(regenerateButton)

    // Should show loading state again
    expect(screen.getByText('AI is analyzing your preferences...')).toBeInTheDocument()
  })

  it('should call onBack when back button is clicked', async () => {
    const { aiDestinationService } = await import('../../services/aiDestinationService')
    
    vi.mocked(aiDestinationService.getDestinationRecommendations).mockResolvedValue({
      destinations: [mockDestinations.paris],
      reasoning: 'Test reasoning',
      confidence: 0.9
    })

    render(<AIDestinationRecommendationResults {...defaultProps} />)

    const backButton = screen.getByText('Back')
    await userEvent.click(backButton)

    expect(mockOnBack).toHaveBeenCalledTimes(1)
  })

  it('should handle empty destination results', async () => {
    const { aiDestinationService } = await import('../../services/aiDestinationService')
    
    vi.mocked(aiDestinationService.getDestinationRecommendations).mockResolvedValue({
      destinations: [],
      reasoning: 'No matching destinations found',
      confidence: 0.5
    })

    render(<AIDestinationRecommendationResults {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('No destinations found matching your criteria.')).toBeInTheDocument()
    })

    expect(screen.getByText('Try Different Recommendations')).toBeInTheDocument()
  })

  it('should include preferences in AI request', async () => {
    const { aiDestinationService } = await import('../../services/aiDestinationService')
    
    const mockService = vi.mocked(aiDestinationService.getDestinationRecommendations)
    mockService.mockResolvedValue({
      destinations: [mockDestinations.bali],
      reasoning: 'Perfect for relaxation',
      confidence: 0.88
    })

    const propsWithPreferences = {
      ...defaultProps,
      preferences: mockPickDestinationPreferences,
      destinationKnowledge: mockDestinationKnowledge
    }

    render(<AIDestinationRecommendationResults {...propsWithPreferences} />)

    await waitFor(() => {
      expect(mockService).toHaveBeenCalledWith({
        travelerType: mockTravelerTypes.culture,
        preferences: mockPickDestinationPreferences,
        destinationKnowledge: mockDestinationKnowledge
      })
    })
  })

  it('should display confidence score when available', async () => {
    const { aiDestinationService } = await import('../../services/aiDestinationService')
    
    vi.mocked(aiDestinationService.getDestinationRecommendations).mockResolvedValue({
      destinations: [mockDestinations.tokyo],
      reasoning: 'Excellent match for your preferences',
      confidence: 0.95
    })

    render(<AIDestinationRecommendationResults {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('95% Match Confidence')).toBeInTheDocument()
    })
  })

  it('should handle retry from error state', async () => {
    const { aiDestinationService } = await import('../../services/aiDestinationService')
    
    // First call fails
    vi.mocked(aiDestinationService.getDestinationRecommendations)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        destinations: [mockDestinations.paris],
        reasoning: 'Retry successful',
        confidence: 0.8
      })

    render(<AIDestinationRecommendationResults {...defaultProps} />)

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Try Again')
    await userEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('AI-Curated Destinations for You')).toBeInTheDocument()
    })
  })
})