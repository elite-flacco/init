# Travel Planning App

A React + TypeScript travel planning application that helps users discover destinations and plan their trips through an interactive wizard interface.

## Features

- **Traveler Type Selection**: Choose from different travel personalities (YOLO, Type A, Boogey, Chill)
- **Destination Discovery**: Get AI-powered destination recommendations based on your preferences
- **Progressive Trip Planning**: Interactive multi-step questionnaire with smooth scrolling and in-place editing
- **Enhanced User Experience**: Glassmorphism UI effects, scroll-based editing, animated transitions, and intuitive form progression
- **Modern Visual Design**: Neumorphic and glassmorphic card styles with subtle hover animations
- **AI-Powered Development**: Integrated with Claude Code for automated code quality checks and development workflow
- **Responsive Design**: Mobile-first approach with Tailwind CSS styling

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development Commands

- **dev**: `npm run dev`
- **build**: `npm run build`
- **lint**: `npm run lint`
- **preview**: `npm run preview`

## Project Structure

```
src/
├── components/
│   ├── ui/
│   │   └── Card.tsx
│   ├── DestinationCard.tsx
│   ├── DestinationKnowledgeSelection.tsx
│   ├── DestinationRecommendationResults.tsx
│   ├── DestinationRecommendations.tsx
│   ├── PickMyDestinationFlow.tsx
│   ├── ProgressiveForm.tsx          # Progressive multi-step form with smooth scrolling
│   ├── QuestionStep.tsx             # Individual question step component
│   ├── TravelerTypeSelection.tsx
│   ├── TravelPlan.tsx
│   └── TripPlanningPrompts.tsx
├── data/
│   ├── destinations.ts
│   └── travelerTypes.ts
├── lib/
│   └── utils.ts
├── types/
│   └── travel.ts
├── App.tsx
├── index.css
├── main.tsx
└── vite-env.d.ts
```


## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **ESLint** - Code linting

## Architecture

The app follows a multi-step wizard pattern with centralized state management in the main App component. Each step is its own component that handles a specific phase of the travel planning journey.

## Development Setup

This project includes Claude Code integration with automated hooks for code quality:

- **Type checking**: Automatic TypeScript compilation checks on file edits
- **Code formatting**: Prettier formatting on save
- **README updates**: Automatic README updates when files change

### Configuration Files

- `.claude/` - Claude Code configuration, commands, and hooks
  - `.claude/commands/save.md` - Custom save command
  - `.claude/hooks/` - Automated hooks for TypeScript checking and README updates
  - `.claude/settings.local.json` - Local Claude Code settings
- `eslint.config.js` - ESLint configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
- `CLAUDE.md` - Project documentation for Claude Code

## Dependencies

### Main Dependencies
- @anthropic-ai/claude-code
- clsx
- framer-motion
- lucide-react
- react
- react-dom
- tailwind-merge

### Development Dependencies
- @eslint/js
- @tailwindcss/aspect-ratio
- @tailwindcss/forms
- @tailwindcss/typography
- @types/react
- @types/react-dom
- @vitejs/plugin-react
- autoprefixer
- eslint
- eslint-plugin-react-hooks
- eslint-plugin-react-refresh
- globals
- postcss
- tailwindcss
- typescript
- typescript-eslint
- vite
