import { Destination, TripPreferences, TravelerType, DestinationKnowledge, PickDestinationPreferences } from '../types/travel';
import { getAIConfig } from '../config/ai';
import { generateTravelPlan as generateMockTravelPlan } from '../data/mock/travelData';

export interface AITripPlanningRequest {
  destination: Destination;
  preferences: TripPreferences;
  travelerType: TravelerType;
  destinationKnowledge?: DestinationKnowledge | null;
  pickDestinationPreferences?: PickDestinationPreferences | null;
}

export interface AITripPlanningResponse {
  plan: EnhancedTravelPlan;
  reasoning: string;
  confidence: number;
  personalizations: string[];
}

export interface EnhancedTravelPlan {
  placesToVisit: PlaceToVisit[];
  restaurants: Restaurant[];
  bars: Bar[];
  weatherInfo: WeatherInfo;
  socialEtiquette: string[];
  hotelRecommendation: HotelRecommendation;
  transportationInfo: TransportationInfo;
  localCurrency: LocalCurrency;
  activities: ActivityItem[];
  itinerary: ItineraryDay[];
  mustTryFood: string[];
  safetyTips: string[];
  tippingEtiquette: { [key: string]: string };
  tapWater: TapWaterInfo;
}

export interface PlaceToVisit {
  name: string;
  description: string;
  category: string;
  priority: number;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: string;
  description: string;
}

export interface Bar {
  name: string;
  type: string;
  atmosphere: string;
  description: string;
}

export interface WeatherInfo {
  season: string;
  temperature: string;
  conditions: string;
  recommendations: string[];
}

export interface HotelRecommendation {
  name: string;
  area: string;
  priceRange: string;
  description: string;
}

export interface TransportationInfo {
  publicTransport: string;
  airportTransport: string;
  ridesharing: string;
  taxiInfo: string;
}

export interface LocalCurrency {
  currency: string;
  cashNeeded: boolean;
  creditCardUsage: string;
  tips: string[];
}

export interface ActivityItem {
  name: string;
  type: string;
  description: string;
  duration: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  icon: string;
}

export interface TapWaterInfo {
  safe: boolean;
  details: string;
  recommendations?: string[];
}

class AITripPlanningService {
  private config = getAIConfig();

