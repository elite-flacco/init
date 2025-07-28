import React from 'react';

interface TravelPlanSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function TravelPlanSection({ children, className = '' }: TravelPlanSectionProps) {
  return (
    <div className={`bg-card rounded-lg shadow p-6 ${className}`}>
      {children}
    </div>
  );
}