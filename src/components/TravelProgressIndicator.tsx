"use client";

import { motion } from "framer-motion";
import { User, MapPin, Calendar, MapIcon } from "lucide-react";

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
  // Define the travel journey steps with travel-themed icons
  const steps: ProgressStep[] = [
    {
      id: "traveler-type",
      label: "",
      icon: User,
      active: currentStep === "traveler-type",
      completed: [
        "destination-knowledge",
        "destination-input",
        "pick-destination",
        "destination-recommendations",
        "planning",
        "plan",
      ].includes(currentStep),
    },
    {
      id: "destination",
      label: "",
      icon: MapPin,
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
      icon: Calendar,
      active: currentStep === "planning",
      completed: currentStep === "plan",
    },
    {
      id: "plan",
      label: "",
      icon: MapIcon,
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
        <div className="relative flex flex-col items-center space-y-4">
          {/* Animated Squiggly Progress Trail */}
          <svg 
            className="text-primary/20 absolute left-1/2 top-0 bottom-0 -translate-x-1/2 z-0" 
            width="20" 
            height="100%" 
            viewBox="0 0 20 200"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
                <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {/* Background squiggly track */}
            <path 
              d="M10,0 Q15,25 10,50 Q5,75 10,100 Q15,125 10,150 Q5,175 10,200" 
              stroke="url(#trackGradient)" 
              strokeWidth="2" 
              fill="none"
            />
            {/* Animated progress squiggly line */}
            <motion.path 
              d="M10,0 Q15,25 10,50 Q5,75 10,100 Q15,125 10,150 Q5,175 10,200" 
              stroke="url(#progressGradient)" 
              strokeWidth="2" 
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progressPercentage / 100 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 4px hsl(var(--primary) / 0.5))" }}
            />
          </svg>

          {steps.map((step) => {
            const IconComponent = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-20">
                {/* Step Icon Container */}
                <motion.div
                  className="relative group z-20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Glowing Background for Active Step */}
                  {step.active && (
                    <motion.div
                      className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-lg z-10"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  {/* Step Circle */}
                  <motion.div
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border shadow-card z-30 ${
                      step.active
                        ? "bg-gradient-to-br from-primary to-primary border-primary/50 shadow-card-hover scale-110"
                        : step.completed
                          ? "bg-primary border-primary/30"
                          : "bg-white border-border/60"
                    }`}
                    layout
                  >
                    {/* Completion Checkmark */}
                    {step.completed && (
                      <motion.svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.5,
                          type: "spring",
                          bounce: 0.6,
                        }}
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </motion.svg>
                    )}

                    {/* Travel Icon */}
                    {!step.completed && (
                      <IconComponent
                        className={`w-4 h-4 transition-all duration-300 ${
                          step.active
                            ? "text-white"
                            : "text-foreground-muted group-hover:text-primary"
                        }`}
                      />
                    )}

                    {/* Active Step Pulse Animation */}
                    {step.active && (
                      <motion.div
                        className="absolute -inset-1 rounded-full border-2 border-primary/70"
                        animate={{
                          scale: [1, 1.6, 1],
                          opacity: [1, 0, 1],
                        }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </motion.div>
                </motion.div>
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
        {/* Animated Progress Trail */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-border/30 to-border/60 -translate-y-1/2 z-0">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/60 via-primary to-accent/80 shadow-glow"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {steps.map((step) => {
          const IconComponent = step.icon;

          return (
            <div key={step.id} className="flex items-center relative z-10">
              {/* Step Icon Container */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {/* Glowing Background for Active Step */}
                {step.active && (
                  <motion.div
                    className="absolute -inset-3 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Step Circle */}
                <motion.div
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    step.active
                      ? "bg-gradient-to-br from-primary to-primary shadow-card-hover scale-110"
                      : step.completed
                        ? "bg-gradient-to-br from-primary/30 to-primary/30 shadow-card"
                        : "bg-gradient-to-br from-background-soft to-background border-2 border-border/60 shadow-card"
                  }`}
                  layout
                >
                  {/* Completion Checkmark */}
                  {step.completed && (
                    <motion.svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                        bounce: 0.6,
                      }}
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </motion.svg>
                  )}

                  {/* Travel Icon */}
                  {!step.completed && (
                    <IconComponent
                      className={`w-5 h-5 transition-all duration-300 ${
                        step.active
                          ? "text-white"
                          : "text-foreground-muted group-hover:text-primary"
                      }`}
                    />
                  )}

                  {/* Active Step Pulse Animation */}
                  {step.active && (
                    <motion.div
                      className="absolute -inset-1 rounded-full border-2 border-primary/70"
                      animate={{
                        scale: [1, 1.6, 1],
                        opacity: [1, 0, 1],
                      }}
                      transition={{
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>

                {/* Step Label with Enhanced Typography */}
                <motion.div
                  className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: steps.indexOf(step) * 0.1 }}
                >
                  <span
                    className={`text-xs font-medium transition-all duration-300 ${
                      step.active
                        ? "text-primary font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                        : step.completed
                          ? "text-primary/30 font-medium"
                          : "text-foreground-muted group-hover:text-foreground-secondary"
                    }`}
                  >
                    {step.label}
                  </span>
                </motion.div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Mobile & Tablet Version - Compact Journey Indicator */}
      <div className="flex lg:hidden items-center space-x-4">
        {/* Current Step Info */}
        <motion.div
          className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-card border border-border/50"
          layout
        >
          {/* Current Step Icon */}
          <div className="relative">
            {steps.map((step) => {
              if (!step.active) return null;
              const IconComponent = step.icon;

              return (
                <motion.div
                  key={step.id}
                  className="w-8 h-8 bg-gradient-to-br from-primary to-primary rounded-full flex items-center justify-center shadow-card"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5, type: "spring", bounce: 0.6 }}
                >
                  <IconComponent className="w-4 h-4 text-white" />
                </motion.div>
              );
            })}
          </div>

          {/* Step Progress Text */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground-muted">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {steps.find((step) => step.active)?.label || ""}
            </span>
          </div>
        </motion.div>

        {/* Mini Progress Bar */}
        <div className="flex-1 max-w-20 h-2 bg-gradient-to-r from-border/30 to-border/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary/60 via-primary to-accent/80 shadow-glow"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
