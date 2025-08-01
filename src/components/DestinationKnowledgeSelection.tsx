import { useState, useEffect } from 'react';
import { DestinationKnowledge } from '../types/travel';
import { Card } from './ui/Card';

interface DestinationKnowledgeSelectionProps {
  onSelect: (knowledge: DestinationKnowledge) => void;
}

const destinationOptions: DestinationKnowledge[] = [
  {
    type: 'yes',
    label: 'Yep, I know exactly where I want to go',
    description: 'I\'ve done the research and my heart is set. Let\'s plan this thing 🎯'
  },
  {
    type: 'country',
    label: 'I\'ve got a region in mind',
    description: 'I know the general area, but could use help finding the perfect spot within it 🗺️'
  },
  {
    type: 'no-clue',
    label: 'Completely clueless',
    description: 'The world is huge and full of possibilities. Help me discover something incredible 🌍✨'
  }
];

export function DestinationKnowledgeSelection({ onSelect }: DestinationKnowledgeSelectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger the entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

      {/* Header Section */}
      <div
        className={`page-header transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        role="banner"
        aria-labelledby="step-title"
      >
        <h1 className="page-title mb-6">
          Where are we headed?
        </h1>
        <p className="page-subtitle max-w-2xl mx-auto mb-4 opacity-90">
          No judgment here. Whether you're a planning pro or winging it, we've got you covered.
        </p>
      </div>

      {/* Options Grid */}
      <div className="space-y-8 max-w-4xl mx-auto" role="group" aria-labelledby="step-title">
        {destinationOptions.map((option, index) => (
          <div
            key={option.type}
            className={`group relative cursor-pointer transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              } hover:scale-[1.01] hover:-translate-y-1`}
            style={{
              transitionDelay: `${200 + index * 150}ms`,
            }}
            onClick={() => onSelect(option)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(option);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={`Select ${option.label}: ${option.description}`}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-accent/10 to-secondary/15 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 scale-105"></div>
            
            <Card 
              variant="elevated"
              size="lg"
              className="h-full bg-white/85 backdrop-blur-xl border-2 border-border/30 hover:border-background shadow-card hover:shadow-2xl transition-all duration-500 relative overflow-hidden group-hover:bg-white/95"
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100"></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 mb-3 tracking-tight">
                    {option.label}
                  </h3>
                  <p className="text-base lg:text-lg text-foreground-secondary group-hover:text-foreground transition-colors duration-300 leading-relaxed font-medium">
                    {option.description}
                  </p>
                </div>
                
                {/* Arrow indicator */}
                <div className="ml-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                  <div className="bg-primary-100 group-hover:bg-primary-200 rounded-full p-3 transition-colors duration-300">
                    <svg className="w-6 h-6 text-primary transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}