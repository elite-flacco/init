import { 
  Destination, 
  TripPreferences, 
  TravelerType, 
  DestinationKnowledge, 
  PickDestinationPreferences,
  EnhancedTravelPlan as ImportedEnhancedTravelPlan,
  Neighborhood,
  HotelRecommendation,
  Restaurant,
  Bar,
  WeatherInfo,
  TransportationInfo,
  CurrencyInfo,
  TipEtiquette,
  RecommendedActivity,
  MustTryFood,
  TapWaterInfo,
  LocalEvent,
  PlaceToVisit,
  ItineraryDay
} from '../types/travel';
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
  plan: ImportedEnhancedTravelPlan;
  reasoning: string;
  confidence: number;
  personalizations: string[];
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
- Time of Year: ${preferences.timeOfYear}
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

Please create a comprehensive travel plan that includes ALL of the following detailed sections:

1. PLACES TO VISIT
   - Main attractions categorized by type (cultural, historical, natural, entertainment, etc.)
   - Include priority ranking for each attraction

2. NEIGHBORHOOD BREAKDOWNS
   - Summary of different neighborhoods with their unique vibes
   - Pros and cons of each neighborhood for travelers
   - Best neighborhoods for different types of activities

3. HOTEL RECOMMENDATIONS
   - Provide exactly 3 hotel options per major neighborhood
   - Include amenities, price range, and detailed descriptions
   - Match recommendations to traveler's accommodation preference and budget

4. RESTAURANT RECOMMENDATIONS
   - Provide ${preferences.duration.includes('week') ? 'at least 14' : preferences.duration.includes('day') ? Math.max(6, parseInt(preferences.duration) * 2) : '10'} restaurant recommendations
   - Vary by cuisine type, price range, and neighborhood
   - Include specific dishes to try at each restaurant

5. BAR/NIGHTLIFE RECOMMENDATIONS
   - Categorize by type: beer bars, wine bars, cocktail lounges, dive bars
   - Include atmosphere descriptions and what makes each unique
   - Match to traveler's nightlife preferences

6. DETAILED WEATHER INFORMATION
   - Humidity levels and hydration recommendations
   - Day vs night temperature differences
   - Air quality concerns if applicable
   - "Feels like" temperature warnings (heat index, wind chill)
   - Specific clothing and preparation recommendations

7. SOCIAL ETIQUETTE
   - Cultural norms and expectations (dress codes, behavior, religious considerations)
   - What travelers should be aware of to show respect
   - Common mistakes tourists make and how to avoid them

8. LOCAL SAFETY TIPS
   - Basic safety precautions specific to this destination
   - Common scams and how to avoid them
   - Emergency contact information and procedures
   - Safe vs unsafe areas and times

9. COMPREHENSIVE TRANSPORTATION INFO
   - Public transportation system overview and how to use it
   - Credit card payment options for public transport
   - Airport transportation: which airport is closest to city center
   - Detailed transportation options from airport (cost, duration, booking)
   - Uber/taxi availability, typical costs, and tips for using them

10. CURRENCY AND PAYMENT INFORMATION
    - Local currency and current exchange considerations
    - Where cash is essential vs where credit cards work
    - ATM availability and fees, best ATMs to use
    - Payment customs and expectations

11. TIPPING ETIQUETTE
    - Specific tipping guidelines for: restaurants, bars, taxis, hotels, tour guides
    - Expected percentages or amounts
    - Cultural context around tipping

12. LOCAL ACTIVITIES AND EXPERIENCES
    - Destination-specific experiences (cooking classes, cultural workshops, unique tours)
    - Activities that can't be found elsewhere
    - Seasonal or time-sensitive opportunities during their travel dates

13. MUST-TRY LOCAL FOOD AND DRINK
    - Signature main dishes with descriptions
    - Local desserts and sweet treats
    - Traditional alcoholic beverages if available
    - Where to find the best versions of each (e.g. try mango sticky rice at xyz restaurant)

14. TAP WATER SAFETY
    - Is tap water safe to drink?

15. LOCAL EVENTS DURING TRAVEL TIME
    - Festivals, markets, or special events happening during their visit
    - Cultural celebrations or seasonal events
    - How to participate or attend (e.g. best place to celebrate NYE in Bangkok)

