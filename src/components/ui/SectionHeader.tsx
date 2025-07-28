import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  className?: string;
}

export function SectionHeader({ icon: Icon, title, className = '' }: SectionHeaderProps) {
  return (
    <h4 className={`mb-6 flex items-center ${className}`}>
      <Icon className="mr-2" /> {title}
    </h4>
  );
}