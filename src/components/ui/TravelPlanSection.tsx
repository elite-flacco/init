import React from "react";
import { LucideIcon } from "lucide-react";

interface TravelPlanSectionProps {
  children: React.ReactNode;
  rotation?: "left" | "right" | "none";
  glowColor?: "primary" | "secondary" | "accent";
  className?: string;
}

export function TravelPlanSection({
  children,
  rotation = "none",
  glowColor = "primary",
  className = "",
}: TravelPlanSectionProps) {
  const rotationClass = {
    left: "transform -rotate-[0.8deg] hover:rotate-0",
    right: "transform rotate-[0.5deg] hover:rotate-0",
    none: "",
  }[rotation];

  const glowClasses = {
    primary: "from-primary/20 via-accent/10 to-secondary/20",
    secondary: "from-secondary/20 via-primary/10 to-accent/20",
    accent: "from-accent/20 via-secondary/10 to-primary/20",
  }[glowColor];

  const borderHoverColor = {
    primary: "hover:border-primary/50",
    secondary: "hover:border-secondary/50",
    accent: "hover:border-accent/50",
  }[glowColor];

  return (
    <div className={`relative ${className}`}>
      <div className={`${rotationClass} transition-transform duration-700`}>
        <div
          className={`bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 ${borderHoverColor} rounded-3xl p-8 lg:p-10 shadow-card hover:shadow-adventure-float transition-all duration-500 relative overflow-hidden`}
        >
          {/* Adventure Glow */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${glowClasses} rounded-3xl blur-xl opacity-0 hover:opacity-100 transition-all duration-700 -z-10`}
          ></div>

          {children}
        </div>
      </div>
    </div>
  );
}
