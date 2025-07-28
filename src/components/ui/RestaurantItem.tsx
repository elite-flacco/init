import React from 'react';
import { ExternalLink } from 'lucide-react';

interface RestaurantItemProps {
  name: string;
  cuisine: string;
  priceRange: string;
  neighborhood?: string;
  description: string;
  specialDishes?: string[];
  searchLink?: string;
}

export function RestaurantItem({ 
  name, 
  cuisine, 
  priceRange, 
  neighborhood, 
  description, 
  specialDishes = [],
  searchLink 
}: RestaurantItemProps) {
  return (
    <div className="border-b border-border pb-4 last:border-0 last:pb-0">
      <div className="flex items-center">
        <h6 className="font-medium text-foreground">{name}</h6>
        {searchLink && (
          <div className="ml-2">
            <a href={searchLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center">
              <ExternalLink className="w-3 h-3 mr-1" />
            </a>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{cuisine} • {priceRange}</p>
      {neighborhood && (
        <p className="text-xs text-muted-foreground">{neighborhood}</p>
      )}
      <p className="text-foreground/90 mt-1 text-sm">{description}</p>
      {specialDishes.length > 0 && (
        <div className="mt-2">
          <h6 className="text-xs font-medium text-green-600">Must-try dishes:</h6>
          <p className="text-xs text-foreground/80">{specialDishes.join(', ')}</p>
        </div>
      )}
    </div>
  );
}