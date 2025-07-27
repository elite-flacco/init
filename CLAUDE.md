# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

## Testing

- **Run tests**: `npm test`
- **Run tests with UI**: `npm run test:ui`
- **Run tests once**: `npm run test:run`
- **Run tests with coverage**: `npm run test:coverage`

### Test Structure

The project uses Vitest for testing with the following test files:
- `src/services/__tests__/aiDestinationService.test.ts` - Tests for destination recommendation AI service
- `src/services/__tests__/aiTripPlanningService.test.ts` - Tests for trip planning AI service  
- `src/services/__tests__/aiServices.integration.test.ts` - Integration tests for AI services
- `src/components/__tests__/*.test.tsx` - Component tests for AI-powered components

### Test Configuration

Tests are configured to:
- Use jsdom environment for component testing
- Mock AI API calls for consistent testing
- Include comprehensive test utilities and mock data
- Support both unit and integration testing

## Project Architecture

This is a React + TypeScript travel planning application built with Vite. The app follows a multi-step wizard pattern where users progress through different phases of travel planning.

### Core Application Flow

The app uses a state-machine-like approach with an `AppStep` type that controls navigation:
1. **traveler-type**: User selects their travel personality (YOLO, Type A, Boogey, Chill)
2. **destination-knowledge**: User indicates if they know where they want to go
3. **pick-destination**: Destination selection flow (if they don't know where to go)
4. **destination-recommendations**: AI-generated destination suggestions
5. **planning**: Trip planning questionnaire
6. **plan**: Final travel plan display

### Key Architecture Patterns

- **Component-based structure**: Each step is its own component in `src/components/`
- **Centralized state management**: All state is managed in the main `App.tsx` component and passed down as props
- **Type safety**: Strong TypeScript interfaces defined in `src/types/travel.ts`
- **Data layer**: Static data stored in `src/data/` directory
- **Conditional rendering**: Components are conditionally rendered based on `currentStep` state

### Type System

The application heavily relies on TypeScript interfaces:
- `TravelerType`: User personality types
- `Destination`: Destination information structure
- `TripPreferences`: User preferences for trip planning
- `EnhancedTravelPlan`: Complete travel plan structure with detailed information

### Data Structure

- **Static data**: Destinations and traveler types are hardcoded in `src/data/`
- **Dynamic data**: User selections and preferences flow through component props
- **AI Integration**: AI-powered destination recommendations via `src/services/aiDestinationService.ts`
- **No backend**: Currently a frontend-only application with optional AI API integration

### Component Organization

Components follow a hierarchical pattern where each major step has its own component that handles that phase of the user journey. The main App component orchestrates the flow and manages state transitions.

## Development Guidelines

- **Humor and Tone**: 
  - Use funny language in the app where appropriate

- **Documentation Reminders**:
  - Remember to check /docs/Design.md when making UI/UX changes

## AI Integration

The app includes AI-powered destination recommendations using the `aiDestinationService`. 

### Configuration

AI settings can be configured via environment variables:
- `REACT_APP_AI_PROVIDER`: Set to 'openai', 'anthropic', or 'mock' (default: 'mock')
- `REACT_APP_OPENAI_API_KEY`: Your OpenAI API key
- `REACT_APP_ANTHROPIC_API_KEY`: Your Anthropic API key
- `REACT_APP_AI_MODEL`: AI model to use (default: 'gpt-4')
- `REACT_APP_AI_MAX_TOKENS`: Maximum tokens for AI responses (default: 1000)
- `REACT_APP_AI_TEMPERATURE`: AI temperature setting (default: 0.7)

### Usage

The AI services are used in two main flows:

**Destination Recommendations:**
1. User completes traveler type selection and preference questionnaire
2. `AIDestinationRecommendationResults` component calls `aiDestinationService.getDestinationRecommendations()`
3. Service generates personalized prompts based on user input
4. AI returns destination recommendations with reasoning
5. Results are filtered and displayed to the user

**Trip Planning:**
1. User selects destination and completes trip planning questionnaire
2. `AITripPlanningPrompts` component calls `aiTripPlanningService.generateTravelPlan()`
3. Service creates comprehensive prompts including user preferences, traveler type, and destination details
4. AI returns detailed travel plans with itineraries, recommendations, and cultural insights
5. `AITravelPlan` component displays the AI-generated plan with personalization explanations

### Development Mode

By default, the app runs in mock mode with simulated AI responses. To enable real AI integration, set the appropriate environment variables and API keys.