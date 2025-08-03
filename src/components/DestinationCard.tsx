import React, { useState } from 'react';
import { MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { Destination } from '../types/travel';
import { Card } from './ui/Card';

interface DestinationCardProps {
  destination: Destination;
  onViewDetails: (destination: Destination) => void;
}

export function DestinationCard({ destination, onViewDetails }: DestinationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    onViewDetails(destination);
  };

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group h-full transition-all duration-500 transform hover:-translate-y-3 hover:scale-[1.02] cursor-pointer"
    >
      {/* Adventure Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10 scale-110 animate-adventure-float"></div>
      
      {/* Asymmetrical Adventure Card */}
      <div className="h-full overflow-hidden border-2 border-border/30 group-hover:border-primary/40 rounded-3xl shadow-card group-hover:shadow-adventure-float transition-all duration-500 bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl relative transform group-hover:-rotate-1 hover:rotate-0">
        
        {/* Adventure Pattern Overlay */}
        <div className="absolute top-4 right-4 text-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 animate-spin-slow z-10">
          🧭
        </div>
        
        {/* Asymmetrical Hero Image Section */}
        <div className="relative h-72 overflow-hidden transform group-hover:skew-y-1 transition-transform duration-700">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            loading="lazy"
          />
          
          {/* Adventure Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent group-hover:from-foreground/60 transition-all duration-500" />
          
          {/* Asymmetrical Exploration Badge */}
          <div className="absolute top-6 left-6 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center glass px-4 py-2 rounded-full shadow-glow text-sm font-semibold transform group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-4 h-4 mr-2" />
              {destination.country}
            </div>
          </div>

          {/* Destination Title */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 group-hover:translate-y-[-4px] transition-all duration-300 drop-shadow-lg">
              {destination.name}
            </h3>
            <div className={`overflow-hidden transition-all duration-500 ${isHovered ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
              <p className="text-white/90 text-sm font-medium">
                ✨ {destination.description.split('.')[0]}...
              </p>
            </div>
          </div>
        </div>

        {/* Adventure Details */}
        <div className="p-6">
          
          {/* Key Adventure Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-xl border border-primary/20">
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm font-semibold text-primary">Best Time</span>
              </div>
              <p className="text-sm text-foreground font-medium">{destination.bestTime}</p>
            </div>
            
            <div className="bg-gradient-to-br from-secondary/10 to-accent/10 p-4 rounded-xl border border-secondary/20">
              <div className="flex items-center mb-2">
                <DollarSign className="w-4 h-4 text-secondary mr-2" />
                <span className="text-sm font-semibold text-secondary">Adventure Cost</span>
              </div>
              <p className="text-sm text-foreground font-medium">{destination.estimatedCost}</p>
            </div>
          </div>

          {/* Adventure Highlights */}
          <div className="mb-12">
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">🎯</span>
              <h6 className="font-bold text-foreground">Epic Highlights</h6>
            </div>
            <div className="flex flex-wrap gap-2">
              {destination.highlights.slice(0, 3).map((highlight, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-accent/20 to-primary/20 text-primary border border-primary/30 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105"
                >
                  {highlight}
                </span>
              ))}
              {destination.highlights.length > 3 && (
                <span className="inline-flex items-center px-3 py-1.5 bg-foreground-muted/20 text-foreground-muted border border-foreground-muted/30 rounded-full text-xs font-medium">
                  +{destination.highlights.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Adventure Activities */}
          <div className="mb-12">
            <div className="flex items-center mb-3">
              <span className="text-lg mr-2">⚡</span>
              <h6 className="font-bold text-foreground">Adventure Awaits</h6>
            </div>
            <div className="flex flex-wrap gap-2">
              {destination.keyActivities.slice(0, 2).map((activity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-secondary/20 to-accent/20 text-secondary border border-secondary/30 rounded-full text-xs font-semibold transition-all duration-300 hover:scale-105"
                >
                  {activity}
                </span>
              ))}
              {destination.keyActivities.length > 2 && (
                <span className="inline-flex items-center px-3 py-1.5 bg-foreground-muted/20 text-foreground-muted border border-foreground-muted/30 rounded-full text-xs font-medium">
                  +{destination.keyActivities.length - 2} more
                </span>
              )}
            </div>
          </div>

          {/* Why This Adventure */}
          <div className="mb-8 p-4 bg-gradient-to-br from-primary/5 via-accent/3 to-secondary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start">
              <span className="text-xl mr-3 mt-1">💝</span>
              <div>
                <h6 className="font-bold text-foreground mb-2">Perfect For You</h6>
                <p className="text-sm text-foreground-secondary font-medium leading-relaxed">
                  {destination.matchReason}
                </p>
              </div>
            </div>
          </div>

          {/* Adventure CTA */}
          <button
            className="w-full group/button relative overflow-hidden bg-gradient-to-r from-primary to-accent/20 text-white font-bold py-4 px-6 rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(destination);
            }}
          >
              🚀 Start This Adventure
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-2" />
            {/* Button Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/button:translate-x-full transition-transform duration-1000 ease-out"></div>
          </button>
        </div>
      </div>
    </div>
  );
}