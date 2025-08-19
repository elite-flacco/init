import React, { useState } from "react";
import { Calendar, DollarSign, ArrowRight, Search } from "lucide-react";
import { Destination } from "../types/travel";
import { MapPinIcon3D } from "./ui/Icon3D";
import { useDestinationImage } from '../hooks/useDestinationImage';

interface DestinationCardProps {
  destination: Destination;
  onViewDetails: (destination: Destination) => void;
}

export function DestinationCard({
  destination,
  onViewDetails,
}: DestinationCardProps) {
  const { imageUrl } = useDestinationImage({
    destination: destination.name,
    country: destination.country,
    count: 1
  });

  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => {
    onViewDetails(destination);
  };

  const displayImage = imageUrl || destination.image;

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group h-full"
    >
      <div className="card-3d-destination h-full overflow-hidden">

        {/* Hero Image Section */}
        <div className="relative h-72 overflow-hidden">
          <img
            src={displayImage}
            alt={destination.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error('Image failed to load:', target.src);
              if (target.src !== destination.image) {
                target.src = destination.image;
              }
            }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

          {/* Country Badge */}
          <div className="absolute top-6 left-6">
            <div className="glass px-3 py-1 rounded-full text-sm text-white font-semibold depth-light flex items-center">
              <div>
                <MapPinIcon3D size="2xs" />
              </div>
              {destination.country}
            </div>
          </div>

          {/* Destination Title */}
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-3d-title text-2xl md:text-3xl text-white mb-2">
              {destination.name}
            </h3>
            <div
              className={`overflow-hidden transition-all duration-500 ${isHovered ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}
            >
              <p className="text-white/90 text-sm font-medium">
                {destination.description.split(".")[0]}...
              </p>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6">
          {/* Key Info */}
          <div className="flex flex-col gap-2 sm:gap-4 mb-2 sm:mb-4">
            <div className="card-3d-soft p-4">
              <div className="flex items-center mb-2">
                <span className="text-sm font-semibold text-secondary">
                📅 Best Time
                </span>
              </div>
              <p className="text-sm text-foreground font-medium">
                {destination.bestTime}
              </p>
            </div>

            <div className="card-3d-soft p-4">
              <div className="flex items-center mb-2">
                <span className="text-sm font-semibold text-secondary">
                💰 Cost
                </span>
              </div>
              <p className="text-sm text-foreground font-medium">
                {destination.estimatedCost}
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-8">
            <h6 className="text-3d-title mb-3">Highlights</h6>
            <div className="flex flex-wrap gap-2">
              {destination.highlights.slice(0, 3).map((highlight, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(highlight + ' ' + destination.name + ' ' + destination.country)}`, '_blank');
                  }}
                  className="badge-secondary group flex items-center gap-1.5 hover:bg-secondary/20 transition-all duration-200"
                  title={`Search Google for ${highlight} in ${destination.name}`}
                >
                  <span className="text-xs font-semibold text-secondary">{highlight}</span>
                  <Search className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              ))}
              {destination.highlights.length > 3 && (
                <span className="badge text-foreground-muted bg-foreground-muted/10 border border-foreground-muted/30">
                  +{destination.highlights.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* Activities */}
          <div className="mb-8">
            <h6 className="text-3d-title mb-3">Adventure Awaits</h6>
            <div className="flex flex-wrap gap-2">
              {destination.keyActivities.slice(0, 2).map((activity, index) => (
                <span key={index} className="badge-primary">
                  {activity}
                </span>
              ))}
              {destination.keyActivities.length > 2 && (
                <span className="badge text-foreground-muted bg-foreground-muted/10 border border-foreground-muted/30">
                  +{destination.keyActivities.length - 2} more
                </span>
              )}
            </div>
          </div>

          {/* Match Reason */}
          <div className="mb-8">
            <h6 className="text-3d-title mb-2">Perfect For You</h6>
            <p className="text-sm text-foreground-secondary font-medium leading-relaxed">
              {destination.matchReason}
            </p>
          </div>

          {/* CTA Button */}
          <button
            className="btn-3d-primary w-full"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(destination);
            }}
          >
            <span className="flex items-center justify-center gap-2 text-white">
              🚀 Explore This
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
