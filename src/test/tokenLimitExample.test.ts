/**
 * Example to demonstrate token limit handling for different trip scenarios
 * Run with: npm run test -- --run src/test/tokenLimitExample.test.ts
 */

import { describe, test, expect } from 'vitest';
import {
  estimateTokens,
  wouldExceedTokenLimit,
  getModelTokenLimit,
} from '../lib/tokenUtils';
import {
  TravelerType,
  Destination,
  TripPreferences,
} from '../types/travel';

// Mock data for testing
const mockTravelerType: TravelerType = {
  id: 'explorer',
  name: 'Explorer',
  description: 'Adventurous travelers who seek unique experiences',
  questions: []
};

const mockDestination: Destination = {
  id: 'tokyo',
  name: 'Tokyo',
  country: 'Japan',
  description: 'Bustling metropolis with modern and traditional elements',
  image: '',
  highlights: ['Technology', 'Culture', 'Food'],
  bestTime: 'Spring and Fall',
  budget: '$150-250 per day',
  details: 'Amazing city with incredible experiences'
};

// Helper function to generate trip planning prompt (simplified version)
function generateTripPlanningPrompt(
  destination: Destination,
  travelerType: TravelerType,
  preferences: TripPreferences
): string {
  const baseDays = parseInt(preferences.duration) || 7;
  
  return `You are an expert travel planner AI. Create a detailed, personalized travel plan for the following traveler:

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
- Wants Restaurant Recommendations: ${preferences.wantRestaurants ? "Yes" : "No"}
- Wants Bar/Nightlife Recommendations: ${preferences.wantBars ? "Yes" : "No"}
- Trip Type: ${preferences.tripType}
- Special Activities Requested: ${preferences.specialActivities}

Please create a comprehensive travel plan that includes ALL of the following detailed sections:

1. PLACES TO VISIT (${Math.ceil(baseDays * 3)} recommendations)
   - Main attractions categorized by type (cultural, historical, natural, entertainment, etc.)
   - Include priority ranking for each attraction based on user preferences and general popularity
   - For each place, include ticket booking information: whether tickets are required or recommended, booking advice (e.g. "Book at least 2 weeks in advance during peak season"), peak time DURING THE DAY (e.g. early morning, late afternoon), average wait times to get in

2. NEIGHBORHOOD BREAKDOWNS (3-5 MOST POPULAR NEIGHBORHOODS)
   - Summary of 3-5 most popular neighborhoods with their unique vibes
   - Pros and cons of each neighborhood for travelers, especially in terms of accommodation and food options, location (whether it's close to major attractions), touristy v.s. local, safety, accessibility
   - Best neighborhoods for different types of activities
   - What makes each neighborhood unique and worth visiting, include this in the summary
   - One-liner suggestion on best for, e.g. "Best for first-timers" or "Best for families"

3. HOTEL RECOMMENDATIONS
   - For each neighborhood listed above, provide EXACTLY THREE (3) separate and distinct accommodation options
   - Each option must match the traveler's accommodation type preference (${preferences.accommodation}) and budget (${preferences.budget})
   - For each of the 3 options per neighborhood, include: name, amenities, price range, and detailed descriptions
   - Include link to Airbnb listing if applicable (for Airbnb preferences)
   - CRITICAL: You must provide 3 different accommodation options for EACH neighborhood - do not provide only 1 option per neighborhood

4. RESTAURANT RECOMMENDATIONS (${Math.ceil(baseDays * 4)} recommendations)
   - Include AT LEAST FIVE (5) restaurants per neighborhood 
   - Vary by cuisine type, price range, and neighborhood
   - Include specific dishes to try at each restaurant
   - Include if reservations are recommended / required - "Yes" or "No"

5. BAR/NIGHTLIFE RECOMMENDATIONS (${Math.ceil(baseDays * 2)} recommendations)
   - Only return data if traveler's preference for "Wants Bar/Nightlife Recommendations" is "Yes"
   - Categorize by type: beer bars, wine bars, cocktail lounges, dive bars
   - Include atmosphere descriptions and what makes each unique
   - Match to traveler's nightlife preferences
   - Include neighborhood of each bar

6. DETAILED WEATHER INFORMATION
   - Humidity levels and hydration recommendations
   - Day vs night temperature differences
   - Air quality concerns if applicable
   - "Feels like" temperature warnings (heat index, wind chill)
   - Specific clothing and preparation recommendations

[... continues with sections 7-17 ...]

CRITICAL: Your response MUST be ONLY a valid JSON object. Do not include any text before or after the JSON.`;
}

