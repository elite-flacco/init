import React from "react";
import { ExternalLink } from "lucide-react";

export interface BookingLink {
  platform: "airbnb" | "getyourguide" | "viator";
  url: string;
}

interface ItemCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: string;
  tags?: string[];
  searchLink?: string;
  bookingLinks?: BookingLink[];
  children?: React.ReactNode;
  className?: string;
}

// Helper function to get platform icon
const getPlatformIcon = (platform: BookingLink["platform"]) => {
  switch (platform) {
    case "airbnb":
      return (
        <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#FF385C" />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            fontFamily="Arial"
          >
            A
          </text>
        </svg>
      );
    case "getyourguide":
      return (
        <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#ff5533" />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            fontFamily="Arial"
          >
            G
          </text>
        </svg>
      );
    case "viator":
      return (
        <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="16" fill="#008768" />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
            fontFamily="Arial"
          >
            V
          </text>
        </svg>
      );
    default:
      return <ExternalLink className="w-4 h-4" />;
  }
};

export function ItemCard({
  title,
  subtitle,
  description,
  metadata,
  tags = [],
  searchLink,
  bookingLinks = [],
  children,
  className = "",
}: ItemCardProps) {
  return (
    <div
      className={`border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between">
        <h6 className="text-foreground/90">{title}</h6>
        <div className="flex items-center space-x-2">
          {searchLink && (
            <a
              href={searchLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-primary transition-colors"
              title="Search on Google"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {bookingLinks.length > 0 && (
            <div className="flex items-center space-x-1">
              {bookingLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:opacity-70 transition-opacity"
                  title={`Book on ${link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}`}
                >
                  {getPlatformIcon(link.platform)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {subtitle && <p className="text-sm text-foreground-secondary mt-1">{subtitle}</p>}

      {metadata && <p className="text-sm text-foreground-secondary mt-1">{metadata}</p>}

      {description && <p className="text-foreground mt-2">{description}</p>}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-2xs bg-primary/10 text-primary px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
