import React, { useState, useEffect, useRef } from "react";

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: "text" | "select" | "textarea";
  question: string;
  placeholder?: string;
  options?: (string | QuestionOption)[];
  required?: boolean;
}

interface QuestionStepProps {
  question: Question;
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  isCompleted: boolean;
  isEditing: boolean;
  onComplete: () => void;
  onEdit: () => void;
}

export function QuestionStep({
  question,
  value,
  onChange,
  isActive,
  isCompleted,
  isEditing,
  onComplete,
  onEdit,
}: QuestionStepProps) {
  const [localValue, setLocalValue] = useState(value);
  const [localLabel, setLocalLabel] = useState(
    question.options?.find((option) => option.value === value)?.label || "",
  );
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localValue.trim()) {
      onChange(localValue);
      onComplete();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case "textarea":
        return (
          <div className="relative">
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={question.placeholder}
              className="w-full px-6 py-4 min-h-[120px] bg-background/80 backdrop-blur-sm border-2 border-border/50 hover:border-border-secondary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl shadow-card focus:shadow-card-hover transition-all duration-300 resize-none"
              disabled={isCompleted && !isEditing}
            />
          </div>
        );

      case "select":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {question.options?.map((option, index) => {
              const isObject = typeof option === "object";
              const label = isObject ? option.label : option;
              const value = isObject ? option.value : option;
              const key = isObject ? option.label : option;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setLocalValue(value);
                    setLocalLabel(label);
                    onChange(value);
                    // Use a longer delay to ensure React state updates are processed
                    setTimeout(() => onComplete(), 100);
                  }}
                  className="group relative overflow-hidden bg-gradient-to-br from-background/80 to-background-card/70 backdrop-blur-sm border-2 border-border/50 hover:border-primary/50 rounded-xl shadow-card hover:shadow-travel-card transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 p-4 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCompleted && !isEditing}
                >
                  {/* Option Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

                  <div className="relative z-10 flex items-center">
                    <span className="font-medium text-foreground text-center group-hover:text-primary transition-colors duration-300">
                      {label}
                    </span>
                  </div>

                  {/* Selection Arrow */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">→</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );

      default:
        return (
          <div className="relative">
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={question.placeholder}
              className="w-full px-6 py-4 bg-background/80 backdrop-blur-sm border-2 border-border/50 hover:border-border-secondary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl shadow-card focus:shadow-card-hover transition-all duration-300"
              disabled={isCompleted && !isEditing}
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground-muted">
              <span className="text-sm">🎯</span>
            </div>
          </div>
        );
    }
  };

  if (isCompleted && !isEditing) {
    return (
      <div
        onClick={onEdit}
        className="group relative cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-accent/10 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

        <div className="bg-gradient-to-br from-background/90 to-background-card/80 backdrop-blur-sm border-2 border-border/50 group-hover:border-secondary/50 rounded-2xl shadow-card group-hover:shadow-travel-card transition-all duration-500 p-6 lg:p-8 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-3">
                <h6 className="font-semibold text-foreground group-hover:text-secondary transition-colors duration-300">
                  {question.question}
                </h6>
              </div>
              <p className="backdrop-blur-md bg-gradient-to-r from-secondary/20 to-secondary/10 text-foreground font-medium px-3 py-2 rounded-lg inline-block border border-white/20 shadow-md transition-transform duration-300 group-hover:scale-105">
                {localLabel}
              </p>
            </div>
            <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-8 h-8 bg-gradient-to-r from-secondary to-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✏️</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Adventure Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/30 rounded-3xl blur-2xl opacity-50 animate-glow-pulse -z-10"></div>

      {/* Asymmetrical Adventure Card */}
      <div className="bg-gradient-to-br from-background/95 to-background-card/90 backdrop-blur-xl border-2 border-primary/30 rounded-3xl shadow-adventure-float relative overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform duration-500">
        <div className="p-8 lg:pl-16 lg:pr-8 lg:pt-12 lg:pb-8">
          {/* Adventure Pattern - positioned asymmetrically */}
          <div className="absolute top-4 right-4 text-xl opacity-20 animate-spin-slow">
            🗺️
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              {/* Asymmetrical question header */}
              <div className="mb-4 -ml-4 lg:-ml-8">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🤔</span>
                  <h4 className="font-display font-bold text-foreground max-w-2xl">
                    {question.question}
                  </h4>
                </div>
              </div>
            </div>

            {/* Input with offset */}
            <div className="ml-4 lg:ml-8 mr-2 mb-4">{renderInput()}</div>

            {isActive && question.type !== "select" && (
              <div className="mt-8 ml-4 lg:ml-8 mr-4">
                <button
                  type="submit"
                  disabled={!localValue.trim()}
                  className="group relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-8 rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-[1.05] hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
                >
                  <span className="relative z-10 flex items-center">
                    <span className="mr-2">Continue Adventure</span>
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300">
                      <span className="text-sm">→</span>
                    </div>
                  </span>

                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
