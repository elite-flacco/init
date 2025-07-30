import { NextRequest, NextResponse } from 'next/server'
import { TravelerType, Destination, TripPreferences } from '../../../../src/types/travel'
import { getAIConfig } from '../config'
import { generateDevMockData } from '../../../../src/data/mock/travelData'

export interface AITripPlanningRequest {
  destination: Destination
  travelerType: TravelerType
  preferences: TripPreferences
}

async function callAI(prompt: string): Promise<string> {
  const config = getAIConfig()
  const { provider, apiKey } = config
  
  if (provider === 'mock' || !apiKey) {
    // Mock response for development
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
    const mockData = generateDevMockData()
    return JSON.stringify(mockData.response)
  }

  // Real AI API calls
  if (provider === 'openai') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: config.maxTokens,
          temperature: config.temperature
        })
      })
      
      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.choices[0]?.message?.content || 'No response from AI'
    } catch (error) {
      console.error('OpenAI API call failed:', error)
      throw error
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
          model: config.model || 'claude-3-sonnet-20240229',
          max_tokens: config.maxTokens,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      
      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.content[0]?.text || 'No response from AI'
    } catch (error) {
      console.error('Anthropic API call failed:', error)
      throw error
    }
  }

  throw new Error(`Unsupported AI provider: ${provider}`)
}


function generateTripPlanningPrompt(request: AITripPlanningRequest): string {
  const { destination, travelerType, preferences } = request
  
  return `You are an expert travel planner. Create a comprehensive travel plan for this trip:

TRAVELER PROFILE:
- Type: ${travelerType.name} - ${travelerType.description}
- Destination: ${destination.name}, ${destination.country}

TRAVEL PREFERENCES:
- Time of Year: ${preferences.timeOfYear}
- Duration: ${preferences.duration}
- Budget: ${preferences.budget}
- Activities: ${preferences.activities.join(', ') || 'Not specified'}
- Accommodation Style: ${preferences.accommodation}
- Transportation: ${preferences.transportation}
- Wants Restaurant Recommendations: ${preferences.wantRestaurants ? 'Yes' : 'No'}
- Wants Bar/Nightlife Recommendations: ${preferences.wantBars ? 'Yes' : 'No'}

Create a detailed travel plan with comprehensive information about ${destination.name}. Return a JSON object with this exact structure (ensure all required fields are present):

{
  "plan": {
    "placesToVisit": [{"name": "string", "description": "string", "category": "string", "priority": number}],
    "neighborhoods": [{"name": "string", "summary": "string", "vibe": "string", "pros": ["string"], "cons": ["string"], "bestFor": "string"}],
    "hotelRecommendations": [{"name": "string", "neighborhood": "string", "priceRange": "string", "description": "string", "amenities": ["string"]}],
    "restaurants": [{"name": "string", "cuisine": "string", "priceRange": "string", "description": "string", "neighborhood": "string", "specialDishes": ["string"], "reservationsRecommended": "Yes|No"}],
    "bars": [{"name": "string", "type": "beer|wine|cocktail|dive|other", "atmosphere": "string", "description": "string", "category": "string", "neighborhood": "string"}],
    "weatherInfo": {"season": "string", "temperature": "string", "conditions": "string", "humidity": "string", "dayNightTempDifference": "string", "airQuality": "string", "feelsLikeWarning": "string", "recommendations": ["string"]},
    "socialEtiquette": ["string"],
    "safetyTips": ["string"],
    "transportationInfo": {"publicTransport": "string", "creditCardPayment": boolean, "ridesharing": "string", "taxiInfo": {"available": boolean, "averageCost": "string", "tips": ["string"]}, "airportTransport": {"airports": [{"name": "string", "code": "string", "distanceToCity": "string", "transportOptions": [{"type": "string", "cost": "string", "duration": "string", "description": "string", "notes": ["string"]}]}]}},
    "localCurrency": {"currency": "string", "cashNeeded": boolean, "creditCardUsage": "string", "tips": ["string"], "exchangeRate": {"from": "string", "to": "string", "rate": number, "lastUpdated": "string"}},
    "tipEtiquette": {"restaurants": "string", "bars": "string", "taxis": "string", "hotels": "string", "tours": "string", "general": "string"},
    "activities": [{"name": "string", "type": "string", "description": "string", "duration": "string", "localSpecific": boolean, "experienceType": "airbnb|getyourguide|viator|other"}],
    "mustTryFood": {"items": [{"name": "string", "description": "string", "category": "main|dessert|drink|snack", "whereToFind": "string"}]},
    "tapWaterSafe": {"safe": boolean, "details": "string"},
    "localEvents": [{"name": "string", "type": "string", "description": "string", "dates": "string", "location": "string"}],
    "history": "string",
    "itinerary": [{"day": number, "title": "string", "activities": [{"time": "string", "title": "string", "description": "string", "location": "string", "icon": "string"}]}]
  },
  "reasoning": "string explaining why this plan matches the traveler type",
  "confidence": number,
  "personalizations": ["string array explaining personalizations"]
}

Make the plan specific to ${destination.name} with accurate local information, real place names, and authentic cultural details.`
}

export async function POST(request: NextRequest) {
  try {
    const body: AITripPlanningRequest = await request.json()
    console.log('Received request body:', JSON.stringify(body, null, 2))

    if (!body.destination || !body.travelerType || !body.preferences) {
      console.log('Missing required fields:', {
        hasDestination: !!body.destination,
        hasTravelerType: !!body.travelerType,
        hasPreferences: !!body.preferences
      })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Generating trip planning prompt...')
    // Generate comprehensive prompt
    const prompt = generateTripPlanningPrompt(body)
    
    console.log('Calling AI service...')
    // Call AI service
    const aiResponse = await callAI(prompt)
    console.log('AI response received, length:', aiResponse.length)
    
    // Parse AI response - it might be wrapped in markdown code blocks
    let cleanResponse = aiResponse.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    console.log('Parsing AI response...')
    const parsedResponse = JSON.parse(cleanResponse)
    console.log('Successfully parsed response')

    return NextResponse.json(parsedResponse)

  } catch (error) {
    console.error('Error in AI trip planning API:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to generate trip plan', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}