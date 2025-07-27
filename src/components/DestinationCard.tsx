import { MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { Destination } from '../types/travel';
import { Card } from './ui/Card';

interface DestinationCardProps {
  destination: Destination;
  onSelect: (destination: Destination) => void;
}

export function DestinationCard({ destination, onSelect }: DestinationCardProps) {
  return (
    <div 
      onClick={() => onSelect(destination)}
      className="group h-full transition-all duration-300 transform hover:-translate-y-1"
    >
      <Card className="h-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors duration-300">
        {/* Image with overlay */}
        <div className="relative h-64 overflow-hidden">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
          
          {/* Location Badge */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <MapPin className="w-4 h-4 text-primary mr-1.5" />
              <span className="text-sm font-medium text-foreground">
                {destination.country}
              </span>
            </div>
          </div>
          
          {/* Title */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-2xl font-bold text-white group-hover:translate-y-[-2px] transition-transform duration-300">
              {destination.name}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <p className="text-foreground-secondary mb-6 leading-relaxed line-clamp-3">
            {destination.description}
          </p>
          
          {/* Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 text-foreground-muted mr-2 flex-shrink-0" />
              <span className="text-foreground-secondary">
                Best time: <span className="font-medium text-foreground">{destination.bestTime}</span>
              </span>
            </div>
            <div className="flex items-center text-sm">
              <DollarSign className="w-4 h-4 text-foreground-muted mr-2 flex-shrink-0" />
              <span className="text-foreground-secondary">
                Budget: <span className="font-medium text-foreground">{destination.budget}</span>
              </span>
            </div>
          </div>

          {/* Highlights */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Highlights:</h4>
            <div className="flex flex-wrap gap-2">
              {destination.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mt-6 pt-4 border-t border-border">
            <button 
              className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark transition-colors duration-200 group/button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(destination);
              }}
            >
              View details
              <ArrowRight className="w-4 h-4 ml-1.5 transition-transform duration-200 group-hover/button:translate-x-1" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}