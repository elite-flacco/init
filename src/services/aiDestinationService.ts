import { TravelerType, PickDestinationPreferences, Destination } from '../types/travel';

export interface AIDestinationRequest {
  travelerType: TravelerType;
  preferences?: PickDestinationPreferences;
  destinationKnowledge?: {
    type: 'yes' | 'country' | 'no-clue';
    label: string;
    description: string;
  };
}

export interface AIDestinationResponse {
  destinations: Destination[];
  reasoning: string;
  confidence: number;
}

class AIDestinationService {
  async getDestinationRecommendations(request: AIDestinationRequest): Promise<AIDestinationResponse> {
    const response = await fetch('/api/ai/destinations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to get destination recommendations');
    }

    return await response.json();
  }
}

export const aiDestinationService = new AIDestinationService();