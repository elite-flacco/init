"use client";

import { motion } from "framer-motion";
import { User, MapPin, Calendar, MapIcon } from "lucide-react";
import { getProgressStepIcon } from "../utils/iconMapping";

interface ProgressStep {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  completed: boolean;
}

interface TravelProgressIndicatorProps {
  currentStep: string;
  className?: string;
  vertical?: boolean;
}

export function TravelProgressIndicator({
  currentStep,
  className = "",
  vertical = false,
}: TravelProgressIndicatorProps) {
  // Define the travel journey steps with 3D travel-themed icons
  const steps: ProgressStep[] = [
    // {
    //   id: "traveler-type",
    //   label: "",
    //   icon: () => getProgressStepIcon("traveler-type", currentStep === "traveler-type" ? "md" : "sm"),
    //   active: currentStep === "traveler-type",
    //   completed: [
    //     "destination-knowledge",
    //     "destination-input",
    //     "pick-destination",
    //     "destination-recommendations",
    //     "planning",
    //     "plan",
    //   ].includes(currentStep),
    // },
    {
      id: "destination",
      label: "",
      icon: () => getProgressStepIcon("destination", [
        "destination-knowledge",
        "destination-input", 
        "pick-destination",
        "destination-recommendations",
      ].includes(currentStep) ? "md" : "sm"),
      active: [
        "destination-knowledge",
        "destination-input",
        "pick-destination",
        "destination-recommendations",
      ].includes(currentStep),
      completed: ["planning", "plan"].includes(currentStep),
    },
    {
      id: "planning",
      label: "",
      icon: () => getProgressStepIcon("planning", currentStep === "planning" ? "md" : "sm"),
      active: currentStep === "planning",
      completed: currentStep === "plan",
    },
    {
      id: "plan",
      label: "",
      icon: () => getProgressStepIcon("plan", currentStep === "plan" ? "md" : "sm"),
      active: currentStep === "plan",
      completed: false,
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.active);
  const progressPercentage =
    currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  if (vertical) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        {/* Vertical Progress Line */}
        <div className="relative flex flex-col items-center space-y-6">
          {/* Curved Progress Trail */}
          <svg 
            className="text-primary absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-0" 
            width="20" 
            height="100%" 
            viewBox="0 0 20 200"
            preserveAspectRatio="none"
          >
            <defs>
              <clipPath id="progressClip">
                <rect x="0" y="0" width="20" height={`${(progressPercentage / 100) * 200}`} />
              </clipPath>
            </defs>
            {/* Background curved track */}
            <path 
              d="M10,0 Q15,25 10,50 Q5,75 10,100 Q15,125 10,150 Q5,175 10,200" 
              stroke="#CBD5E1" 
              strokeWidth="2" 
              fill="none"
            />
            {/* Progress curved line */}
            <path 
              d="M10,0 Q15,25 10,50 Q5,75 10,100 Q15,125 10,150 Q5,175 10,200" 
              stroke="#0b7786" 
              strokeWidth="3" 
              fill="none"
              clipPath="url(#progressClip)"
            />
          </svg>

          {steps.map((step) => {
            const IconComponent = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-20">
                {/* Step Icon Container */}
                <div className="relative group z-20">
                  {/* Step Circle */}
                  <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-transparent">
                    {/* Travel Icon - Always show */}
                    <div className={`${step.active ? "text-primary" : step.completed ? "text-primary" : "text-foreground"}`}>
                      <IconComponent />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* Desktop Version - Full Journey Visualization */}
      <div className="hidden lg:flex items-center space-x-6 relative">
        {/* Progress Trail */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border/60 -translate-y-1/2 z-0">
          <div
            className="h-full bg-primary"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {steps.map((step) => {
          const IconComponent = step.icon;

          return (
            <div key={step.id} className="flex items-center relative z-10">
              {/* Step Icon Container */}
              <div className="relative group">
                {/* Step Circle */}
                <div className="relative w-12 h-12 rounded-full flex items-center justify-center bg-transparent">
                  {/* Travel Icon - Always show */}
                  <div className={`${step.active ? "text-white" : step.completed ? "text-primary" : "text-foreground"}`}>
                    <IconComponent />
                  </div>
                </div>

                {/* Step Label */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span
                    className={`text-xs font-medium ${
                      step.active
                        ? "text-primary font-semibold"
                        : step.completed
                          ? "text-primary/30 font-medium"
                          : "text-foreground-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Version - Compact Journey Indicator */}
      <div className="flex lg:hidden items-center space-x-4">
        {/* Current Step Info */}
        <div className="flex items-center space-x-3 bg-transparent rounded-2xl px-4 py-2 border border-border/50">
          {/* Current Step Icon */}
          <div className="relative">
            {steps.map((step) => {
              if (!step.active) return null;
              const IconComponent = step.icon;

              return (
                <div
                  key={step.id}
                  className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center"
                >
                  <div className="text-primary">
                    <IconComponent />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step Progress Text */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground-muted">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm font-semibold text-primary">
              {steps.find((step) => step.active)?.label || ""}
            </span>
          </div>
        </div>

        {/* Mini Progress Bar */}
        <div className="flex-1 max-w-20 h-2 bg-border/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