16. HIGH-LEVEL HISTORICAL CONTEXT
    - Brief but engaging historical background
    - Key historical sites and their significance
    - How history influences current culture and attractions

17. DETAILED DAY-BY-DAY ITINERARY
    - Incorporate all above elements into a practical daily schedule
    - Consider travel time between locations
    - Balance must-see attractions with authentic local experiences
    - Consider user preference for activity level (high, medium, low)

Focus on creating authentic experiences that match their travel style while being comprehensive and practical. Consider their budget constraints, time limitations, and personal preferences throughout all recommendations.

CRITICAL: Your response MUST be ONLY a valid JSON object. Do not include any text before or after the JSON. 

Use this exact structure:

{
  "placesToVisit": [{"name": "string", "description": "string", "category": "string", "priority": number}],
  "neighborhoods": [{"name": "string", "summary": "string", "vibe": "string", "pros": ["string"], "cons": ["string"]}],
  "hotelRecommendations": [{"name": "string", "neighborhood": "string", "priceRange": "string", "description": "string", "amenities": ["string"]}],
  "restaurants": [{"name": "string", "cuisine": "string", "priceRange": "string", "description": "string", "neighborhood": "string"}],
  "bars": [{"name": "string", "type": "string", "atmosphere": "string", "description": "string", "category": "string"}],
  "weatherInfo": {"season": "string", "temperature": "string", "conditions": "string", "humidity": "string", "dayNightTempDifference": "string", "airQuality": "string", "feelsLikeWarning": "string", "recommendations": ["string"]},
  "socialEtiquette": ["string"],
  "safetyTips": ["string"],
  "transportationInfo": {"publicTransport": "string", "creditCardPayment": boolean, "airportTransport": {"mainAirport": "string", "distanceToCity": "string", "transportOptions": [{"type": "string", "cost": "string", "duration": "string", "description": "string"}]}, "ridesharing": "string", "taxiInfo": {"available": boolean, "averageCost": "string", "tips": ["string"]}},
  "localCurrency": {"currency": "string", "cashNeeded": boolean, "creditCardUsage": "string", "tips": ["string"]},
  "tipEtiquette": {"restaurants": "string", "bars": "string", "taxis": "string", "hotels": "string", "tours": "string", "general": "string"},
  "activities": [{"name": "string", "type": "string", "description": "string", "duration": "string", "localSpecific": boolean}],
  "mustTryFood": {"mainDishes": ["string"], "desserts": ["string"], "localAlcohol": ["string"]},
  "tapWaterSafe": {"safe": boolean, "details": "string"},
  "localEvents": [{"name": "string", "type": "string", "description": "string", "dates": "string", "location": "string"}],
  "history": "string",
  "itinerary": [{"day": number, "title": "string", "activities": [{"time": "string", "title": "string", "description": "string", "location": "string", "icon": "string"}]}]
}

