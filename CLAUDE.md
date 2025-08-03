# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
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

This is a **Next.js 15 full-stack application** using the App Router with React 19 + TypeScript. The app follows a multi-step wizard pattern where users progress through different phases of travel planning with AI-powered recommendations and plan sharing capabilities.

### Core Application Flow

The app uses a state-machine-like approach with an `AppStep` type that controls navigation:

1. **traveler-type**: User selects their travel personality (Explorer, Type A, Overthinker, Chill)
2. **destination-knowledge**: User indicates if they know where they want to go
3. **destination-input**: Manual destination input (if they know where to go)
4. **pick-destination**: Destination selection flow (if they don't know where to go)
5. **destination-recommendations**: AI-generated destination suggestions
6. **planning**: Trip planning questionnaire
7. **plan**: Final travel plan display with sharing and export options

### Key Architecture Patterns

- **Next.js App Router**: Full-stack architecture with frontend in `app/page.tsx` and backend API routes in `app/api/`
- **Component-based structure**: Each step is its own component in `src/components/`
- **Centralized state management**: All state is managed in the main `app/page.tsx` component and passed down as props
- **Type safety**: Strong TypeScript interfaces defined in `src/types/travel.ts`
- **API Services**: Backend API routes handle AI integration and plan sharing
- **Data layer**: Static data stored in `src/data/` directory with mock data for development
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
- **AI Integration**: AI-powered services via `src/services/aiDestinationService.ts` and `src/services/aiTripPlanningService.ts`
- **Backend API**: Next.js API routes in `app/api/` handle AI requests and plan sharing
- **Plan Storage**: Shared plans are stored server-side with unique URLs for sharing

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

- `AI_PROVIDER`: Set to 'openai', 'anthropic', or 'mock' (default: 'mock')
- `OPENAI_API_KEY`: Your OpenAI API key (for server-side usage)
- `ANTHROPIC_API_KEY`: Your Anthropic API key (for server-side usage)
- `AI_MODEL`: AI model to use (default: 'gpt-4')
- `AI_MAX_TOKENS`: Maximum tokens for AI responses (default: 1000)
- `AI_TEMPERATURE`: AI temperature setting (default: 0.7)

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

### API Routes

The Next.js backend provides several API endpoints:

- **POST /api/ai/destinations** - Generate AI destination recommendations
- **POST /api/ai/trip-planning** - Generate comprehensive AI travel plans
- **GET /api/ai/test** - Test AI service connectivity
- **POST /api/shared-plans** - Create shareable plan with unique URL
- **GET /api/shared-plans/[id]** - Retrieve shared plan by ID

### Plan Sharing & Export

The app includes advanced sharing and export capabilities:

- **URL Sharing**: Plans can be shared via unique URLs (`/share/[id]`)
- **Database Storage**: Shared plans are stored in Supabase PostgreSQL database
- **PDF Export**: Generate PDF documents of travel plans using `src/services/pdfExportService.ts`
- **KML Export**: Export itineraries as KML files for Google Maps using `src/services/kmlExportService.ts`

#### Database Configuration

The app uses Supabase for persistent storage of shared plans. Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

The service role key is used server-side for admin operations and bypassing Row Level Security (RLS).

**Supabase Database Schema:**

```sql
CREATE TABLE shared_plans (
  id TEXT PRIMARY KEY,
  destination JSONB NOT NULL,
  traveler_type JSONB NOT NULL,
  ai_response JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Index for efficient cleanup of expired plans
CREATE INDEX idx_shared_plans_expires_at ON shared_plans(expires_at);
```

**Database Service:**

- `SharedPlanService.createSharedPlan()` - Create new shared plan
- `SharedPlanService.getSharedPlan()` - Retrieve plan by ID (auto-expires)
- `SharedPlanService.cleanupExpiredPlans()` - Remove expired plans
- `SharedPlanService.getStats()` - Get usage statistics

### Development Mode

By default, the app runs in mock mode with simulated AI responses. To enable real AI integration, set the appropriate environment variables and API keys.

**Development Shortcuts**: The app supports URL parameters for quick development:

- `?dev=plan` - Jump directly to plan view with mock data
- `?dev=destinations` - Jump to destination recommendations with mock data

## Security Features

The app includes comprehensive security measures in `src/lib/security.ts`:

### Rate Limiting

- Per-IP rate limiting with configurable limits (default: 100 requests per 15 minutes)
- Memory-based storage with automatic cleanup (production should use Redis/database)

### Request Validation

- Origin validation to prevent CSRF attacks
- Request body validation for travel plan data
- Content filtering to block suspicious patterns
- Data size limits (100KB max payload)

### Security Headers

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### IP Detection

- Multi-header IP detection for proxied environments
- Support for X-Forwarded-For, X-Real-IP, CF-Connecting-IP headers

### Development Mode

- More permissive CORS handling in development
- Automatic localhost origin allowance
