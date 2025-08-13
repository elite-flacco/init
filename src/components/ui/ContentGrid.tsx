import React from "react";

interface ContentGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function ContentGrid({
  children,
  columns = 2,
  className = "",
}: ContentGridProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid grid-cols-1 md:grid-cols-2 gap-8",
    3: "grid grid-cols-1 md:grid-cols-3 gap-6",
  }[columns];

  return <div className={`${gridClasses} ${className}`}>{children}</div>;
}

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  icon?: string;
  className?: string;
}

export function ContentCard({
  children,
  title,
  icon,
  className = "",
}: ContentCardProps) {
  return (
    <div
      className={`bg-gradient-to-r from-background/60 to-background-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-6 shadow-card ${className}`}
    >
      {title && (
        <div className="flex items-center mb-4">
          {icon && <span className="text-xl mr-2">{icon}</span>}
          <h6 className="font-bold text-foreground">{title}</h6>
        </div>
      )}
      {children}
    </div>
  );
}
