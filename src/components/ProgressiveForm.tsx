import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionStep, Question } from './QuestionStep';

interface ProgressiveFormProps {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
  title?: string;
  subtitle?: string;
}

export function ProgressiveForm({ questions, onComplete, title, subtitle }: ProgressiveFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize answers
  useEffect(() => {
    const initialAnswers: Record<string, string> = {};
    questions.forEach(q => {
      initialAnswers[q.id] = '';
    });
    setAnswers(initialAnswers);
  }, [questions]);

  // Helper functions defined before useEffect that uses them
  const isStepCompleted = useCallback((stepIndex: number) => {
    const question = questions[stepIndex];
    return answers[question.id]?.trim() !== '';
  }, [questions, answers]);

  const isStepActive = useCallback((stepIndex: number) => {
    return currentStep === stepIndex;
  }, [currentStep]);

  // Auto-scroll to current step with improved timing
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentStepElement = stepRefs.current[currentStep];
      if (currentStepElement) {
        // Scroll to the current question with smooth behavior
        currentStepElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 300); // Delay to allow animations to settle

    return () => clearTimeout(timer);
  }, [currentStep, editingStep]);

  // Make questions automatically editable when they come into view
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      // Debounce scroll events for better performance
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        stepRefs.current.forEach((element, index) => {
          if (element && isStepCompleted(index) && !isStepActive(index) && editingStep === null) {
            const rect = element.getBoundingClientRect();
            // More generous detection - if any part is in the viewport center area
            const isInViewCenter = rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4;

            // If a completed question is in the center of view, auto-edit it
            if (isInViewCenter) {
              setEditingStep(index);
              // Don't change currentStep - keep it at the current progress
            }
          }
        });
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [editingStep, currentStep, isStepActive, isStepCompleted]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleStepComplete = () => {
    if (editingStep !== null) {
      setEditingStep(null);
      // After editing, advance to the next unanswered question
      const nextUnansweredStep = findNextUnansweredStep(editingStep);
      if (nextUnansweredStep !== -1) {
        setCurrentStep(nextUnansweredStep);
      } else {
        // All questions are answered, show smooth transition
        setIsTransitioning(true);
        setTimeout(() => onComplete(answers), 2000);
      }
      return;
    }

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All questions completed, show smooth transition
      setIsTransitioning(true);
      setTimeout(() => onComplete(answers), 2000);
    }
  };

  const findNextUnansweredStep = (fromStep: number): number => {
    for (let i = fromStep + 1; i < questions.length; i++) {
      if (!isStepCompleted(i)) {
        return i;
      }
    }
    return -1; // All questions after fromStep are completed
  };

  const handleStepEdit = (stepIndex: number) => {
    setEditingStep(stepIndex);
    // Don't change currentStep - keep it at the current progress
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Adventure Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-16 text-4xl opacity-10 animate-float">🧭</div>
        <div className="absolute top-40 right-20 text-3xl opacity-15 animate-pulse-slow" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-40 left-24 text-5xl opacity-10 animate-bounce-subtle" style={{ animationDelay: '2s' }}>🗺️</div>
        <div className="absolute bottom-32 right-32 text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>✈️</div>
        <div className="absolute top-60 left-1/3 text-2xl opacity-15 animate-spin-slow" style={{ animationDelay: '3s' }}>🌟</div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Asymmetrical Adventure Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-16 py-12"
          >
            {title && (
              <div className="ml-8 md:ml-16 lg:ml-24 mb-8">
                {/* Floating icon - positioned asymmetrically */}
                <div className="absolute -top-8 -right-4 md:-right-8 lg:-right-12">
                  <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-full shadow-glow animate-glow-pulse">
                    <span className="text-3xl">🚀</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight max-w-4xl">
                  {title}
                </h1>
              </div>
            )}
            {subtitle && (
              <div className="ml-8 md:ml-16 lg:ml-32 max-w-2xl">
                <p className="text-lg md:text-xl text-foreground-secondary leading-relaxed font-medium">
                  {subtitle}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Questions Container */}
        <div className="relative">
          {/* Completed Questions (each takes full viewport height for progressive display) */}
          <div className="space-y-0">
            {questions.slice(0, currentStep).map((question, index) => {
              if (!isStepCompleted(index)) return null;

              const isCurrentlyEditing = editingStep === index;

              return (
                <motion.div
                  key={`completed-${question.id}`}
                  initial={{ opacity: 0, y: 100, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileInView={{
                    opacity: [0.7, 1],
                    scale: [0.98, 1],
                    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
                  }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: index * 0.15 }}
                  className="flex justify-center"
                  ref={(el) => (stepRefs.current[index] = el)}
                >
                  {/* Asymmetrical question layout */}
                  <motion.div
                    className={`w-full max-w-3xl transition-all duration-150 cursor-pointer mb-8 ${
                      index % 2 === 0 ? 'ml-8 lg:ml-16' : 'mr-8 lg:mr-16'
                    }`}
                    whileHover={!isCurrentlyEditing ? {
                      scale: 1.03,
                      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                    } : {}}
                    animate={isCurrentlyEditing ? {
                      scale: 1.05,
                      transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
                    } : {
                      scale: 1,
                      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                    }}
                    onClick={() => !isCurrentlyEditing && handleStepEdit(index)}
                  >
                    {isCurrentlyEditing ? (
                      <QuestionStep
                        question={question}
                        value={answers[question.id] || ''}
                        onChange={(value) => handleAnswerChange(question.id, value)}
                        isActive={true}
                        isCompleted={isStepCompleted(index)}
                        isEditing={true}
                        onComplete={handleStepComplete}
                        onEdit={() => handleStepEdit(index)}
                      />
                    ) : (
                      <QuestionStep
                        question={question}
                        value={answers[question.id] || ''}
                        onChange={(value) => handleAnswerChange(question.id, value)}
                        isActive={false}
                        isCompleted={isStepCompleted(index)}
                        isEditing={false}
                        onComplete={handleStepComplete}
                        onEdit={() => handleStepEdit(index)}
                      />
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Current Question (full viewport height) */}
          <AnimatePresence mode="wait">
            {currentStep < questions.length && editingStep === null && !isTransitioning && (
              <motion.div
                key={`current-${questions[currentStep].id}`}
                initial={{ opacity: 0, y: 1200, scale: 0.8, rotateX: 15 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: -200, scale: 0.95, rotateX: -10 }}
                transition={{
                  duration: 1.2,
                  ease: [0.16, 1, 0.3, 1],
                  opacity: { duration: 0.8 },
                  scale: { duration: 1.0, ease: [0.2, 0, 0.2, 1] }
                }}
                className="min-h-screen flex items-center justify-center"
                ref={(el) => (stepRefs.current[currentStep] = el)}
              >
                <div className="w-full max-w-3xl">
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                    }}
                    initial={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                    animate={{
                      boxShadow: [
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                      ],
                      transition: {
                        duration: 4,
                        repeat: Infinity,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        times: [0, 0.5, 1]
                      }
                    }}
                  >
                    <QuestionStep
                      question={questions[currentStep]}
                      value={answers[questions[currentStep].id] || ''}
                      onChange={(value) => handleAnswerChange(questions[currentStep].id, value)}
                      isActive={true}
                      isCompleted={isStepCompleted(currentStep)}
                      isEditing={false}
                      onComplete={handleStepComplete}
                      onEdit={() => handleStepEdit(currentStep)}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Smooth Transition Animation */}
          {isTransitioning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.8,
              }}
              className="min-h-screen flex items-center justify-center"
            >
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.2, 
                  duration: 0.8,
                }}
                className="text-center"
              >
                {/* <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.1, 
                    duration: 0.6, 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 12,
                  }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-success/20 rounded-full mb-6 shadow-lg"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="text-2xl"
                  >
                    ✨
                  </motion.div>
                </motion.div> */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.1, 
                    duration: 0.6, 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 12,
                  }}
                  className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full mb-6 shadow-glow animate-glow-pulse"
                >
                  <span className="text-3xl">🎯</span>
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.4, 
                    duration: 0.6,
                  }}
                  className="text-3xl font-display font-bold text-foreground mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
                >
                  🚀 Adventure Course Plotted!
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.6, 
                    duration: 0.6,
                  }}
                  className="text-xl text-foreground-secondary font-medium"
                >
                  We're crafting your perfect destination matches...
                </motion.p>
              </motion.div>
            </motion.div>
          )}

        </div>

        {/* Adventure Scroll Hint */}
        {currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-md shadow-glow rounded-full px-6 py-3 text-sm text-white font-medium border border-white/20 animate-bounce-subtle">
              <span className="mr-2">🗺️</span>
              Scroll up to edit your adventure course
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}