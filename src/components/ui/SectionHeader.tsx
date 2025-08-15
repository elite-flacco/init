import React from "react";
import { LucideIcon } from "lucide-react";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  emoji?: string;
  badgeColor?: "primary" | "secondary" | "accent";
  className?: string;
}

export function SectionHeader({
  title,
  emoji = "🎯",
  badgeColor = "primary",
  className = "",
}: SectionHeaderProps) {
  const badgeClasses = {
    primary: "bg-primary/20 text-primary",
    secondary: "bg-secondary/20 text-secondary",
    accent: "bg-accent/20 text-accent",
  }[badgeColor];

  return (
    <div className={`flex items-center mb-8 ${className}`}>
      <div
        className={`inline-flex items-center ${badgeClasses} px-4 py-2 rounded-full font-bold text-lg mr-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300`}
      >
        {/* <Icon className="w-5 h-5 mr-3" /> */}
        <div className="text-base md:text-lg lg:text-lg mr-2">{emoji}</div>
        {title}
      </div>
      {/* <div className="text-2xl animate-bounce-subtle">{emoji}</div> */}
    </div>
  );
}
