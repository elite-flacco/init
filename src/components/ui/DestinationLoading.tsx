import React, { useState, useEffect } from 'react';
import { Globe, Sparkles, MapPin, Compass, Search, Brain, Plane, Heart } from 'lucide-react';
import { Card } from './Card';

interface DestinationLoadingProps {
  isVisible: boolean;
}

const searchStages = [
  {
    icon: Brain,
    message: "🧠 Analyzing your travel personality...",
    detail: "Understanding what makes your wanderlust tick"
  },
  {
    icon: Search,
    message: "🔍 Scanning the globe for hidden gems...",
    detail: "Exploring destinations off the beaten path"
  },
  {
    icon: Globe,
    message: "🌍 Evaluating thousands of destinations...",
    detail: "From bustling cities to serene beaches"
  },
  {
    icon: MapPin,
    message: "📍 Pinpointing perfect matches...",
    detail: "Finding places that speak to your soul"
  },
  {
    icon: Heart,
    message: "❤️ Curating destinations you'll love...",
    detail: "Handpicking experiences made for you"
  },
  {
    icon: Sparkles,
    message: "✨ Adding that special magic...",
    detail: "The final touches that make trips unforgettable"
  },
  {
    icon: Plane,
    message: "🛫 Almost ready to inspire you!",
    detail: "Your perfect destinations are just moments away"
  }
];

const travelEmojis = ['🏖️', '🏔️', '🏛️', '🌸', '🦘', '🍜', '🎭', '🏯', '🦋', '🌺'];

export function DestinationLoading({ isVisible }: DestinationLoadingProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{id: number, emoji: string, delay: number}>>([]);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStageIndex(0);
      setProgress(0);
      setFloatingEmojis([]);
      return;
    }

    // Generate floating emojis
    const emojis = Array.from({length: 8}, (_, i) => ({
      id: i,
      emoji: travelEmojis[Math.floor(Math.random() * travelEmojis.length)],
      delay: i * 500
    }));
    setFloatingEmojis(emojis);

    // Cycle through stages every 2.5 seconds
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1) % searchStages.length);
    }, 2500);

    // Gradual progress increase
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) return prev; // Stop at 85% to avoid reaching 100% before completion
        return prev + Math.random() * 10;
      });
    }, 800);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const currentStage = searchStages[currentStageIndex];
  const IconComponent = currentStage.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Background Emojis */}
      {floatingEmojis.map((item) => (
        <div
          key={item.id}
          className="absolute text-4xl opacity-10 animate-float pointer-events-none"
          style={{
            left: `${10 + (item.id * 10)}%`,
            top: `${15 + (item.id % 3) * 20}%`,
            animationDelay: `${item.delay}ms`,
            animationDuration: `${3000 + item.id * 200}ms`
          }}
        >
          {item.emoji}
        </div>
      ))}

      <Card 
        variant="elevated" 
        size="lg" 
        className="max-w-2xl w-full text-center animate-scale-in relative z-10"
      >
        {/* Main Loading Animation */}
        <div className="relative mb-8">
          <div className="relative flex justify-center items-center h-28">
            {/* Central Globe with Pulsing Effect */}
            <div className="absolute">
              <div className="relative">
                <Globe className="w-16 h-16 text-primary animate-spin-slow" />
                <div className="absolute inset-0 animate-glow-pulse">
                  <Globe className="w-16 h-16 text-primary opacity-30" />
                </div>
              </div>
            </div>
            
            {/* Orbiting Stage Icon */}
            <div className="absolute animate-spin" style={{ animationDuration: '8s' }}>
              <div 
                className="w-32 h-32 flex items-center justify-center"
                style={{
                  transform: 'rotate(' + (currentStageIndex * 51.4) + 'deg)'
                }}
              >
                <div 
                  className="transform p-3 bg-accent/20 rounded-full animate-bounce-subtle border border-accent/30"
                  style={{
                    transform: 'rotate(-' + (currentStageIndex * 51.4) + 'deg)'
                  }}
                >
                  <IconComponent className="w-6 h-6 text-accent" />
                </div>
              </div>
            </div>

            {/* Floating Travel Icons */}
            <div className="absolute animate-float animation-delay-500">
              <Compass className="w-5 h-5 text-secondary opacity-70 transform -translate-x-12 -translate-y-8" />
            </div>
            <div className="absolute animate-float animation-delay-1000">
              <MapPin className="w-5 h-5 text-success opacity-70 transform translate-x-12 -translate-y-6" />
            </div>
            <div className="absolute animate-float animation-delay-1500">
              <Plane className="w-5 h-5 text-warning opacity-70 transform -translate-x-10 translate-y-10" />
            </div>
            <div className="absolute animate-float animation-delay-2000">
              <Sparkles className="w-5 h-5 text-info opacity-70 transform translate-x-10 translate-y-8" />
            </div>
          </div>
        </div>

        {/* Stage Information */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
            AI is working its magic...
          </h2>
          <div 
            key={currentStageIndex}
            className="animate-fade-in-fast"
          >
            <p className="text-lg font-medium text-primary mb-2">
              {currentStage.message}
            </p>
            <p className="text-foreground-secondary max-w-md mx-auto">
              {currentStage.detail}
            </p>
          </div>
        </div>

        {/* Enhanced Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-foreground-muted">Sifting through thousands of destinations</span>
            <span className="text-sm font-medium text-primary">{Math.min(Math.round(progress), 85)}%</span>
          </div>
          <div className="w-full bg-border/30 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-1000 ease-out rounded-full relative"
              style={{ width: `${Math.min(progress, 85)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Loading Dots */}
        <div className="flex justify-center items-center space-x-3 mb-6">
          <div className="w-4 h-4 bg-gradient-to-r from-primary to-primary rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0ms' }} />
          <div className="w-4 h-4 bg-gradient-to-r from-accent to-accent rounded-full animate-bounce shadow-lg" style={{ animationDelay: '150ms' }} />
          <div className="w-4 h-4 bg-gradient-to-r from-secondary to-secondary rounded-full animate-bounce shadow-lg" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {searchStages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStageIndex 
                  ? 'bg-primary scale-125 shadow-glow' 
                  : index < currentStageIndex 
                    ? 'bg-success' 
                    : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Footer Message */}
        <p className="text-sm text-foreground-muted">
          Our AI is analyzing your travel personality to find destinations that'll make you want to pack your bags immediately ✈️
        </p>

        {/* Accessibility */}
        <div 
          role="status" 
          aria-live="polite" 
          aria-label="Searching for destination recommendations"
          className="sr-only"
        >
          {currentStage.message} - {Math.round(progress)}% complete
        </div>
      </Card>
    </div>
  );
}