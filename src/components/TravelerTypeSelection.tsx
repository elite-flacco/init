import { useState, useEffect } from 'react';
import { travelerTypes } from '../data/travelerTypes';
import { TravelerType } from '../types/travel';
import { Card } from './ui/Card';

interface TravelerTypeSelectionProps {
  onSelect: (type: TravelerType) => void;
}

export function TravelerTypeSelection({ onSelect }: TravelerTypeSelectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div 
        className={`page-header transition-all duration-700 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
        role="banner"
        aria-labelledby="step-title"
      >
        <h1 className="page-title mb-6">
          What's your travel vibe?
        </h1>
        <p className="page-subtitle max-w-2xl mx-auto mb-4 opacity-90">
          Choose the style that speaks to your wanderlust soul. We'll craft the perfect adventure just for you.
        </p>
      </div>

      {/* Traveler Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto" role="group" aria-labelledby="step-title">
        {travelerTypes.map((type, index) => (
          <div
            key={type.id}
            onClick={() => onSelect(type)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(type);
              }
            }}
            className={`group relative cursor-pointer transition-all duration-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
            } hover:scale-[1.02] hover:-translate-y-2`}
            style={{ 
              transitionDelay: `${150 + index * 150}ms`
            }}
            role="button"
            tabIndex={0}
            aria-label={`Select ${type.name} traveler type: ${type.description}`}
          >
            <div className="h-full relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 scale-110"></div>
              
              <Card className="h-full p-8 bg-white/80 backdrop-blur-xl border-2 border-border/30 hover:border-border rounded-3xl shadow-card hover:shadow-2xl transition-all duration-500 relative overflow-hidden group-hover:bg-white/90">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out opacity-0 group-hover:opacity-100"></div>
                
                <div className="relative z-10 flex flex-col items-center h-full text-center space-y-6">
                  {/* Icon with enhanced styling */}
                  <div className="text-7xl lg:text-8xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 filter drop-shadow-lg group-hover:drop-shadow-2xl" aria-hidden="true">
                    {type.icon}
                  </div>
                  
                  {/* Title with gradient */}
                  <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-500 tracking-tight">
                    {type.name}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-base lg:text-lg text-foreground-secondary leading-relaxed flex-grow font-medium group-hover:text-foreground transition-colors duration-500">
                    {type.description}
                  </p>
                  
                </div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}