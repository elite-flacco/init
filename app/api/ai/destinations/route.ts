import { NextRequest, NextResponse } from 'next/server'
import { TravelerType, PickDestinationPreferences } from '../../../../src/types/travel'
import { destinations } from '../../../../src/data/mock/destinations'
import { getAIConfig } from '../config'

export interface AIDestinationRequest {
  travelerType: TravelerType
  preferences?: PickDestinationPreferences
  destinationKnowledge: {
    type: 'yes' | 'country' | 'no-clue'
    label: string
    description: string
  }
}

async function callAI(prompt: string): Promise<string> {
  const config = getAIConfig()
  const { provider, apiKey } = config
  
  if (provider === 'mock' || !apiKey) {
    // Mock response for development using actual destinations data
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Select 2-3 random destinations from our mock data
    const shuffledDestinations = [...destinations].sort(() => 0.5 - Math.random())
    const selectedDestinations = shuffledDestinations.slice(0, 3)
    
    // Transform destinations to match AI response format
    const transformedDestinations = selectedDestinations.map(dest => ({
      name: dest.name,
      country: dest.country,
      description: dest.description,
      bestTimeToVisit: dest.bestTime,
      keyActivities: dest.highlights.join(', '),
      matchReason: `Perfect match for your travel style with ${dest.highlights[0].toLowerCase()} and authentic experiences`,
      estimatedCost: dest.budget,
      details: `${dest.description}. This destination offers amazing experiences including ${dest.highlights.join(', ').toLowerCase()}.`
    }))
    
    return JSON.stringify({
      destinations: transformedDestinations,
      reasoning: "Based on your preferences for authentic experiences and adventure level, I've selected destinations that offer the perfect balance of cultural immersion and natural beauty from our curated collection.",
      confidence: 85
    })
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

function generatePrompt(request: AIDestinationRequest): string {
  const { travelerType, preferences, destinationKnowledge } = request
  
  let prompt = `You are a travel expert AI. Help recommend the best destinations for this traveler:

Traveler Type: ${travelerType.name} - ${travelerType.description}

`

  if (destinationKnowledge) {
    prompt += `Destination Knowledge: ${destinationKnowledge.label} - ${destinationKnowledge.description}\n`
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
`
    
    if (preferences.region) {
      prompt += `- Preferred Region: ${preferences.region}\n`
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

Ensure the JSON is valid and parseable.`

  return prompt
}

export async function POST(request: NextRequest) {
  try {
    const body: AIDestinationRequest = await request.json()

    if (!body.travelerType || !body.destinationKnowledge) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate comprehensive prompt based on traveler type and preferences
    const prompt = generatePrompt(body)

    const aiResponse = await callAI(prompt)
    
    // Parse AI response - it might be wrapped in markdown code blocks
    let cleanResponse = aiResponse.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }

    const parsedResponse = JSON.parse(cleanResponse)

    // Map AI response to actual destination objects from our data
    const recommendedDestinations = parsedResponse.destinations.map((aiDest: any) => {
      // Try to find matching destination in our data, or create a basic one
      const existingDest = destinations.find((dest) => 
        dest.name.toLowerCase() === aiDest.name.toLowerCase()
      )

      if (existingDest) {
        return {
          ...existingDest,
          details: aiDest.details || existingDest.details
        }
      }

      // Create new destination object if not found in our data
      return {
        id: `ai-${aiDest.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: aiDest.name,
        country: aiDest.country,
        description: aiDest.description,
        image: '/images/placeholder-destination.jpg',
        highlights: aiDest.keyActivities?.split(', ') || [],
        bestTime: aiDest.bestTimeToVisit || 'Year-round',
        budget: aiDest.estimatedCost || '$$$',
        details: aiDest.details || aiDest.description
      }
    })

    return NextResponse.json({
      destinations: recommendedDestinations,
      reasoning: parsedResponse.summary || parsedResponse.reasoning || 'AI-generated recommendations',
      confidence: 85 // Default confidence score
    })

  } catch (error) {
    console.error('Error in AI destinations API:', error)
    return NextResponse.json(
      { error: 'Failed to generate destination recommendations' },
      { status: 500 }
    )
  }
}