import { 
  Destination, 
  TripPreferences, 
  TravelerType, 
  DestinationKnowledge, 
  PickDestinationPreferences,
  EnhancedTravelPlan as ImportedEnhancedTravelPlan
} from '../types/travel';

export interface AITripPlanningRequest {
  destination: Destination;
  preferences: TripPreferences;
  travelerType: TravelerType;
  destinationKnowledge?: DestinationKnowledge | null;
  pickDestinationPreferences?: PickDestinationPreferences | null;
}

export interface AITripPlanningResponse {
  plan: ImportedEnhancedTravelPlan;
  reasoning: string;
  confidence: number;
  personalizations: string[];
}

class AITripPlanningService {
  async generateTravelPlan(request: AITripPlanningRequest): Promise<AITripPlanningResponse> {
    try {
      const response = await fetch('/api/ai/trip-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Failed to generate travel plan');
    }
  }
}

export const aiTripPlanningService = new AITripPlanningService();