import React, { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

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
              className="question-textarea"
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
                    setTimeout(() => onComplete(), 100);
                  }}
                  className="question-option-btn group"
                  disabled={isCompleted && !isEditing}
                >
                  <div className="relative z-10 flex items-center justify-center">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                      {label}
                    </span>
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
              className="question-input"
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
      <div onClick={onEdit} className="group question-card-completed">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <h6 className="text-3d-title group-hover:text-secondary transition-colors duration-300">
                {question.question}
              </h6>
            </div>
            <p className="badge-secondary px-3 py-2 group-hover:scale-105 transition-transform duration-300">
              {localLabel || localValue}
            </p>
          </div>
          <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 gradient-secondary rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✏️</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-card-active">

      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          {/* Question Header */}
          <div className="mb-4 -ml-4 lg:-ml-8">
            <div className="flex items-center">
              <span className="text-2xl mr-3 rotate-subtle">🤔</span>
              <h4 className="text-3d-title max-w-2xl">
                {question.question}
              </h4>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="ml-4 lg:ml-8 mr-2 mb-4">{renderInput()}</div>

        {isActive && question.type !== "select" && (
          <div className="mt-8 ml-4 lg:ml-8 mr-4 space-x-4">
            <button
              type="submit"
              disabled={!localValue.trim()}
              className="question-submit-btn group"
            >
              <span className="flex items-center">
                <span className="mr-2">Continue</span>
                <div className="p-2 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center transform group-hover:translate-x-1 transition-transform duration-300">
                  <span className="text-white text-sm">→</span>
                </div>
              </span>
            </button>
            <button
              type="submit"
              className="btn-3d-outline py-2.5 px-6 group"
            >
              <span className="flex items-center">
                <span>Nope</span>
              </span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
