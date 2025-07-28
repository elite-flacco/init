import { TravelerType, PickDestinationPreferences, Destination } from '../types/travel';
import { destinations } from '../data/mock/destinations';
import { getAIConfig } from '../config/ai';

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
  private config = getAIConfig();

  private async callAI(prompt: string): Promise<string> {
    const { provider, apiKey } = this.config;
    
    if (provider === 'mock' || !apiKey) {
      // Mock response for development - return structured JSON
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return JSON.stringify({
        destinations: [
          {
            name: "Kyoto",
            country: "Japan",
            description: "Perfect blend of traditional culture and modern convenience - a classic must-see destination",
            bestTimeToVisit: "Spring (March-May) for cherry blossoms",
            keyActivities: "Temple visits, traditional tea ceremonies, bamboo forest walks",
            matchReason: "Iconic destination that combines cultural immersion with well-organized infrastructure",
            estimatedCost: "$$$",
            details: "Kyoto is Japan's cultural heart and one of the world's most beloved tourist destinations. This classic city boasts over 2,000 temples and shrines, including the iconic Fushimi Inari shrine with its thousands of vermillion torii gates. The historic Gion district offers glimpses of geishas and traditional wooden machiya houses.\n\nThe food scene is exceptional, from kaiseki fine dining to street food in Pontocho Alley. Don't miss trying authentic tofu cuisine in temple restaurants or matcha in traditional tea houses. The city is very walkable, with an excellent bus system and subway connecting major attractions.\n\nFor accommodations, consider staying in a traditional ryokan for the full cultural experience, or modern hotels in the city center. Kyoto is incredibly tourist-friendly with English signage and helpful locals. Book temple visits and popular restaurants in advance, especially during cherry blossom season."
          },
          {
            name: "Faroe Islands",
            country: "Denmark", 
            description: "Hidden Nordic gem with dramatic landscapes and authentic local culture",
            bestTimeToVisit: "Summer (June-August) for hiking and mild weather",
            keyActivities: "Dramatic cliff hikes, grass-roof village exploration, puffin watching",
            matchReason: "Perfect off-the-beaten-path destination with untouched nature and authentic experiences",
            estimatedCost: "$$$",
            details: "The Faroe Islands are one of Europe's best-kept secrets, offering dramatic landscapes without the crowds of Iceland. These 18 remote islands feature towering cliffs, grass-roof houses, and some of the most pristine hiking in the world. The village of Gásadalur with its iconic Múlafossur waterfall feels like something from a fairy tale.\n\nThe local food scene is surprisingly sophisticated, featuring new Nordic cuisine with fresh seafood, grass-fed lamb, and foraged ingredients. The capital Tórshavn has cozy restaurants and a charming old town with colorful wooden houses. Getting around requires some planning - rent a car or join small group tours.\n\nStay in local guesthouses or small hotels for the most authentic experience. The weather can be unpredictable, so pack layers and waterproof gear. The locals are incredibly friendly and most speak excellent English. This destination offers true solitude and connection with nature."
          },
          {
            name: "Porto",
            country: "Portugal",
            description: "Portugal's up-and-coming cultural capital with vibrant street art and wine scene",
            bestTimeToVisit: "Spring/Fall for perfect weather and fewer crowds",
            keyActivities: "Port wine tasting, azulejo tile hunting, street art tours",
            matchReason: "Trending destination that's gaining recognition for its authentic culture and emerging food scene",
            estimatedCost: "$$",
            details: "Porto is rapidly emerging as one of Europe's hottest destinations, offering authentic Portuguese culture without Lisbon's crowds. The UNESCO-listed historic center features stunning azulejo tiles, while the trendy Cedofeita district buzzes with independent shops, galleries, and craft beer bars. The famous port wine cellars in Vila Nova de Gaia offer world-class tastings with river views.\n\nThe food scene is exploding with young chefs putting modern spins on traditional Portuguese dishes. Don't miss the iconic francesinha sandwich or fresh seafood at local marisqueiras. The Mercado do Bolhão is being renovated but nearby markets offer incredible local produce.\n\nStay in the historic center for atmosphere or the trendy Cedofeita area for nightlife. The city is very walkable, with trams connecting major sights. Porto is still more affordable than other European capitals but prices are rising as it gains popularity. Visit soon before it becomes as busy as Lisbon!"
          }
        ],
        summary: "These destinations offer a perfect mix of culture, adventure, and relaxation while matching your budget and travel style preferences."
      });
    }

    // TODO: Implement actual AI API calls
    if (provider === 'openai') {
      // Example OpenAI integration structure
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
      // Example Anthropic integration structure
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

  private generatePrompt(request: AIDestinationRequest): string {
    const { travelerType, preferences, destinationKnowledge } = request;
    
    
    let prompt = `You are a travel expert AI. Help recommend the best destinations for this traveler:

Traveler Type: ${travelerType.name} - ${travelerType.description}

`;

    if (destinationKnowledge) {
      prompt += `Destination Knowledge: ${destinationKnowledge.label} - ${destinationKnowledge.description}\n`;
    }

    if (preferences) {
      prompt += `User Preferences:
- Travel Season: ${preferences.timeOfYear?.trim() || 'Not specified'}
- Trip Duration: ${preferences.duration?.trim() || 'Not specified'}
- Budget Level: ${preferences.budget?.trim() || 'Not specified'}
- Preferred Activities: ${preferences.tripType?.trim() || 'Not specified'}
- Special Interests: ${preferences.specialActivities?.trim() || 'Not specified'}
- Weather Preference: ${preferences.weather?.trim() || 'Not specified'}
- Travel Priority: ${preferences.priority?.trim() || 'Not specified'}
- Destination Type: ${preferences.destinationType?.trim() || 'Not specified'}
`;
      
      if (preferences.region) {
        prompt += `- Preferred Region: ${preferences.region}\n`;
      }
    }

    prompt += `
Please recommend 3-6 destinations that would be perfect for this traveler. Return your response as a valid JSON object with this exact structure:

{
  "destinations": [
    {
      "name": "Destination Name",
      "country": "Country Name",
      "description": "Brief description of why it matches their preferences and what makes it special",
      "bestTimeToVisit": "Best time to visit based on their travel season preference",
      "keyActivities": "Key activities/experiences that align with their interests",
      "matchReason": "Specific explanation of why this destination fits their traveler type and preferences",
      "estimatedCost": "Budget level as $ (budget-friendly), $$ (moderate), $$$ (expensive), or $$$$ (luxury)",
      "details": "Detailed information about the destination including culture, food, transportation, accommodation types, must-see attractions, local customs, and practical travel tips (3-4 paragraphs)"
    }
  ],
  "summary": "Overall explanation of the recommendation strategy and why these destinations work well together"
}

Focus on destinations that truly match their personality type and stated preferences. Pay special attention to their destination type preference:
- If they want "major hits": recommend well-known, popular tourist destinations and iconic places
- If they want "off the beaten path": suggest hidden gems, remote locations, and lesser-known destinations
- If they want "up and coming": recommend trending destinations, emerging hotspots, and places gaining popularity

Ensure the JSON is valid and parseable.`;

    return prompt;
  }

  private parseAIResponse(response: string, request: AIDestinationRequest): Destination[] {
    const { provider } = this.config;
    
    if (provider === 'mock' || !response || response.includes('Based on your preferences')) {
      // Fallback to mock destinations with smart filtering
      return this.getMockDestinations(request);
    }

    try {
      // Clean up the response - sometimes AI includes markdown code blocks
      let cleanResponse = response.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Parse the JSON response
      const aiData = JSON.parse(cleanResponse);
      
      if (!aiData.destinations || !Array.isArray(aiData.destinations)) {
        throw new Error('Invalid AI response format: missing destinations array');
      }

      // Convert AI destinations to our Destination interface
      const destinations: Destination[] = aiData.destinations.map((dest: unknown, index: number) => {
        const destObj = dest as Record<string, unknown>;
        if (!destObj.name || !destObj.country) {
          throw new Error(`Invalid destination data: missing name or country for destination ${index}`);
        }

        const name = String(destObj.name);
        const country = String(destObj.country);
        
        return {
          id: this.generateDestinationId(name, country),
          name,
          country,
          description: String(destObj.description || 'AI-recommended destination'),
          image: this.getDefaultImage(),
          highlights: this.extractHighlights(String(destObj.keyActivities || ''), String(destObj.matchReason || '')),
          bestTime: String(destObj.bestTimeToVisit || 'Year-round'),
          budget: String(destObj.estimatedCost || '$$'),
          details: String(destObj.details || '')
        };
      });

      return destinations.slice(0, 6); // Limit to 6 destinations
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.log('Raw AI response:', response);
      // Fallback to mock destinations if parsing fails
      return this.getMockDestinations(request);
    }
  }

  private generateDestinationId(name: string, country: string): string {
    return `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${country.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  }

  private getDefaultImage(): string {
    // Return a placeholder image - in a real app you'd want to integrate with an image service
    return `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop&crop=center&auto=format&q=60`;
  }

  private extractHighlights(keyActivities?: string, matchReason?: string): string[] {
    const highlights: string[] = [];
    
    if (keyActivities) {
      // Split activities by common delimiters and clean them up
      const activities = keyActivities.split(/[,;]|\sand\s/).map(activity => activity.trim()).filter(Boolean);
      highlights.push(...activities.slice(0, 3)); // Take first 3 activities
    }
    
    if (matchReason && highlights.length < 3) {
      // Extract key points from match reason if we need more highlights
      const reasons = matchReason.split(/[,;]|\sand\s/).map(reason => reason.trim()).filter(Boolean);
      highlights.push(...reasons.slice(0, 3 - highlights.length));
    }
    
    return highlights.length > 0 ? highlights : ['Great destination for your travel style'];
  }


  private generateTags(dest: Record<string, unknown>, request: AIDestinationRequest): string[] {
    const tags: string[] = [];
    
    // Add tags based on traveler type
    if (request.travelerType.id === 'explorer') {
      tags.push('Adventure');
    } else if (request.travelerType.id === 'type-a') {
      tags.push('Well-organized');
    } else if (request.travelerType.id === 'overthinker') {
      tags.push('Luxury');
    } else if (request.travelerType.id === 'chill') {
      tags.push('Relaxing');
    }
    
    // Add tags based on preferences
    if (request.preferences?.tripType?.includes('nature')) {
      tags.push('Nature');
    }
    if (request.preferences?.tripType?.includes('cultural')) {
      tags.push('Culture');
    }
    if (request.preferences?.tripType?.includes('beach')) {
      tags.push('Beach');
    }
    if (request.preferences?.tripType?.includes('food')) {
      tags.push('Food');
    }
    
    // Add budget tag
    if (request.preferences?.budget?.includes('budget')) {
      tags.push('Budget-friendly');
    } else if (request.preferences?.budget?.includes('luxury')) {
      tags.push('Luxury');
    }
    
    return tags.slice(0, 3); // Limit to 3 tags
  }

  private getMockDestinations(request: AIDestinationRequest): Destination[] {
    let filtered = [...destinations];
    const { travelerType, preferences } = request;

    // Filter by traveler type preferences
    if (travelerType.id === 'explorer') {
      const adventureDestinations = ['iceland', 'new-zealand', 'costa-rica'];
      filtered = filtered.sort((a, b) => {
        const aScore = adventureDestinations.includes(a.id) ? 1 : 0;
        const bScore = adventureDestinations.includes(b.id) ? 1 : 0;
        return bScore - aScore;
      });
    } else if (travelerType.id === 'type-a') {
      const organizedDestinations = ['japan', 'switzerland', 'singapore'];
      filtered = filtered.sort((a, b) => {
        const aScore = organizedDestinations.includes(a.id) ? 1 : 0;
        const bScore = organizedDestinations.includes(b.id) ? 1 : 0;
        return bScore - aScore;
      });
    } else if (travelerType.id === 'overthinker') {
      const luxuryDestinations = ['japan', 'norway', 'switzerland'];
      filtered = filtered.sort((a, b) => {
        const aScore = luxuryDestinations.includes(a.id) ? 1 : 0;
        const bScore = luxuryDestinations.includes(b.id) ? 1 : 0;
        return bScore - aScore;
      });
    } else if (travelerType.id === 'chill') {
      const relaxationDestinations = ['bali', 'greece', 'maldives'];
      filtered = filtered.sort((a, b) => {
        const aScore = relaxationDestinations.includes(a.id) ? 1 : 0;
        const bScore = relaxationDestinations.includes(b.id) ? 1 : 0;
        return bScore - aScore;
      });
    }

    // Apply preference-based filtering
    if (preferences) {
      if (preferences.budget?.includes('budget')) {
        const budgetDestinations = ['thailand', 'vietnam', 'costa-rica'];
        filtered = filtered.filter(d => budgetDestinations.includes(d.id));
      } else if (preferences.budget?.includes('luxury')) {
        const luxuryDestinations = ['japan', 'norway', 'switzerland'];
        filtered = filtered.filter(d => luxuryDestinations.includes(d.id));
      }

      if (preferences.weather?.includes('warm')) {
        const warmDestinations = ['bali', 'thailand', 'costa-rica', 'greece'];
        filtered = filtered.filter(d => warmDestinations.includes(d.id));
      } else if (preferences.weather?.includes('cooler')) {
        const coolDestinations = ['iceland', 'norway', 'switzerland', 'new-zealand'];
        filtered = filtered.filter(d => coolDestinations.includes(d.id));
      }
    }

    return filtered.length > 0 ? filtered.slice(0, 6) : destinations.slice(0, 6);
  }

  async getDestinationRecommendations(request: AIDestinationRequest): Promise<AIDestinationResponse> {
    try {
      const prompt = this.generatePrompt(request);
      const aiResponse = await this.callAI(prompt);
      const recommendedDestinations = this.parseAIResponse(aiResponse, request);
      
      return {
        destinations: recommendedDestinations,
        reasoning: aiResponse,
        confidence: 0.85 + Math.random() * 0.1 // Mock confidence score
      };
    } catch (error) {
      console.error('AI destination service error:', error);
      
      // Fallback to basic filtering
      const fallbackDestinations = this.parseAIResponse('', request);
      return {
        destinations: fallbackDestinations,
        reasoning: 'Using fallback recommendations based on your traveler type.',
        confidence: 0.6
      };
    }
  }
}

export const aiDestinationService = new AIDestinationService();