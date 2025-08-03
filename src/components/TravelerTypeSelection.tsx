import { useState, useEffect } from 'react';
import { travelerTypes } from '../data/travelerTypes';
import { TravelerType } from '../types/travel';
import { Card } from './ui/Card';

interface TravelerTypeSelectionProps {
  onSelect: (type: TravelerType) => void;
}

// Helper function to render traveler cards with asymmetrical positioning
function renderTravelerCard(
  type: TravelerType, 
  index: number, 
  isLoaded: boolean, 
  hoveredType: string | null, 
  setHoveredType: (id: string | null) => void, 
  onSelect: (type: TravelerType) => void, 
  getAdventurePreview: (typeId: string) => string
) {
  return (
    <div
      onClick={() => onSelect(type)}
      onMouseEnter={() => setHoveredType(type.id)}
      onMouseLeave={() => setHoveredType(null)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(type);
        }
      }}
      className={`group relative cursor-pointer transition-all duration-700 ${
        isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      } hover:scale-[1.03] hover:-translate-y-3`}
      style={{ 
        transitionDelay: `${200 + index * 200}ms`
      }}
      role="button"
      tabIndex={0}
      aria-label={`Choose ${type.name} adventure style: ${type.description}`}
    >
      {/* Adventure Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10 scale-110 animate-adventure-float"></div>
      
      {/* Main Adventure Card */}
      <div className="relative h-full min-h-[400px] bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 group-hover:border-primary/50 rounded-3xl shadow-card group-hover:shadow-adventure-float transition-all duration-700 overflow-hidden">
        
        {/* Adventure Pattern Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[8%] via-accent/[5%] to-secondary/[8%]"></div>
          <div className="absolute top-4 right-4 text-2xl opacity-20 animate-spin-slow">🧭</div>
        </div>
        
        {/* Expedition Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-out opacity-0 group-hover:opacity-100"></div>
        
        {/* Adventure Content */}
        <div className="relative z-10 p-8 lg:p-10 h-full flex flex-col">
          
          {/* Adventure Icon */}
          <div className="text-center mb-6">
            <div className="inline-block transform transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 filter drop-shadow-lg group-hover:drop-shadow-2xl">
              <span className="text-6xl lg:text-7xl block mb-2" aria-hidden="true">
                {type.icon}
              </span>
            </div>
          </div>
          
          {/* Adventure Title */}
          <div className="text-center mb-6">
            <h3 className="text-2xl lg:text-3xl font-display font-bold mb-3 bg-gradient-to-br from-primary via-accent to-secondary bg-clip-text text-transparent group-hover:from-primary-dark group-hover:to-secondary-light transition-all duration-500 tracking-tight">
              The {type.name}
            </h3>
            
            {/* Adventure Preview */}
            <div className={`transition-all duration-500 ${hoveredType === type.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <p className="text-base font-medium text-primary/80 bg-primary/10 px-4 py-2 rounded-full inline-block">
                {getAdventurePreview(type.id)}
              </p>
            </div>
          </div>
          
          {/* Adventure Story */}
          <div className="flex-grow flex items-center justify-center">
            <p className="text-base lg:text-lg text-foreground-secondary leading-relaxed text-center font-medium group-hover:text-foreground transition-colors duration-500 max-w-sm">
              {type.description}
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export function TravelerTypeSelection({ onSelect }: TravelerTypeSelectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Adventure-themed intro messages for each type
  const getAdventurePreview = (typeId: string) => {
    const previews = {
      'explorer': "🗺️ Off the beaten path awaits...",
      'type-a': "📋 Every detail, perfectly planned...",
      'overthinker': "💭 Let us handle the decisions...",
      'chill': "🌊 Pure relaxation, zero stress..."
    };
    return previews[typeId as keyof typeof previews] || "✨ Your adventure awaits...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-soft to-background-muted relative overflow-hidden">
      {/* Adventure background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-10 animate-float">🗺️</div>
        <div className="absolute top-32 right-20 text-4xl opacity-20 animate-glow-pulse" style={{ animationDelay: '1s' }}>✈️</div>
        <div className="absolute bottom-32 left-32 text-5xl opacity-15 animate-float" style={{ animationDelay: '2s' }}>🧭</div>
        <div className="absolute bottom-20 right-16 text-3xl opacity-25 animate-bounce-subtle" style={{ animationDelay: '0.5s' }}>⛰️</div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Asymmetrical Adventure Header */}
        <div className="relative mb-20">
          {/* Main title section - offset left */}
          <div 
            className={`ml-8 md:ml-16 lg:ml-24 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
            role="banner"
            aria-labelledby="step-title"
          >
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight max-w-4xl">
              Choose Your Adventure Spirit
            </h1>
            
            {/* Offset subtitle block */}
            <div className="ml-8 md:ml-16 max-w-2xl space-y-4">
              <p className="text-xl md:text-2xl text-foreground-secondary leading-relaxed font-medium">
                Every great journey begins with knowing yourself.
              </p>
              <p className="text-lg md:text-xl text-foreground-muted leading-relaxed ml-4">
                Pick the traveler that lives in your soul, and we'll craft an adventure that speaks to your wanderlust.
              </p>
            </div>
          </div>
        </div>

        {/* Asymmetrical Adventure Persona Cards */}
        <div className="max-w-7xl mx-auto px-4 lg:px-8" role="group" aria-labelledby="step-title">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left column - offset inward */}
            <div className="lg:ml-16 space-y-8">
              {travelerTypes.slice(0, 2).map((type, index) => (
                <div key={type.id} className={index === 1 ? 'lg:ml-12' : ''}>
                  {renderTravelerCard(type, index, isLoaded, hoveredType, setHoveredType, onSelect, getAdventurePreview)}
                </div>
              ))}
            </div>
            {/* Right column - offset outward */}
            <div className="lg:-mr-8 space-y-8">
              {travelerTypes.slice(2, 4).map((type, index) => (
                <div key={type.id} className={index === 0 ? 'lg:-ml-8' : 'lg:ml-4'}>
                  {renderTravelerCard(type, index + 2, isLoaded, hoveredType, setHoveredType, onSelect, getAdventurePreview)}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}