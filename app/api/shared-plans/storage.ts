import { TravelerType, Destination } from '../../../src/types/travel'
import { AITripPlanningResponse } from '../../../src/services/aiTripPlanningService'

export interface SharedPlanData {
  id: string
  destination: Destination
  travelerType: TravelerType
  aiResponse: AITripPlanningResponse
  createdAt: string
  expiresAt: string
}

// Global shared storage across all API routes
export const sharedPlans = new Map<string, SharedPlanData>()