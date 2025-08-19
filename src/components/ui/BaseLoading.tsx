import React, { useState, useEffect } from "react";
import { TravelIcon3D, Icon3DProps } from "./Icon3D";

export interface LoadingStage {
  icon: React.ComponentType<Omit<Icon3DProps, "src" | "alt">>;
  message: string;
  detail: string;
}

export interface BaseLoadingProps {
  isVisible: boolean;
  stages: LoadingStage[];
  title: string;
  subtitle?: string;
  maxProgress?: number;
  stageInterval?: number;
  progressInterval?: number;
  progressIncrement?: () => number;
  showStageIndicators?: boolean;
  simpleStageIndicators?: boolean;
  showProgressDots?: boolean;
  showOrbitingIcon?: boolean;
  centralIcon?: React.ComponentType<Omit<Icon3DProps, "src" | "alt">>;
  children?: React.ReactNode;
  className?: string;
  footerMessage?: React.ReactNode;
  progressLabel?: string;
  ariaLabel?: string;
}

export function BaseLoading({
  isVisible,
  stages,
  title,
  subtitle,
  maxProgress = 90,
  stageInterval = 3000,
  progressInterval = 1000,
  progressIncrement = () => Math.random() * 8,
  showStageIndicators = true,
  simpleStageIndicators = false,
  showProgressDots = false,
  // showOrbitingIcon = true, // Removed unused parameter
  centralIcon: CentralIcon = TravelIcon3D,
  children,
  className = "",
  footerMessage,
  progressLabel = "Progress",
  ariaLabel,
}: BaseLoadingProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStageIndex(0);
      setProgress(0);
      return;
    }

    // Cycle through stages
    const stageTimer = setInterval(() => {
      setCurrentStageIndex((prev) => (prev + 1) % stages.length);
    }, stageInterval);

    // Gradual progress increase
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= maxProgress) return prev;
        return prev + progressIncrement();
      });
    }, progressInterval);

    return () => {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
    };
  }, [isVisible, stages.length, stageInterval, progressInterval, maxProgress, progressIncrement]);

  if (!isVisible) return null;

  const currentStage = stages[currentStageIndex];

  return (
    <div className={`flex items-center justify-center min-h-[calc(100vh-80px)] relative overflow-hidden ${className}`}>
      {children}

      <div className="relative z-10 max-w-3xl w-full">
        <div className="transform -rotate-1 hover:rotate-0 transition-transform duration-700">
          <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-border/40 rounded-3xl p-8 lg:p-12 shadow-adventure-float relative overflow-hidden text-center">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 rounded-3xl blur-xl opacity-50 -z-10 animate-adventure-float"></div>

            {/* Central Animation */}
            <div className="relative mb-10">
              <div className="relative flex justify-center items-center h-32">
                {/* Central Icon */}
                <CentralIcon size="md" animation="spin" />

                {/* Orbiting Stage Icon */}
                {/* {showOrbitingIcon && (
                  <div className="absolute animate-spin-slow">
                    <div
                      className="w-28 h-28 flex items-center justify-center"
                      style={{
                        transform: `rotate(${currentStageIndex * 51.4}deg)`,
                      }}
                    >
                      <div
                        className="transform p-4 bg-gradient-to-br from-accent/30 to-secondary/30 rounded-full animate-bounce-subtle border border-accent/50 shadow-glow"
                        style={{
                          transform: `rotate(-${currentStageIndex * 51.4}deg)`,
                        }}
                      >
                        <IconComponent className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            </div>

            {/* Title and Stage Info */}
            <div className="mb-10">
              <h2 className="text-3d-gradient mb-6 leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-foreground-secondary mb-4">
                  {subtitle}
                </p>
              )}

              <div key={currentStageIndex} className="animate-fade-in-fast">
                <p className="text-lg font-semibold text-foreground-secondary mb-3">
                  {currentStage.message}
                </p>
                <p className="text-sm text-foreground-secondary leading-relaxed">
                  {currentStage.detail}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base font-medium text-foreground-secondary">
                  {progressLabel}
                </span>
                <span className="text-lg font-bold text-primary">
                  {Math.min(Math.round(progress), maxProgress)}%
                </span>
              </div>
              <div className="w-full bg-border/50 rounded-full h-4 overflow-hidden border border-border/30">
                <div
                  className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-1000 ease-out rounded-full relative shadow-glow"
                  style={{ width: `${Math.min(progress, maxProgress)}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-shimmer rounded-full"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-slide-right rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Progress Dots */}
            {showProgressDots && (
              <div className="flex justify-center items-center space-x-3 mb-6">
                <div
                  className="w-4 h-4 bg-gradient-to-r from-primary to-primary rounded-full animate-bounce shadow-lg"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-4 h-4 bg-gradient-to-r from-accent to-accent rounded-full animate-bounce shadow-lg"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-4 h-4 bg-gradient-to-r from-secondary to-secondary rounded-full animate-bounce shadow-lg"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            )}

            {/* Stage Indicators */}
            {showStageIndicators && (
              <div className="flex justify-center space-x-3 mb-8">
                {simpleStageIndicators ? (
                  // Simple dot indicators
                  stages.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentStageIndex
                          ? "bg-primary scale-125 shadow-glow"
                          : index < currentStageIndex
                            ? "bg-success"
                            : "bg-border"
                        }`}
                    />
                  ))
                ) : (
                  // Icon-based indicators
                  stages.map((stage, index) => {
                    const StageIcon = stage.icon;
                    return (
                      <div
                        key={index}
                        className={`relative transition-all duration-500 ${index === currentStageIndex
                            ? "scale-125 transform"
                            : index < currentStageIndex
                              ? "scale-100"
                              : "scale-75 opacity-50"
                          }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${index === currentStageIndex
                              ? "bg-primary/30 border-primary shadow-glow animate-pulse-slow"
                              : index < currentStageIndex
                                ? "bg-accent/30 border-accent"
                                : "bg-border/30 border-border"
                            }`}
                        >
                          <StageIcon
                            size="xs"
                            animation="none"
                            className={index === currentStageIndex
                                ? "text-primary"
                                : index < currentStageIndex
                                  ? "text-accent"
                                  : "text-foreground-muted"
                              }
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Footer Message */}
            {footerMessage && (
              <div className="glass backdrop-blur-sm border border-border/30 rounded-2xl p-6">
                <p className="text-base text-foreground-secondary leading-relaxed">
                  {footerMessage}
                </p>
              </div>
            )}

            {/* Accessibility */}
            <div
              role="status"
              aria-live="polite"
              aria-label={ariaLabel || "Loading"}
              className="sr-only"
            >
              {currentStage.message} - {Math.round(progress)}% complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}