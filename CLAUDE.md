# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev`
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

Note: This project does not have test scripts configured. If adding tests, update this section accordingly.

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
- **No backend**: Currently a frontend-only application

### Component Organization

Components follow a hierarchical pattern where each major step has its own component that handles that phase of the user journey. The main App component orchestrates the flow and manages state transitions.

## Development Guidelines

- **Humor and Tone**: 
  - Use funny language in the app where appropriate

- **Documentation Reminders**:
  - Remember to check /docs/Design.md when making UI/UX changes