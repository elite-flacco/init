import React, { useState, useEffect, useRef } from 'react';

export interface QuestionOption {
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: 'text' | 'select' | 'textarea';
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
  onEdit
}: QuestionStepProps) {
  const [localValue, setLocalValue] = useState(value);
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={question.placeholder}
            className="form-textarea"
            disabled={isCompleted && !isEditing}
          />
        );

      case 'select':
        return (
          <div className="flex flex-col space-y-4">
            {question.options?.map((option) => {
              const isObject = typeof option === 'object';
              const label = isObject ? option.label : option;
              const value = isObject ? option.value : option;
              const key = isObject ? option.label : option;
              
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setLocalValue(value);
                    onChange(value);
                    // Use a longer delay to ensure React state updates are processed
                    setTimeout(() => onComplete(), 100);
                  }}
                  className="btn-primary"
                  disabled={isCompleted && !isEditing}
                >
                  {label}
                </button>
              );
            })}
          </div>
        );

      default:
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={question.placeholder}
            className="form-textarea"
            disabled={isCompleted && !isEditing}
          />
        );
    }
  };

  if (isCompleted && !isEditing) {
    return (
      <div
        onClick={onEdit}
        className="card-minimal"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h5 className="mb-2">
              {question.question}
            </h5>
            <p className="text-foreground-secondary">{value}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-card-active">
      <form onSubmit={handleSubmit}>
        <h4 className="mb-6">
          {question.question}
        </h4>

        {renderInput()}

        {isActive && question.type !== 'select' && (
          <div className="mt-6 flex items-center justify-between">
            <button
              type="submit"
              disabled={!localValue.trim()}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Continue
            </button>
          </div>
        )}
      </form>
    </div>
  );
}