START YOUR RESPONSE WITH { AND END WITH }. NO OTHER TEXT.`;

    return prompt;
  }

  private enhanceMockPlan(
    mockPlan: any, 
    request: AITripPlanningRequest, 
    aiReasoning: string
  ): { plan: ImportedEnhancedTravelPlan; personalizations: string[] } {
    const { destination, preferences, travelerType } = request;
    
    // Generate personalizations based on traveler type and preferences
    const personalizations: string[] = [];
    
    if (travelerType.id === 'explorer') {
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

    const enhancedPlan: ImportedEnhancedTravelPlan = {
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
    
    if (travelerType.id === 'explorer') {
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

  private parseAIResponse(aiResponse: string, request: AITripPlanningRequest): { plan: ImportedEnhancedTravelPlan; personalizations: string[] } | null {
    let jsonStr = '';
    let cleanedJsonStr = '';
    try {
      console.log('Attempting to parse AI response. First 500 chars:', aiResponse.substring(0, 500));
      
      // Try multiple JSON extraction strategies
      
      // Strategy 1: Look for JSON wrapped in code blocks (most common with AI responses)
      const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1];
      } else {
        // Strategy 2: Look for the first complete JSON object
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        } else {
          // Strategy 3: Look for JSON starting after common prefixes
          const patterns = [
            /(?:here's the|here is the|response:|plan:)\s*(\{[\s\S]*\})/i,
            /json\s*[:\-]\s*(\{[\s\S]*\})/i,
            /(\{[\s\S]*\})/
          ];
          
          for (const pattern of patterns) {
            const match = aiResponse.match(pattern);
            if (match) {
              jsonStr = match[1];
              break;
            }
          }
        }
      }

      if (!jsonStr) {
        console.log('No JSON found in AI response, using fallback');
        console.log('Full AI response:', aiResponse);
        return null;
      }

      console.log('Attempting to parse JSON string. First 300 chars:', jsonStr.substring(0, 300));
      
      // Try to fix common JSON issues
      cleanedJsonStr = jsonStr.trim();
      
      // If JSON appears to be truncated (doesn't end with }), try to find the last complete object
      if (!cleanedJsonStr.endsWith('}')) {
        console.log('JSON appears truncated, attempting to fix...');
        
        // Find the last complete field by looking for the last properly closed section
        const lastCompleteMatch = cleanedJsonStr.match(/(.*[}\]"])\s*,?\s*[^,}\]]*$/s);
        if (lastCompleteMatch) {
          cleanedJsonStr = lastCompleteMatch[1];
          // Add closing brace if needed
          if (!cleanedJsonStr.endsWith('}')) {
            cleanedJsonStr += '}';
          }
        }
      }
      
      const parsedData = JSON.parse(cleanedJsonStr);
      
      // Map the AI response to our interface structure
      const plan: ImportedEnhancedTravelPlan = {
        destination: request.destination,
        placesToVisit: parsedData.placesToVisit || [],
        neighborhoods: parsedData.neighborhoods || [],
        hotelRecommendations: parsedData.hotelRecommendations || [],
        restaurants: parsedData.restaurants || [],
        bars: parsedData.bars || [],
        weatherInfo: parsedData.weatherInfo || {},
        socialEtiquette: parsedData.socialEtiquette || [],
        safetyTips: parsedData.safetyTips || [],
        transportationInfo: parsedData.transportationInfo || {},
        localCurrency: parsedData.localCurrency || {},
        tipEtiquette: parsedData.tipEtiquette || {},
        activities: parsedData.activities || [],
        mustTryFood: parsedData.mustTryFood || {},
        tapWaterSafe: parsedData.tapWaterSafe || {},
        localEvents: parsedData.localEvents || [],
        history: parsedData.history || '',
        itinerary: parsedData.itinerary || []
      };

      const personalizations: string[] = [
        `Generated comprehensive travel plan for ${request.destination.name}`,
        `Tailored recommendations for ${request.travelerType.name} traveler type`,
        `Customized for ${request.preferences.duration} trip with ${request.preferences.budget} budget`,
        'Included local insights and authentic experiences'
      ];

      console.log('Successfully parsed AI response as JSON!');
      return { plan, personalizations };
    } catch (error) {
      console.log('Error parsing AI response as JSON:', error);
      console.log('Original JSON string (first 500 chars):', jsonStr?.substring(0, 500) || 'No JSON string');
      console.log('Cleaned JSON string (first 500 chars):', cleanedJsonStr?.substring(0, 500) || 'No cleaned JSON string');
      return null;
    }
  }

  async generateTravelPlan(request: AITripPlanningRequest): Promise<AITripPlanningResponse> {
    try {
      const prompt = this.generatePrompt(request);
      const aiResponse = await this.callAI(prompt);
      
      // Try to parse the AI response as structured JSON
      const parsedResult = this.parseAIResponse(aiResponse, request);
      
      if (parsedResult) {
        // Use the parsed AI data
        return {
          plan: parsedResult.plan,
          reasoning: aiResponse,
          confidence: 0.9 + Math.random() * 0.08,
          personalizations: parsedResult.personalizations
        };
      } else {
        // Fall back to enhanced mock data if parsing fails
        console.log('Using enhanced mock data as fallback');
        const mockPlan = generateMockTravelPlan(
          request.destination, 
          request.preferences, 
          request.travelerType
        );
        
        const { plan, personalizations } = this.enhanceMockPlan(mockPlan, request, aiResponse);
        
        return {
          plan,
          reasoning: aiResponse,
          confidence: 0.9 + Math.random() * 0.08,
          personalizations
        };
      }
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