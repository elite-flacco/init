import React from 'react';

interface CategoryGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function CategoryGroup({ title, children, className = '' }: CategoryGroupProps) {
  return (
    <div className={`mb-8 last:mb-0 ${className}`}>
      <h5 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
        {title}
      </h5>
      {children}
    </div>
  );
}