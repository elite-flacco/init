import { TravelerType, PickDestinationPreferences, Destination } from '../types/travel';
import { destinations } from '../data/destinations';
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
      // Mock response for development
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      return `Based on your preferences, I recommend these destinations because they align with your travel style and interests. Each destination offers unique experiences that match what you're looking for.`;
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
      prompt += `Preferences:
- Time of Year: ${preferences.timeOfYear}
- Duration: ${preferences.duration}
- Budget: ${preferences.budget}
- Trip Type: ${preferences.tripType}
- Special Activities: ${preferences.specialActivities}
- Weather Preference: ${preferences.weather}
- Priority: ${preferences.priority}
`;
      
      if (preferences.region) {
        prompt += `- Region: ${preferences.region}\n`;
      }
    }

    prompt += `
Available destinations: ${destinations.map(d => `${d.name}, ${d.country} - ${d.description}`).join('; ')}

Please rank these destinations from best to worst fit for this traveler and explain why. Focus on matching their personality type and preferences.`;

    return prompt;
  }

  private parseAIResponse(response: string, request: AIDestinationRequest): Destination[] {
    // TODO: Implement proper AI response parsing
    // For now, use intelligent filtering based on traveler type and preferences
    
    let filtered = [...destinations];
    const { travelerType, preferences } = request;

    // Filter by traveler type preferences
    if (travelerType.id === 'yolo') {
      filtered = filtered.sort(() => Math.random() - 0.5);
    } else if (travelerType.id === 'adventure') {
      const adventureDestinations = ['iceland', 'new-zealand', 'costa-rica'];
      filtered = filtered.sort((a, b) => {
        const aScore = adventureDestinations.includes(a.id) ? 1 : 0;
        const bScore = adventureDestinations.includes(b.id) ? 1 : 0;
        return bScore - aScore;
      });
    } else if (travelerType.id === 'culture') {
      const cultureDestinations = ['japan', 'greece', 'italy'];
      filtered = filtered.sort((a, b) => {
        const aScore = cultureDestinations.includes(a.id) ? 1 : 0;
        const bScore = cultureDestinations.includes(b.id) ? 1 : 0;
        return bScore - aScore;
      });
    } else if (travelerType.id === 'relaxation') {
      const relaxationDestinations = ['bali', 'greece', 'maldives'];
      filtered = filtered.sort((a, b) => {
        const aScore = relaxationDestinations.includes(a.id) ? 1 : 0;
        const bScore = relaxationDestinations.includes(b.id) ? 1 : 0;
        return bScore - aScore;
      });
    }

    // Filter by preferences if available
    if (preferences) {
      // Budget filtering
      if (preferences.budget === 'budget') {
        const budgetDestinations = ['thailand', 'vietnam', 'costa-rica'];
        filtered = filtered.filter(d => budgetDestinations.includes(d.id));
      } else if (preferences.budget === 'luxury') {
        const luxuryDestinations = ['japan', 'norway', 'switzerland'];
        filtered = filtered.filter(d => luxuryDestinations.includes(d.id));
      }

      // Trip type filtering
      if (preferences.tripType === 'adventure') {
        const adventureDestinations = ['iceland', 'new-zealand', 'costa-rica', 'norway'];
        filtered = filtered.filter(d => adventureDestinations.includes(d.id));
      } else if (preferences.tripType === 'cultural') {
        const culturalDestinations = ['japan', 'greece', 'italy', 'egypt'];
        filtered = filtered.filter(d => culturalDestinations.includes(d.id));
      } else if (preferences.tripType === 'relaxation') {
        const relaxationDestinations = ['bali', 'greece', 'maldives', 'thailand'];
        filtered = filtered.filter(d => relaxationDestinations.includes(d.id));
      }

      // Weather preferences
      if (preferences.weather === 'warm') {
        const warmDestinations = ['bali', 'thailand', 'costa-rica', 'greece'];
        filtered = filtered.filter(d => warmDestinations.includes(d.id));
      } else if (preferences.weather === 'cool') {
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