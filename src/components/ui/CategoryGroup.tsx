import React from "react";
import { LucideIcon } from "lucide-react";

interface CategoryGroupProps {
  title: string;
  children: React.ReactNode;
  icon?: LucideIcon | string;
  className?: string;
}

export function CategoryGroup({
  title,
  children,
  icon: Icon,
  className = "",
}: CategoryGroupProps) {
  return (
    <div className={`mb-8 last:mb-0 ${className}`}>
      <div className="flex items-center border-b border-border pb-2 mb-4">
        {Icon && <Icon className="mr-2 text-primary" />}
        <h5>{title}</h5>
      </div>
      {children}
    </div>
  );
}
