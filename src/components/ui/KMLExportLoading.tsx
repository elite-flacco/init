import React, { useState, useEffect } from "react";
import { MapPin, Plane, Compass } from "lucide-react";
import { Card } from "./Card";

interface KMLExportLoadingProps {
  isVisible: boolean;
}

const loadingMessages = [
  "🗺️ Mapping out your adventure...",
  "✨ Sprinkling some travel magic...",
  "📍 Pinpointing perfect locations...",
  "🧳 Packing your digital itinerary...",
  "🌍 Geocoding destinations...",
  "🗺️ Creating your personalized map...",
  "📱 Preparing for Google Maps...",
  "🚀 Almost ready for takeoff!",
];

export function KMLExportLoading({ isVisible }: KMLExportLoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentMessageIndex(0);
      setProgress(0);
      return;
    }

    // Cycle through messages every 2 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    // Simulate progress (this is just visual feedback)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev; // Stop at 95% to avoid reaching 100% before completion
        return prev + Math.random() * 15;
      });
    }, 800);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card
        variant="elevated"
        size="lg"
        className="max-w-md w-full text-center animate-scale-in"
      >
        {/* Loading Icon Animation */}
        <div className="relative mb-6">
          <div className="relative flex justify-center items-center h-16">
            {/* Rotating Map Icon */}
            <div className="absolute animate-spin-slow">
              <Compass className="w-8 h-8 text-primary" />
            </div>

            {/* Floating Plane */}
            <div className="absolute animate-float">
              <Plane className="w-6 h-6 text-secondary transform rotate-45" />
            </div>

            {/* Pulsing Map Pins */}
            <div className="absolute animate-pulse-slow">
              <MapPin className="w-4 h-4 text-success transform -translate-x-6 -translate-y-2" />
            </div>
            <div className="absolute animate-pulse-slow animation-delay-1000">
              <MapPin className="w-4 h-4 text-error transform translate-x-6 translate-y-2" />
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Preparing Your Map
          </h3>
          <p
            key={currentMessageIndex}
            className="text-foreground-secondary animate-fade-in-fast"
          >
            {loadingMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-800 ease-out rounded-full"
              style={{ width: `${Math.min(progress, 95)}%` }}
            />
          </div>
          <p className="text-xs text-foreground-muted mt-2">
            This may take a moment while we geocode your destinations...
          </p>
        </div>

        {/* Accessibility */}
        <div
          role="status"
          aria-live="polite"
          aria-label="Exporting travel plan to KML format"
          className="sr-only"
        >
          {loadingMessages[currentMessageIndex]}
        </div>
      </Card>
    </div>
  );
}
