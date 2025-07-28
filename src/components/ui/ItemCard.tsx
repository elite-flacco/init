import React from 'react';
import { ExternalLink } from 'lucide-react';

interface ItemCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: string;
  tags?: string[];
  searchLink?: string;
  children?: React.ReactNode;
  className?: string;
}

export function ItemCard({ 
  title, 
  subtitle, 
  description, 
  metadata, 
  tags = [], 
  searchLink,
  children,
  className = '' 
}: ItemCardProps) {
  return (
    <div className={`border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-center">
        <h6>{title}</h6>
        {searchLink && (
          <div className="ml-2">
            <a href={searchLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center">
              <ExternalLink className="w-3 h-3 mr-1" />
            </a>
          </div>
        )}
      </div>
      
      {subtitle && (
        <p className="text-foreground-secondary mt-1">{subtitle}</p>
      )}
      
      {metadata && (
        <p className="text-foreground-secondary mt-1">{metadata}</p>
      )}
      
      {description && (
        <p className="text-foreground/90 mt-2">{description}</p>
      )}
      
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((tag, idx) => (
            <span key={idx} className="text-2xs bg-primary/10 text-primary px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {children}
    </div>
  );
}