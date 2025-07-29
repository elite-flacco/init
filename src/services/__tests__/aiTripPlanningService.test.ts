import { describe, it, expect, beforeEach, vi } from 'vitest'
import { aiTripPlanningService } from '../aiTripPlanningService'
import { mockTravelerTypes, mockDestinations, mockDestinationKnowledge, mockPickDestinationPreferences, mockTripPreferences, mockAIResponse, mockFetchResponse, resetMocks } from '../../test/mocks'
import { Destination } from '../../types/travel';

// Mock the AI config
vi.mock('../../config/ai', () => ({
  getAIConfig: () => ({
    provider: 'mock',
    apiKey: undefined,
    model: 'gpt-4',
    maxTokens: 1000,
    temperature: 0.7
  })
}))

// Mock the travel data generator
vi.mock('../../data/mock/travelData', () => ({
  generateTravelPlan: vi.fn(() => ({
    placesToVisit: [
      {
        name: 'Historic Downtown',
        description: 'Explore the charming streets and historic architecture',
        category: 'Sightseeing',
        priority: 1
      }
    ],
    restaurants: [
      {
        name: 'Local Bistro',
        cuisine: 'Local Cuisine',
        priceRange: '$$',
        description: 'Authentic local dishes'
      }
    ],
    bars: [],
    weatherInfo: {
      season: 'Spring',
      temperature: '18-25°C',
      conditions: 'Mild with occasional rain',
      recommendations: ['Pack an umbrella']
    },
    socialEtiquette: ['Greet with a handshake'],
    hotelRecommendations: {
      name: 'Grand Hotel',
      area: 'Downtown',
      priceRange: '$$$',
      description: 'Luxury hotel in the city center'
    },
    transportationInfo: {
      publicTransport: 'Efficient metro system',
      airportTransport: 'Express train available',
      ridesharing: 'Uber available',
      taxiInfo: 'Metered taxis are reliable'
    },
    localCurrency: {
      currency: 'Local Currency',
      cashNeeded: true,
      creditCardUsage: 'Widely accepted',
      tips: ['Tipping 10-15% is customary']
    },
    activities: [
      {
        name: 'City Walking Tour',
        type: 'Sightseeing',
        description: 'Explore with a local guide',
        duration: '2-3 hours'
      }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Day 1: Exploring',
        activities: [
          {
            time: '09:00 AM',
            title: 'Breakfast',
            description: 'Start your day',
            location: 'Hotel',
            icon: 'coffee'
          }
        ]
      }
    ],
    mustTryFood: ['Local Specialty'],
    safetyTips: ['Be aware of surroundings'],
    tipEtiquette: { Restaurants: '10-15%' },
    tapWaterSafe: {
      safe: true,
      details: 'Tap water is safe to drink'
    }
  }))
}))

describe('aiTripPlanningService', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('generateTravelPlan', () => {
    const baseRequest = {
      destination: mockDestinations.paris,
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
        expect(plan.mustTryFood).toBeInstanceOf(Array)
        expect(plan.safetyTips).toBeInstanceOf(Array)
        expect(plan.tipEtiquette).toBeDefined()
        expect(plan.tapWaterSafe).toBeDefined()
      })

      it('should generate personalizations for YOLO traveler', async () => {
        const request = {
          ...baseRequest,
          travelerType: mockTravelerTypes.explorer
        }

        const response = await aiTripPlanningService.generateTravelPlan(request)

        expect(response.personalizations).toContain(
          expect.stringMatching(/spontaneous|flexible/i)
        )
      })

      it('should generate personalizations for adventure traveler', async () => {
        const request = {
          ...baseRequest,
          travelerType: mockTravelerTypes.adventure
        }

        const response = await aiTripPlanningService.generateTravelPlan(request)

        expect(response.personalizations).toContain(
          expect.stringMatching(/outdoor|adventure/i)
        )
      })

      it('should generate personalizations for culture traveler', async () => {
        const request = {
          ...baseRequest,
          travelerType: mockTravelerTypes.culture
        }

        const response = await aiTripPlanningService.generateTravelPlan(request)

        expect(response.personalizations).toContain(
          expect.stringMatching(/cultural|historical/i)
        )
      })

      it('should generate personalizations for relaxation traveler', async () => {
        const request = {
          ...baseRequest,
          travelerType: mockTravelerTypes.relaxation
        }

        const response = await aiTripPlanningService.generateTravelPlan(request)

        expect(response.personalizations).toContain(
          expect.stringMatching(/relaxing|peaceful/i)
        )
      })

      it('should adjust for budget preferences', async () => {
        const budgetRequest = {
          ...baseRequest,
          preferences: {
            ...mockTripPreferences,
            budget: 'budget'
          }
        }

        const response = await aiTripPlanningService.generateTravelPlan(budgetRequest)

        expect(response.personalizations).toContain(
          expect.stringMatching(/budget|low-cost/i)
        )
      })

      it('should adjust for luxury preferences', async () => {
        const luxuryRequest = {
          ...baseRequest,
          preferences: {
            ...mockTripPreferences,
            budget: 'luxury'
          }
        }

        const response = await aiTripPlanningService.generateTravelPlan(luxuryRequest)

        expect(response.personalizations).toContain(
          expect.stringMatching(/premium|luxury|exclusive/i)
        )
      })

      it('should include restaurant personalizations when requested', async () => {
        const restaurantRequest = {
          ...baseRequest,
          preferences: {
            ...mockTripPreferences,
            wantRestaurants: true
          }
        }

        const response = await aiTripPlanningService.generateTravelPlan(restaurantRequest)

        expect(response.personalizations).toContain(
          expect.stringMatching(/restaurant|dining|cuisine/i)
        )
      })

      it('should include nightlife personalizations when requested', async () => {
        const nightlifeRequest = {
          ...baseRequest,
          preferences: {
            ...mockTripPreferences,
            wantBars: true
          }
        }

        const response = await aiTripPlanningService.generateTravelPlan(nightlifeRequest)

        expect(response.personalizations).toContain(
          expect.stringMatching(/nightlife|evening/i)
        )
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
        expect(response.reasoning).toContain('cultural exploration')
      })

      it('should handle OpenAI API errors gracefully', async () => {
        const mockFetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests'
        })
        globalThis.fetch = mockFetch

        const { aiTripPlanningService: mockedService } = await import('../aiTripPlanningService')

        const response = await mockedService.generateTravelPlan(baseRequest)

        // Should fall back to enhanced mock plan
        expect(response.plan).toBeDefined()
        expect(response.reasoning).toContain('curated recommendations')
        expect(response.confidence).toBe(0.75)
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
        expect(response.reasoning).toContain('travel preferences')
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

        const { aiTripPlanningService: mockedService } = await import('../aiTripPlanningService')

        const response = await mockedService.generateTravelPlan(baseRequest)

        // Should fall back to enhanced mock plan
        expect(response.plan).toBeDefined()
        expect(response.reasoning).toContain('curated recommendations')
        expect(response.confidence).toBe(0.75)
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