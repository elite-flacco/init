import { describe, it, expect, beforeEach, vi } from 'vitest'
import { aiDestinationService } from '../aiDestinationService'
import { mockTravelerTypes, mockDestinations, mockDestinationKnowledge, mockPickDestinationPreferences, mockAIResponse, mockFetchResponse, resetMocks } from '../../test/mocks'

// Mock the AI config
vi.mock('../config/ai', () => ({
  getAIConfig: () => ({
    provider: 'mock',
    apiKey: undefined,
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7
  })
}))

describe('aiDestinationService', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('getDestinationRecommendations', () => {
    describe('mock mode', () => {
      it('should return recommendations for YOLO traveler type', async () => {
        const request = {
          travelerType: mockTravelerTypes.yolo
        }

        const response = await aiDestinationService.getDestinationRecommendations(request)

        expect(response).toBeDefined()
        expect(response.destinations).toBeInstanceOf(Array)
        expect(response.destinations.length).toBeGreaterThan(0)
        expect(response.reasoning).toContain('align with your travel style')
        expect(response.confidence).toBeGreaterThan(0.8)
        expect(response.confidence).toBeLessThanOrEqual(1)
      })

      it('should return recommendations for adventure traveler type', async () => {
        const request = {
          travelerType: mockTravelerTypes.adventure
        }

        const response = await aiDestinationService.getDestinationRecommendations(request)

        expect(response).toBeDefined()
        expect(response.destinations).toBeInstanceOf(Array)
        expect(response.destinations.length).toBeGreaterThan(0)
        
        // Should prioritize adventure destinations
        const hasAdventureDestinations = response.destinations.some(dest => 
          ['iceland', 'new-zealand', 'costa-rica'].includes(dest.id)
        )
        expect(hasAdventureDestinations).toBe(true)
      })

      it('should return recommendations for culture traveler type', async () => {
        const request = {
          travelerType: mockTravelerTypes.culture
        }

        const response = await aiDestinationService.getDestinationRecommendations(request)

        expect(response).toBeDefined()
        expect(response.destinations).toBeInstanceOf(Array)
        
        // Should prioritize cultural destinations
        const hasCulturalDestinations = response.destinations.some(dest => 
          ['japan', 'greece', 'italy'].includes(dest.id)
        )
        expect(hasCulturalDestinations).toBe(true)
      })

      it('should filter by budget preferences', async () => {
        const requestBudget = {
          travelerType: mockTravelerTypes.yolo,
          preferences: {
            ...mockPickDestinationPreferences,
            budget: 'budget'
          }
        }

        const response = await aiDestinationService.getDestinationRecommendations(requestBudget)

        expect(response.destinations.length).toBeGreaterThan(0)
        // Should include budget-friendly destinations
        const hasBudgetDestinations = response.destinations.some(dest => 
          ['thailand', 'vietnam', 'costa-rica'].includes(dest.id)
        )
        expect(hasBudgetDestinations).toBe(true)
      })

      it('should filter by trip type preferences', async () => {
        const requestCultural = {
          travelerType: mockTravelerTypes.culture,
          preferences: {
            ...mockPickDestinationPreferences,
            tripType: 'cultural'
          }
        }

        const response = await aiDestinationService.getDestinationRecommendations(requestCultural)

        expect(response.destinations.length).toBeGreaterThan(0)
        // Should include cultural destinations
        const hasCulturalDestinations = response.destinations.some(dest => 
          ['japan', 'greece', 'italy', 'egypt'].includes(dest.id)
        )
        expect(hasCulturalDestinations).toBe(true)
      })

      it('should filter by weather preferences', async () => {
        const requestWarm = {
          travelerType: mockTravelerTypes.relaxation,
          preferences: {
            ...mockPickDestinationPreferences,
            weather: 'warm'
          }
        }

        const response = await aiDestinationService.getDestinationRecommendations(requestWarm)

        expect(response.destinations.length).toBeGreaterThan(0)
        // Should include warm weather destinations
        const hasWarmDestinations = response.destinations.some(dest => 
          ['bali', 'thailand', 'costa-rica', 'greece'].includes(dest.id)
        )
        expect(hasWarmDestinations).toBe(true)
      })

      it('should include destination knowledge in recommendations', async () => {
        const request = {
          travelerType: mockTravelerTypes.culture,
          destinationKnowledge: mockDestinationKnowledge
        }

        const response = await aiDestinationService.getDestinationRecommendations(request)

        expect(response).toBeDefined()
        expect(response.destinations).toBeInstanceOf(Array)
        expect(response.reasoning).toContain('align with your travel style')
      })

      it('should handle empty filter results gracefully', async () => {
        const request = {
          travelerType: mockTravelerTypes.yolo,
          preferences: {
            ...mockPickDestinationPreferences,
            budget: 'luxury',
            tripType: 'adventure',
            weather: 'cool'
          }
        }

        const response = await aiDestinationService.getDestinationRecommendations(request)

        expect(response.destinations.length).toBeGreaterThan(0)
        expect(response.destinations.length).toBeLessThanOrEqual(6)
      })
    })

    describe('OpenAI mode', () => {
      beforeEach(() => {
        vi.doMock('../config/ai', () => ({
          getAIConfig: () => ({
            provider: 'openai',
            apiKey: 'test-api-key',
            model: 'gpt-4',
            maxTokens: 1000,
            temperature: 0.7
          })
        }))
      })

      it('should call OpenAI API and return processed results', async () => {
        const mockFetch = vi.fn().mockResolvedValue(
          mockFetchResponse(mockAIResponse.openai)
        )
        global.fetch = mockFetch

        // Re-import to get the mocked config
        const { aiDestinationService: mockedService } = await import('../aiDestinationService')

        const request = {
          travelerType: mockTravelerTypes.culture
        }

        const response = await mockedService.getDestinationRecommendations(request)

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.openai.com/v1/chat/completions',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-api-key',
              'Content-Type': 'application/json'
            })
          })
        )

        expect(response.destinations).toBeInstanceOf(Array)
        expect(response.reasoning).toContain('cultural exploration')
      })

      it('should handle OpenAI API errors gracefully', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          statusText: 'Unauthorized'
        })
        global.fetch = mockFetch

        const { aiDestinationService: mockedService } = await import('../aiDestinationService')

        const request = {
          travelerType: mockTravelerTypes.culture
        }

        const response = await mockedService.getDestinationRecommendations(request)

        // Should fall back to basic filtering
        expect(response.destinations).toBeInstanceOf(Array)
        expect(response.reasoning).toContain('fallback recommendations')
        expect(response.confidence).toBe(0.6)
      })
    })

    describe('Anthropic mode', () => {
      beforeEach(() => {
        vi.doMock('../config/ai', () => ({
          getAIConfig: () => ({
            provider: 'anthropic',
            apiKey: 'test-anthropic-key',
            model: 'claude-3-sonnet-20240229',
            maxTokens: 1000,
            temperature: 0.7
          })
        }))
      })

      it('should call Anthropic API and return processed results', async () => {
        const mockFetch = vi.fn().mockResolvedValue(
          mockFetchResponse(mockAIResponse.anthropic)
        )
        global.fetch = mockFetch

        const { aiDestinationService: mockedService } = await import('../aiDestinationService')

        const request = {
          travelerType: mockTravelerTypes.adventure
        }

        const response = await mockedService.getDestinationRecommendations(request)

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.anthropic.com/v1/messages',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'x-api-key': 'test-anthropic-key',
              'Content-Type': 'application/json',
              'anthropic-version': '2023-06-01'
            })
          })
        )

        expect(response.destinations).toBeInstanceOf(Array)
        expect(response.reasoning).toContain('travel preferences')
      })

      it('should handle Anthropic API errors gracefully', async () => {
        const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
        global.fetch = mockFetch

        const { aiDestinationService: mockedService } = await import('../aiDestinationService')

        const request = {
          travelerType: mockTravelerTypes.adventure
        }

        const response = await mockedService.getDestinationRecommendations(request)

        // Should fall back to basic filtering
        expect(response.destinations).toBeInstanceOf(Array)
        expect(response.reasoning).toContain('fallback recommendations')
        expect(response.confidence).toBe(0.6)
      })
    })

    describe('prompt generation', () => {
      it('should generate comprehensive prompts with all user data', async () => {
        const request = {
          travelerType: mockTravelerTypes.culture,
          preferences: mockPickDestinationPreferences,
          destinationKnowledge: mockDestinationKnowledge
        }

        // We can't directly test the private method, but we can verify the service handles complex requests
        const response = await aiDestinationService.getDestinationRecommendations(request)

        expect(response).toBeDefined()
        expect(response.destinations).toBeInstanceOf(Array)
        expect(response.reasoning).toBeDefined()
        expect(response.confidence).toBeGreaterThan(0)
      })

      it('should handle minimal request data', async () => {
        const request = {
          travelerType: mockTravelerTypes.yolo
        }

        const response = await aiDestinationService.getDestinationRecommendations(request)

        expect(response).toBeDefined()
        expect(response.destinations).toBeInstanceOf(Array)
        expect(response.reasoning).toBeDefined()
      })
    })

    describe('response processing', () => {
      it('should return valid destination objects', async () => {
        const request = {
          travelerType: mockTravelerTypes.culture
        }

        const response = await aiDestinationService.getDestinationRecommendations(request)

        response.destinations.forEach(destination => {
          expect(destination).toHaveProperty('id')
          expect(destination).toHaveProperty('name')
          expect(destination).toHaveProperty('country')
          expect(destination).toHaveProperty('description')
          expect(destination).toHaveProperty('image')
          expect(destination).toHaveProperty('highlights')
          expect(destination).toHaveProperty('bestTime')
          expect(destination).toHaveProperty('budget')
        })
      })

      it('should limit results to maximum 6 destinations', async () => {
        const request = {
          travelerType: mockTravelerTypes.yolo
        }

        const response = await aiDestinationService.getDestinationRecommendations(request)

        expect(response.destinations.length).toBeLessThanOrEqual(6)
      })

      it('should include confidence score between 0 and 1', async () => {
        const request = {
          travelerType: mockTravelerTypes.culture
        }

        const response = await aiDestinationService.getDestinationRecommendations(request)

        expect(response.confidence).toBeGreaterThan(0)
        expect(response.confidence).toBeLessThanOrEqual(1)
      })
    })
  })
})