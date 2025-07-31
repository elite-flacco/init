import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, MapPin, Compass, Calendar, Utensils, Home, Plane } from 'lucide-react';
import { Card } from './Card';

interface TravelPlanLoadingProps {
  isVisible: boolean;
  destinationName?: string;
}

const loadingStages = [
  {
    icon: Brain,
    message: "🧠 Analyzing your travel personality...",
    detail: "Understanding what makes you tick"
  },
  {
    icon: MapPin,
    message: "🗺️ Mapping out your destination...",
    detail: "Discovering hidden gems and local secrets"
  },
  {
    icon: Calendar,
    message: "📅 Crafting your perfect itinerary...",
    detail: "Balancing adventure with relaxation"
  },
  {
    icon: Utensils,
    message: "🍽️ Finding amazing places to eat...",
    detail: "From street food to fine dining"
  },
  {
    icon: Home,
    message: "🏨 Scouting the best neighborhoods...",
    detail: "Where locals love to stay"
  },
  {
    icon: Compass,
    message: "✨ Adding those special touches...",
    detail: "The experiences that make trips unforgettable"
  },
  {
    icon: Plane,
    message: "🚀 Almost ready for takeoff!",
    detail: "Just putting the finishing touches on your plan"
  }
];

export function TravelPlanLoading({ isVisible, destinationName = "your destination" }: TravelPlanLoadingProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStageIndex(0);
      setProgress(0);
      return;
    }

    // Cycle through stages every 3 seconds
    const stageInterval = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1) % loadingStages.length);
    }, 3000);

    // Gradual progress increase
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stop at 90% to avoid reaching 100% before completion
        return prev + Math.random() * 8;
      });
    }, 1000);

    return () => {
      clearInterval(stageInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const currentStage = loadingStages[currentStageIndex];
  const IconComponent = currentStage.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card 
        variant="elevated" 
        size="lg" 
        className="max-w-2xl w-full text-center animate-scale-in"
      >
        {/* Main Loading Animation */}
        <div className="relative mb-8">
          <div className="relative flex justify-center items-center h-24">
            {/* Central Brain/AI Icon */}
            <div className="absolute">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-primary animate-pulse-slow" />
                <div className="absolute inset-0 animate-glow-pulse">
                  <Sparkles className="w-12 h-12 text-primary opacity-30" />
                </div>
              </div>
            </div>
            
            {/* Orbiting Stage Icon */}
            <div className="absolute animate-spin-slow">
              <div 
                className="w-20 h-20 flex items-center justify-center"
                style={{
                  transform: 'rotate(' + (currentStageIndex * 51.4) + 'deg)'
                }}
              >
                <div 
                  className="transform -rotate-[51.4deg] p-3 bg-accent/20 rounded-full animate-bounce-subtle"
                  style={{
                    transform: 'rotate(-' + (currentStageIndex * 51.4) + 'deg)'
                  }}
                >
                  <IconComponent className="w-6 h-6 text-accent" />
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute animate-float animation-delay-500">
              <MapPin className="w-4 h-4 text-success opacity-60 transform -translate-x-8 -translate-y-6" />
            </div>
            <div className="absolute animate-float animation-delay-1000">
              <Utensils className="w-4 h-4 text-secondary opacity-60 transform translate-x-8 -translate-y-4" />
            </div>
            <div className="absolute animate-float animation-delay-1500">
              <Home className="w-4 h-4 text-warning opacity-60 transform -translate-x-6 translate-y-8" />
            </div>
          </div>
        </div>

        {/* Stage Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Cooking Up Something Amazing
          </h2>
          <div 
            key={currentStageIndex}
            className="animate-fade-in-fast"
          >
            <p className="text-lg font-medium text-primary mb-2">
              {currentStage.message}
            </p>
            <p className="text-foreground-secondary">
              {currentStage.detail}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-foreground-muted">Crafting your {destinationName} experience</span>
            <span className="text-sm font-medium text-primary">{Math.min(Math.round(progress), 90)}%</span>
          </div>
          <div className="w-full bg-border rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-1000 ease-out rounded-full relative"
              style={{ width: `${Math.min(progress, 90)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
            </div>
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-center space-x-2 mb-6">
          {loadingStages.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStageIndex 
                  ? 'bg-primary scale-125' 
                  : index < currentStageIndex 
                    ? 'bg-success' 
                    : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Footer Message */}
        <p className="text-sm text-foreground-muted">
          Our AI is analyzing thousands of travel insights to create your perfect trip. 
          <br />
          This usually takes 30-60 seconds...
        </p>

        {/* Accessibility */}
        <div 
          role="status" 
          aria-live="polite" 
          aria-label="Generating personalized travel plan"
          className="sr-only"
        >
          {currentStage.message} - {Math.round(progress)}% complete
        </div>
      </Card>
    </div>
  );
}