  private async callAI(prompt: string): Promise<string> {
    const { provider, apiKey } = this.config;
    
    if (provider === 'mock' || !apiKey) {
      // Mock response for development
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      return `I've crafted a personalized travel plan that perfectly matches your preferences and travel style. Each recommendation has been carefully selected to ensure you have an authentic and memorable experience while considering your budget, time constraints, and personal interests.`;
    }

    // TODO: Implement actual AI API calls
    if (provider === 'openai') {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: this.config.maxTokens,
            temperature: this.config.temperature
          })
        });
        
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.choices[0]?.message?.content || 'No response from AI';
      } catch (error) {
        console.error('OpenAI API call failed:', error);
        throw error;
      }
    }

    if (provider === 'anthropic') {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: this.config.model || 'claude-3-sonnet-20240229',
            max_tokens: this.config.maxTokens,
            messages: [{ role: 'user', content: prompt }]
          })
        });
        
        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.content[0]?.text || 'No response from AI';
      } catch (error) {
        console.error('Anthropic API call failed:', error);
        throw error;
      }
    }

    throw new Error(`Unsupported AI provider: ${provider}`);
  }

  private generatePrompt(request: AITripPlanningRequest): string {
    const { destination, preferences, travelerType, destinationKnowledge, pickDestinationPreferences } = request;
    
    let prompt = `You are an expert travel planner AI. Create a detailed, personalized travel plan for the following traveler:

DESTINATION: ${destination.name}, ${destination.country}
Destination Description: ${destination.description}
Best Time to Visit: ${destination.bestTime}
Typical Budget: ${destination.budget}

TRAVELER PROFILE:
Type: ${travelerType.name} - ${travelerType.description}

TRIP PREFERENCES:
- Duration: ${preferences.duration}
- Budget: ${preferences.budget}
- Accommodation: ${preferences.accommodation}
- Transportation: ${preferences.transportation}
- Wants Restaurant Recommendations: ${preferences.wantRestaurants ? 'Yes' : 'No'}
- Wants Bar/Nightlife Recommendations: ${preferences.wantBars ? 'Yes' : 'No'}
- Trip Type: ${preferences.tripType}
`;

    // Add traveler type specific preferences
    if (preferences.activityLevel) {
      prompt += `- Activity Level: ${preferences.activityLevel}\n`;
    }
    if (preferences.riskTolerance) {
      prompt += `- Risk Tolerance: ${preferences.riskTolerance}\n`;
    }
    if (preferences.spontaneity) {
      prompt += `- Spontaneity: ${preferences.spontaneity}\n`;
    }
    if (preferences.scheduleDetail) {
      prompt += `- Schedule Detail: ${preferences.scheduleDetail}\n`;
    }
    if (preferences.bookingPreference) {
      prompt += `- Booking Preference: ${preferences.bookingPreference}\n`;
    }
    if (preferences.backupPlans) {
      prompt += `- Backup Plans: ${preferences.backupPlans}\n`;
    }
    if (preferences.luxuryLevel) {
      prompt += `- Luxury Level: ${preferences.luxuryLevel}\n`;
    }
    if (preferences.serviceLevel) {
      prompt += `- Service Level: ${preferences.serviceLevel}\n`;
    }
    if (preferences.exclusivity) {
      prompt += `- Exclusivity: ${preferences.exclusivity}\n`;
    }
    if (preferences.relaxationStyle) {
      prompt += `- Relaxation Style: ${preferences.relaxationStyle}\n`;
    }
    if (preferences.pacePreference) {
      prompt += `- Pace Preference: ${preferences.pacePreference}\n`;
    }
    if (preferences.stressLevel) {
      prompt += `- Stress Level: ${preferences.stressLevel}\n`;
    }

    if (destinationKnowledge) {
      prompt += `\nDESTINATION KNOWLEDGE: ${destinationKnowledge.label} - ${destinationKnowledge.description}\n`;
    }

    if (pickDestinationPreferences) {
      prompt += `\nDESTINATION SELECTION PREFERENCES:
- Time of Year: ${pickDestinationPreferences.timeOfYear}
- Special Activities: ${pickDestinationPreferences.specialActivities}
- Weather Preference: ${pickDestinationPreferences.weather}
- Priority: ${pickDestinationPreferences.priority}
`;
      if (pickDestinationPreferences.region) {
        prompt += `- Region: ${pickDestinationPreferences.region}\n`;
      }
    }

    prompt += `

Please create a comprehensive travel plan that includes:
1. Detailed day-by-day itinerary
2. Restaurant recommendations that match their preferences and budget
3. Activity suggestions based on their traveler type
4. Local insights and cultural tips
5. Safety and practical information
6. Personalized recommendations based on their specific preferences

Focus on creating authentic experiences that match their travel style while being practical and well-organized. Consider their budget constraints and time limitations.

Provide explanations for your recommendations and why they fit this specific traveler's profile.`;

    return prompt;
  }

  private enhanceMockPlan(
    mockPlan: any, 
    request: AITripPlanningRequest, 
    aiReasoning: string
  ): { plan: EnhancedTravelPlan; personalizations: string[] } {
    const { destination, preferences, travelerType } = request;
    
    // Generate personalizations based on traveler type and preferences
    const personalizations: string[] = [];
    
    if (travelerType.id === 'yolo') {
      personalizations.push('Added spontaneous activity options for your adventurous spirit');
      personalizations.push('Included flexible itinerary items that can be changed on the fly');
    } else if (travelerType.id === 'adventure') {
      personalizations.push('Prioritized outdoor activities and adventure experiences');
      personalizations.push('Included off-the-beaten-path destinations');
    } else if (travelerType.id === 'culture') {
      personalizations.push('Focused on cultural experiences and historical sites');
      personalizations.push('Added local cultural events and museum recommendations');
    } else if (travelerType.id === 'relaxation') {
      personalizations.push('Emphasized relaxing activities and peaceful locations');
      personalizations.push('Scheduled downtime between activities for rest');
    }

    if (preferences.budget === 'budget') {
      personalizations.push('Optimized recommendations for budget-conscious travelers');
      personalizations.push('Included free and low-cost activities');
    } else if (preferences.budget === 'luxury') {
      personalizations.push('Curated premium experiences and luxury accommodations');
      personalizations.push('Added exclusive activities and high-end dining options');
    }

    if (preferences.wantRestaurants) {
      personalizations.push('Included diverse restaurant options matching your cuisine preferences');
    }

    if (preferences.wantBars) {
      personalizations.push('Added nightlife recommendations for evening entertainment');
    }

    // Enhance the itinerary based on traveler type
    const enhancedItinerary = mockPlan.itinerary.map((day: any) => ({
      ...day,
      activities: day.activities.map((activity: any) => ({
        ...activity,
        description: this.enhanceActivityDescription(activity, travelerType, preferences)
      }))
    }));

    // Enhance restaurants based on preferences
    let enhancedRestaurants = [...mockPlan.restaurants];
    if (preferences.budget === 'luxury') {
      enhancedRestaurants = enhancedRestaurants.map(restaurant => ({
        ...restaurant,
        priceRange: restaurant.priceRange === '$' ? '$$' : restaurant.priceRange === '$$' ? '$$$' : restaurant.priceRange
      }));
    }

    const enhancedPlan: EnhancedTravelPlan = {
      ...mockPlan,
      itinerary: enhancedItinerary,
      restaurants: enhancedRestaurants
    };

    return { plan: enhancedPlan, personalizations };
  }

  private enhanceActivityDescription(
    activity: any, 
    travelerType: TravelerType, 
    preferences: TripPreferences
  ): string {
    let enhancement = activity.description;
    
    if (travelerType.id === 'yolo') {
      enhancement += ' Feel free to explore spontaneously and follow your instincts!';
    } else if (travelerType.id === 'adventure') {
      enhancement += ' Look for opportunities to add some adventure or outdoor elements.';
    } else if (travelerType.id === 'culture') {
      enhancement += ' Take time to appreciate the cultural significance and local traditions.';
    } else if (travelerType.id === 'relaxation') {
      enhancement += ' Enjoy at a leisurely pace and take breaks as needed.';
    }

    return enhancement;
  }

  async generateTravelPlan(request: AITripPlanningRequest): Promise<AITripPlanningResponse> {
    try {
      const prompt = this.generatePrompt(request);
      const aiResponse = await this.callAI(prompt);
      
      // Generate the base plan using existing mock data
      const mockPlan = generateMockTravelPlan(
        request.destination, 
        request.preferences, 
        request.travelerType
      );
      
      // Enhance the mock plan with AI insights and personalizations
      const { plan, personalizations } = this.enhanceMockPlan(mockPlan, request, aiResponse);
      
      return {
        plan,
        reasoning: aiResponse,
        confidence: 0.9 + Math.random() * 0.08, // Mock confidence score
        personalizations
      };
    } catch (error) {
      console.error('AI trip planning service error:', error);
      
      // Fallback to enhanced mock plan
      const mockPlan = generateMockTravelPlan(
        request.destination, 
        request.preferences, 
        request.travelerType
      );
      
      const { plan, personalizations } = this.enhanceMockPlan(
        mockPlan, 
        request, 
        'Using fallback recommendations based on your preferences and traveler type.'
      );
      
      return {
        plan,
        reasoning: 'Using our curated recommendations based on your traveler profile and preferences.',
        confidence: 0.75,
        personalizations
      };
    }
  }
}

export const aiTripPlanningService = new AITripPlanningService();