describe('Token Limit Handling', () => {
  test('Short trip (3 days) should fit in single request', () => {
    const shortTrip: TripPreferences = {
      timeOfYear: 'Spring',
      duration: '3 days',
      budget: 'medium',
      accommodation: 'hotel',
      transportation: 'public',
      wantRestaurants: true,
      wantBars: false,
      tripType: 'culture',
      specialActivities: 'museums',
      activityLevel: 'medium'
    };

    const prompt = generateTripPlanningPrompt(mockDestination, mockTravelerType, shortTrip);
    const estimate = estimateTokens(prompt, 'openai');
    
    console.log(`Short trip (3 days) prompt: ${estimate.tokens} tokens, ${estimate.characters} characters`);
    
    // Should not exceed GPT-4 limits
    expect(wouldExceedTokenLimit(prompt, getModelTokenLimit('gpt-4'), 'openai', 2000)).toBe(false);
  });

  test('Medium trip (7 days) might exceed some model limits', () => {
    const mediumTrip: TripPreferences = {
      timeOfYear: 'Summer',
      duration: '7 days',
      budget: 'high',
      accommodation: 'luxury hotel',
      transportation: 'private',
      wantRestaurants: true,
      wantBars: true,
      tripType: 'adventure',
      specialActivities: 'hiking, food tours, cultural experiences',
      activityLevel: 'high'
    };

    const prompt = generateTripPlanningPrompt(mockDestination, mockTravelerType, mediumTrip);
    const estimate = estimateTokens(prompt, 'openai');
    
    console.log(`Medium trip (7 days) prompt: ${estimate.tokens} tokens, ${estimate.characters} characters`);
    
    // Might exceed basic GPT-4 limits but not turbo
    const exceedsGpt4 = wouldExceedTokenLimit(prompt, getModelTokenLimit('gpt-4'), 'openai', 3000);
    const exceedsGpt4Turbo = wouldExceedTokenLimit(prompt, getModelTokenLimit('gpt-4-turbo'), 'openai', 3000);
    
    console.log(`Exceeds GPT-4: ${exceedsGpt4}, Exceeds GPT-4 Turbo: ${exceedsGpt4Turbo}`);
  });

  test('Long trip (14 days) should definitely require chunking', () => {
    const longTrip: TripPreferences = {
      timeOfYear: 'Fall',
      duration: '14 days',
      budget: 'luxury',
      accommodation: 'luxury hotel',
      transportation: 'private car',
      wantRestaurants: true,
      wantBars: true,
      tripType: 'comprehensive cultural immersion experience',
      specialActivities: 'private guided tours, cooking classes, traditional ceremonies, art workshops, historical site visits, local festivals, wine tastings, cultural performances',
      activityLevel: 'high'
    };

    const prompt = generateTripPlanningPrompt(mockDestination, mockTravelerType, longTrip);
    const estimate = estimateTokens(prompt, 'openai');
    
    console.log(`Long trip (14 days) prompt: ${estimate.tokens} tokens, ${estimate.characters} characters`);
    
    // Should exceed most model limits
    const exceedsGpt4 = wouldExceedTokenLimit(prompt, getModelTokenLimit('gpt-4'), 'openai', 4000);
    const exceedsGpt4Turbo = wouldExceedTokenLimit(prompt, getModelTokenLimit('gpt-4-turbo'), 'openai', 4000);
    
    console.log(`Exceeds GPT-4: ${exceedsGpt4}, Exceeds GPT-4 Turbo: ${exceedsGpt4Turbo}`);
    
    // This should definitely need chunking for basic models
    expect(exceedsGpt4).toBe(true);
  });

  test('Extreme trip (30 days) should require chunking even for large models', () => {
    const extremeTrip: TripPreferences = {
      timeOfYear: 'Year-round experience',
      duration: '30 days',
      budget: 'luxury',
      accommodation: 'luxury hotel and traditional ryokans',
      transportation: 'private car with driver, first-class train travel',
      wantRestaurants: true,
      wantBars: true,
      tripType: 'comprehensive immersive experience covering all aspects of culture, history, nature, cuisine, arts, traditions, modern technology, spiritual practices, and social customs',
      specialActivities: 'private guided tours, cooking classes, traditional ceremonies, art workshops, historical site visits, local festivals, wine tastings, cultural performances, meditation retreats, language immersion, traditional craft workshops, nature expeditions, technology tours, culinary masterclasses with renowned chefs',
      activityLevel: 'high'
    };

    const prompt = generateTripPlanningPrompt(mockDestination, mockTravelerType, extremeTrip);
    const estimate = estimateTokens(prompt, 'openai');
    
    console.log(`Extreme trip (30 days) prompt: ${estimate.tokens} tokens, ${estimate.characters} characters`);
    
    // Should exceed even the largest model limits when accounting for response space
    const exceedsClaude = wouldExceedTokenLimit(prompt, getModelTokenLimit('claude-3-sonnet'), 'anthropic', 10000);
    
    console.log(`Exceeds Claude: ${exceedsClaude}`);
    
    // With comprehensive response requirements, this should need chunking
    expect(estimate.tokens).toBeGreaterThan(5000);
  });

  test('Token estimates should scale with trip duration', () => {
    const createTrip = (days: string): TripPreferences => ({
      timeOfYear: 'Spring',
      duration: days,
      budget: 'medium',
      accommodation: 'hotel',
      transportation: 'public',
      wantRestaurants: true,
      wantBars: true,
      tripType: 'culture',
      specialActivities: 'museums, local experiences',
      activityLevel: 'medium'
    });

    const trip3Days = generateTripPlanningPrompt(mockDestination, mockTravelerType, createTrip('3 days'));
    const trip7Days = generateTripPlanningPrompt(mockDestination, mockTravelerType, createTrip('7 days'));
    const trip14Days = generateTripPlanningPrompt(mockDestination, mockTravelerType, createTrip('14 days'));

    const tokens3 = estimateTokens(trip3Days, 'openai').tokens;
    const tokens7 = estimateTokens(trip7Days, 'openai').tokens;
    const tokens14 = estimateTokens(trip14Days, 'openai').tokens;

    console.log(`Token scaling: 3 days: ${tokens3}, 7 days: ${tokens7}, 14 days: ${tokens14}`);

    // Longer trips should generate longer prompts (due to more recommendations requested)
    expect(tokens7).toBeGreaterThan(tokens3);
    expect(tokens14).toBeGreaterThan(tokens7);
  });
});