import React from 'react';
import { ExternalLink } from 'lucide-react';

interface RestaurantItemProps {
  name: string;
  cuisine: string;
  priceRange: string;
  neighborhood?: string;
  description: string;
  specialDishes?: string[];
  reservationsRecommended?: string;
  searchLink?: string;
}

export function RestaurantItem({ 
  name, 
  cuisine, 
  priceRange, 
  neighborhood, 
  description, 
  specialDishes = [],
  reservationsRecommended,
  searchLink 
}: RestaurantItemProps) {
  return (
    <div className="border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="flex items-center">
        <h6>{name}</h6>
        {searchLink && (
          <div className="ml-2">
            <a href={searchLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center">
              <ExternalLink className="w-3 h-3 mr-1" />
            </a>
          </div>
        )}
      </div>
      <p>{cuisine} • {priceRange}</p>
      {neighborhood && (
        <p>{neighborhood}</p>
      )}
      <p className="mt-1">{description}</p>
      {specialDishes.length > 0 && (
        <div className="mt-2">
          <p className="font-semibold">Must-try dishes:</p>
          <p>{specialDishes.join(', ')}</p>
        </div>
      )}
      {reservationsRecommended && (
        <div className="mt-2">
          <p className="font-semibold">Reservations recommended:</p>
          <p>{reservationsRecommended}</p>
        </div>
      )}
    </div>
  );
}