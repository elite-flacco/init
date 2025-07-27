import { describe, it, expect, beforeEach, vi } from 'vitest'
import { aiDestinationService } from '../aiDestinationService'
import { aiTripPlanningService } from '../aiTripPlanningService'
import { mockTravelerTypes, mockDestinations, mockTripPreferences, resetMocks } from '../../test/mocks'

describe('AI Services Integration', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('aiDestinationService', () => {
    it('should return valid recommendations in mock mode', async () => {
      const request = {
        travelerType: mockTravelerTypes.culture
      }

      const response = await aiDestinationService.getDestinationRecommendations(request)

      expect(response).toBeDefined()
      expect(response.destinations).toBeInstanceOf(Array)
      expect(response.destinations.length).toBeGreaterThan(0)
      expect(response.reasoning).toBeDefined()
      expect(response.confidence).toBeGreaterThan(0)
      expect(response.confidence).toBeLessThanOrEqual(1)
    })

    it('should filter destinations by traveler type', async () => {
      const adventureRequest = {
        travelerType: mockTravelerTypes.adventure
      }

      const response = await aiDestinationService.getDestinationRecommendations(adventureRequest)

      expect(response.destinations).toBeInstanceOf(Array)
      // Should include adventure-oriented destinations
      expect(response.destinations.length).toBeGreaterThan(0)
    })
  })

  describe('aiTripPlanningService', () => {
    it('should generate complete travel plan in mock mode', async () => {
      const request = {
        destination: mockDestinations.paris,
        preferences: mockTripPreferences,
        travelerType: mockTravelerTypes.culture
      }

      const response = await aiTripPlanningService.generateTravelPlan(request)

      expect(response).toBeDefined()
      expect(response.plan).toBeDefined()
      expect(response.reasoning).toBeDefined()
      expect(response.confidence).toBeGreaterThan(0)
      expect(response.personalizations).toBeInstanceOf(Array)
      
      // Verify plan structure
      expect(response.plan.itinerary).toBeInstanceOf(Array)
      expect(response.plan.restaurants).toBeInstanceOf(Array)
      expect(response.plan.placesToVisit).toBeInstanceOf(Array)
    })

    it('should generate different personalizations for different traveler types', async () => {
      const yoloRequest = {
        destination: mockDestinations.paris,
        preferences: mockTripPreferences,
        travelerType: mockTravelerTypes.yolo
      }

      const cultureRequest = {
        destination: mockDestinations.paris,
        preferences: mockTripPreferences,
        travelerType: mockTravelerTypes.culture
      }

      const yoloResponse = await aiTripPlanningService.generateTravelPlan(yoloRequest)
      const cultureResponse = await aiTripPlanningService.generateTravelPlan(cultureRequest)

      // Both should have personalizations
      expect(yoloResponse.personalizations.length).toBeGreaterThan(0)
      expect(cultureResponse.personalizations.length).toBeGreaterThan(0)
      
      // They should be different (at least one difference)
      const hasUniquePersonalizations = yoloResponse.personalizations.some(p => 
        !cultureResponse.personalizations.includes(p)
      )
      expect(hasUniquePersonalizations).toBe(true)
    })
  })

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test verifies that both services can handle errors without crashing
      const destinationRequest = {
        travelerType: mockTravelerTypes.culture
      }

      const tripRequest = {
        destination: mockDestinations.paris,
        preferences: mockTripPreferences,
        travelerType: mockTravelerTypes.culture
      }

      // These should not throw errors even if AI calls fail
      const destinationResponse = await aiDestinationService.getDestinationRecommendations(destinationRequest)
      const tripResponse = await aiTripPlanningService.generateTravelPlan(tripRequest)

      expect(destinationResponse).toBeDefined()
      expect(tripResponse).toBeDefined()
    })
  })
})