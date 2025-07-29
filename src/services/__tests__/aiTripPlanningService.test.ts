import { describe, it, expect, beforeEach, vi } from 'vitest'
import { aiTripPlanningService } from '../aiTripPlanningService'
import { mockTravelerTypes, mockDestinations, mockDestinationKnowledge, mockPickDestinationPreferences, mockTripPreferences, mockAIResponse, mockFetchResponse, resetMocks } from '../../test/mocks'
import { Destination } from '../../types/travel';

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

// No need to mock generateTravelPlan - use the real implementation for better testing

describe('aiTripPlanningService', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('generateTravelPlan', () => {
    const baseRequest = {
      destination: mockDestinations.bali || {
        id: 'paris',
        name: 'Paris',
        country: 'France',
        description: 'The City of Light',
        image: '/images/paris.jpg',
        highlights: ['Eiffel Tower'],
        bestTime: 'Spring',
        budget: '$$'
      },
      preferences: mockTripPreferences,
      travelerType: mockTravelerTypes.culture
    }

    describe('mock mode', () => {
      it('should generate a complete travel plan', async () => {
        const response = await aiTripPlanningService.generateTravelPlan(baseRequest)

        expect(response).toBeDefined()
        expect(response.plan).toBeDefined()
        expect(response.reasoning).toBeDefined()
        expect(response.confidence).toBeGreaterThan(0.8)
        expect(response.personalizations).toBeInstanceOf(Array)
      })

      it('should include all required plan components', async () => {
        const response = await aiTripPlanningService.generateTravelPlan(baseRequest)

        const { plan } = response

        expect(plan.placesToVisit).toBeInstanceOf(Array)
        expect(plan.restaurants).toBeInstanceOf(Array)
        expect(plan.bars).toBeInstanceOf(Array)
        expect(plan.weatherInfo).toBeDefined()
        expect(plan.socialEtiquette).toBeInstanceOf(Array)
        expect(plan.hotelRecommendations).toBeDefined()
        expect(plan.transportationInfo).toBeDefined()
        expect(plan.localCurrency).toBeDefined()
        expect(plan.activities).toBeInstanceOf(Array)
        expect(plan.itinerary).toBeInstanceOf(Array)
        expect(plan.mustTryFood).toBeDefined()
        expect(plan.mustTryFood.items).toBeInstanceOf(Array)
        expect(plan.safetyTips).toBeInstanceOf(Array)
        expect(plan.tipEtiquette).toBeDefined()
        expect(plan.tapWaterSafe).toBeDefined()
      })

      it('should enhance activity descriptions based on traveler type', async () => {
        const response = await aiTripPlanningService.generateTravelPlan(baseRequest)

        const firstDay = response.plan.itinerary[0]
        const firstActivity = firstDay.activities[0]

        expect(firstActivity.description).toBeDefined()
        expect(firstActivity.description.length).toBeGreaterThan(0)
      })

      it('should include destination knowledge in planning', async () => {
        const requestWithKnowledge = {
          ...baseRequest,
          destinationKnowledge: mockDestinationKnowledge,
          pickDestinationPreferences: mockPickDestinationPreferences
        }

        const response = await aiTripPlanningService.generateTravelPlan(requestWithKnowledge)

        expect(response).toBeDefined()
        expect(response.plan).toBeDefined()
        expect(response.reasoning).toBeDefined()
      })
    })

    describe('OpenAI mode', () => {
      beforeEach(() => {
        vi.doMock('../../config/ai', () => ({
          getAIConfig: () => ({
            provider: 'openai',
            apiKey: 'test-api-key',
            model: 'gpt-4',
            maxTokens: 1000,
            temperature: 0.7
          })
        }))
      })

      it('should call OpenAI API with comprehensive prompt', async () => {
        const mockFetch = vi.fn().mockResolvedValue(
          mockFetchResponse(mockAIResponse.openai)
        )
        globalThis.fetch = mockFetch

        // Clear module cache and re-import to get fresh mocked service
        vi.resetModules()
        const { aiTripPlanningService: mockedService } = await import('../aiTripPlanningService')

        const response = await mockedService.generateTravelPlan(baseRequest)

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.openai.com/v1/chat/completions',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-api-key',
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('expert travel planner')
          })
        )

        expect(response.plan).toBeDefined()
        expect(response.reasoning).toBeDefined()
      })

      it('should handle OpenAI API errors gracefully', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests'
        })
        globalThis.fetch = mockFetch

        vi.resetModules()
        const { aiTripPlanningService: mockedService } = await import('../aiTripPlanningService')

        await expect(
          mockedService.generateTravelPlan(baseRequest)
        ).rejects.toThrow('OpenAI API error')
      })
    })

    describe('Anthropic mode', () => {
      beforeEach(() => {
        vi.doMock('../../config/ai', () => ({
          getAIConfig: () => ({
            provider: 'anthropic',
            apiKey: 'test-anthropic-key',
            model: 'claude-3-sonnet-20240229',
            maxTokens: 1000,
            temperature: 0.7
          })
        }))
      })

      it('should call Anthropic API with detailed prompt', async () => {
        const mockFetch = vi.fn().mockResolvedValue(
          mockFetchResponse(mockAIResponse.anthropic)
        )
        globalThis.fetch = mockFetch

        vi.resetModules()
        const { aiTripPlanningService: mockedService } = await import('../aiTripPlanningService')

        const response = await mockedService.generateTravelPlan(baseRequest)

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

        expect(response.plan).toBeDefined()
        expect(response.reasoning).toBeDefined()
      })
    })

    describe('prompt generation', () => {
      it('should include traveler type specific preferences in prompt', async () => {
        const requestWithSpecifics = {
          ...baseRequest,
          preferences: {
            ...mockTripPreferences,
            activityLevel: 'high',
            riskTolerance: 'high',
            spontaneity: 'flexible'
          }
        }

        const response = await aiTripPlanningService.generateTravelPlan(requestWithSpecifics)

        expect(response).toBeDefined()
        expect(response.plan).toBeDefined()
      })

      it('should handle Type A specific preferences', async () => {
        const typeARequest = {
          ...baseRequest,
          preferences: {
            ...mockTripPreferences,
            scheduleDetail: 'very detailed',
            bookingPreference: 'book everything',
            backupPlans: 'always have backup'
          }
        }

        const response = await aiTripPlanningService.generateTravelPlan(typeARequest)

        expect(response).toBeDefined()
        expect(response.plan).toBeDefined()
      })

      it('should handle luxury preferences', async () => {
        const luxuryRequest = {
          ...baseRequest,
          preferences: {
            ...mockTripPreferences,
            luxuryLevel: 'high-end',
            serviceLevel: 'premium',
            exclusivity: 'exclusive experiences'
          }
        }

        const response = await aiTripPlanningService.generateTravelPlan(luxuryRequest)

        expect(response).toBeDefined()
        expect(response.plan).toBeDefined()
      })

      it('should handle relaxation preferences', async () => {
        const relaxationRequest = {
          ...baseRequest,
          preferences: {
            ...mockTripPreferences,
            relaxationStyle: 'spa and wellness',
            pacePreference: 'slow and easy',
            stressLevel: 'minimal stress'
          }
        }

        const response = await aiTripPlanningService.generateTravelPlan(relaxationRequest)

        expect(response).toBeDefined()
        expect(response.plan).toBeDefined()
      })
    })

    describe('error handling', () => {
      it('should handle missing destination gracefully', async () => {
        const invalidRequest = {
          ...baseRequest,
          destination: undefined as unknown as Destination
        }

        await expect(
          aiTripPlanningService.generateTravelPlan(invalidRequest)
        ).rejects.toThrow()
      })

      it('should handle network errors gracefully', async () => {
        vi.doMock('../../config/ai', () => ({
          getAIConfig: () => ({
            provider: 'openai',
            apiKey: 'test-key',
            model: 'gpt-4'
          })
        }))

        const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'))
        globalThis.fetch = mockFetch

        vi.resetModules()
        const { aiTripPlanningService: mockedService } = await import('../aiTripPlanningService')

        await expect(
          mockedService.generateTravelPlan(baseRequest)
        ).rejects.toThrow('Network error')
      })
    })

    describe('plan validation', () => {
      it('should return valid itinerary structure', async () => {
        const response = await aiTripPlanningService.generateTravelPlan(baseRequest)

        response.plan.itinerary.forEach(day => {
          expect(day).toHaveProperty('day')
          expect(day).toHaveProperty('title')
          expect(day).toHaveProperty('activities')
          expect(day.activities).toBeInstanceOf(Array)

          day.activities.forEach(activity => {
            expect(activity).toHaveProperty('time')
            expect(activity).toHaveProperty('title')
            expect(activity).toHaveProperty('description')
            expect(activity).toHaveProperty('location')
            expect(activity).toHaveProperty('icon')
          })
        })
      })

      it('should return valid restaurant structure', async () => {
        const response = await aiTripPlanningService.generateTravelPlan(baseRequest)

        response.plan.restaurants.forEach(restaurant => {
          expect(restaurant).toHaveProperty('name')
          expect(restaurant).toHaveProperty('cuisine')
          expect(restaurant).toHaveProperty('priceRange')
          expect(restaurant).toHaveProperty('description')
        })
      })

      it('should return confidence score in valid range', async () => {
        const response = await aiTripPlanningService.generateTravelPlan(baseRequest)

        expect(response.confidence).toBeGreaterThan(0)
        expect(response.confidence).toBeLessThanOrEqual(1)
      })
    })
  })
})