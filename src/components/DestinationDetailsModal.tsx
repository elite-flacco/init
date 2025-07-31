import React from 'react';
import { X, MapPin, Calendar, DollarSign, ArrowRight } from 'lucide-react';
import { Destination } from '../types/travel';

interface DestinationDetailsModalProps {
  destination: Destination;
  isOpen: boolean;
  onClose: () => void;
  onSelectForPlanning: (destination: Destination) => void;
}

export function DestinationDetailsModal({ 
  destination, 
  isOpen, 
  onClose, 
  onSelectForPlanning 
}: DestinationDetailsModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSelectForPlanning = () => {
    onSelectForPlanning(destination);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative mx-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header with image */}
        <div className="relative h-64 md:h-80">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          {/* Location badge */}
          <div className="absolute top-4 left-4">
            <div className="flex items-center bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <MapPin className="w-4 h-4 text-primary mr-1.5" />
              <span className="text-sm font-medium text-foreground">
                {destination.country}
              </span>
            </div>
          </div>
          
          {/* Title */}
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {destination.name}
            </h1>
            <p className="text-lg text-white/90 max-w-2xl">
              {destination.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 max-h-[50vh] overflow-y-auto">
          {/* Quick info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-primary mr-3" />
              <div>
                <p className="text-sm text-foreground-secondary">Best Time to Visit</p>
                <p className="font-medium text-foreground">{destination.bestTime}</p>
              </div>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-primary mr-3" />
              <div>
                <p className="text-sm text-foreground-secondary">Estimated Cost</p>
                <p className="font-medium text-foreground">{destination.estimatedCost}</p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-foreground mb-4">Highlights</h3>
            <div className="flex flex-wrap gap-3">
              {destination.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Information */}
          {destination.details && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">About This Destination</h3>
              <div className="prose prose-gray max-w-none">
                {destination.details.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-foreground-secondary leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSelectForPlanning}
              className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Plan My Trip Here
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}