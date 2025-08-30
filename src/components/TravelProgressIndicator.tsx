"use client";

import { getProgressStepIcon } from "../utils/iconMappingUtils";

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
  // Helper function to get responsive icon size
  const getResponsiveIconSize = (
    isActive: boolean,
    isDesktop: boolean = false,
  ) => {
    if (isDesktop) {
      return isActive ? "md" : "sm";
    }
    return isActive ? "sm" : "xs";
  };

  // Define step configuration
  const stepConfigs = [
    {
      id: "destination",
      label: "",
      stepIds: [
        "destination-knowledge",
        "destination-input",
        "pick-destination",
        "destination-recommendations",
      ],
      completedBy: ["planning", "plan"],
    },
    {
      id: "planning",
      label: "",
      stepIds: ["planning"],
      completedBy: ["plan"],
    },
    {
      id: "plan",
      label: "",
      stepIds: ["plan"],
      completedBy: [],
    },
  ];

  // Create steps dynamically based on screen size
  const createSteps = (isDesktop: boolean): ProgressStep[] => {
    return stepConfigs.map((config) => ({
      id: config.id,
      label: config.label,
      icon: () => {
        const isActive = config.stepIds.includes(currentStep);
        return getProgressStepIcon(
          config.id,
          getResponsiveIconSize(isActive, isDesktop),
        );
      },
      active: config.stepIds.includes(currentStep),
      completed: config.completedBy.includes(currentStep),
    }));
  };

  const mobileSteps = createSteps(false);
  const desktopSteps = createSteps(true);

  const currentStepIndex = mobileSteps.findIndex((step) => step.active);
  const progressPercentage =
    currentStepIndex >= 0
      ? (currentStepIndex / (mobileSteps.length - 1)) * 100
      : 0;

  // Helper function to render step icons
  const renderStepIcon = (step: ProgressStep, containerClass: string) => {
    const IconComponent = step.icon;
    return (
      <div key={step.id} className="flex flex-col items-center relative z-20">
        <div className="relative group z-20">
          <div
            className={`relative ${containerClass} rounded-full flex items-center justify-center bg-transparent`}
          >
            <div
              className={`${step.active ? "text-primary" : step.completed ? "text-primary" : "text-foreground"}`}
            >
              <IconComponent />
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                <rect
                  x="0"
                  y="0"
                  width="20"
                  height={`${(progressPercentage / 100) * 200}`}
                />
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

          {/* Responsive step icons */}
          {[
            {
              steps: mobileSteps,
              containerClass: "w-8 h-8",
              displayClass: "block md:hidden",
            },
            {
              steps: desktopSteps,
              containerClass: "w-10 h-10",
              displayClass: "hidden md:block",
            },
          ].map(({ steps, containerClass, displayClass }, index) => (
            <div
              key={index}
              className={`${displayClass} flex flex-col items-center space-y-6 sm:space-y-8 md:space-y-10`}
            >
              {steps.map((step) => renderStepIcon(step, containerClass))}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
