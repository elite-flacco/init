import { TravelerType, Destination, PickDestinationPreferences, TripPreferences, DestinationKnowledge } from '../types/travel'

export const mockTravelerTypes: Record<string, TravelerType> = {
  explorer: {
    id: 'explorer',
    name: 'YOLO Traveler',
    description: 'Spontaneous and adventurous, goes with the flow',
    icon: '🚀',
    showPlaceholder: false
  },
  adventure: {
    id: 'adventure',
    name: 'Adventure Seeker',
    description: 'Loves outdoor activities and thrilling experiences',
    icon: '🏔️',
    showPlaceholder: false
  },
  culture: {
    id: 'culture',
    name: 'Culture Explorer',
    description: 'Fascinated by history, art, and local traditions',
    icon: '🏛️',
    showPlaceholder: false
  },
  relaxation: {
    id: 'relaxation',
    name: 'Relaxation Seeker',
    description: 'Prefers peaceful and rejuvenating experiences',
    icon: '🧘',
    showPlaceholder: false
  }
}

export const mockDestinations: Record<string, Destination> = {
  paris: {
    id: 'paris',
    name: 'Paris',
    country: 'France',
    description: 'The City of Light, famous for its art, fashion, and cuisine',
    image: '/images/paris.jpg',
    highlights: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral'],
    bestTime: 'April to June, September to October',
    budget: '€80-150 per day'
  },
  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    country: 'Japan',
    description: 'A bustling metropolis blending traditional and modern culture',
    image: '/images/tokyo.jpg',
    highlights: ['Shibuya Crossing', 'Senso-ji Temple', 'Tokyo Skytree'],
    bestTime: 'March to May, September to November',
    budget: '¥8,000-15,000 per day'
  },
  bali: {
    id: 'bali',
    name: 'Bali',
    country: 'Indonesia',
    description: 'Tropical paradise with beautiful beaches and rich culture',
    image: '/images/bali.jpg',
    highlights: ['Uluwatu Temple', 'Rice Terraces', 'Mount Batur'],
    bestTime: 'April to October',
    budget: '$30-80 per day'
  }
}

export const mockDestinationKnowledge: DestinationKnowledge = {
  type: 'no-clue',
  label: 'No idea where to go',
  description: 'I want help choosing a destination'
}

export const mockPickDestinationPreferences: PickDestinationPreferences = {
  timeOfYear: 'Summer',
  duration: '7 days',
  budget: 'mid-range',
  tripType: 'cultural',
  destinationType: 'city',
  specialActivities: 'museums and historical sites',
  weather: 'warm',
  priority: 'authentic experiences'
}

export const mockTripPreferences: TripPreferences = {
  timeOfYear: 'Summer',
  duration: '7 days',
  budget: 'mid-range',
  activities: ['sightseeing', 'food'],
  accommodation: 'hotel',
  transportation: 'public transport',
  wantRestaurants: true,
  wantBars: false,
  tripType: 'cultural',
  activityLevel: 'moderate',
  riskTolerance: 'low',
  spontaneity: 'planned'
}

export const mockAIResponse = {
  openai: {
    choices: [
      {
        message: {
          content: 'Based on your preferences, I recommend these destinations for cultural exploration with moderate activity levels. Each destination offers rich history and authentic experiences.'
        }
      }
    ]
  },
  anthropic: {
    content: [
      {
        text: 'I\'ve analyzed your travel preferences and created personalized recommendations that match your cultural interests and moderate activity level.'
      }
    ]
  }
}

// Helper function to create mock fetch responses
export const mockFetchResponse = (data: any, ok = true, status = 200) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data))
  } as Response)
}

// Reset all mocks
export const resetMocks = () => {
  vi.clearAllMocks()
  if (global.fetch) {
    (global.fetch as any).mockReset()
  }
}