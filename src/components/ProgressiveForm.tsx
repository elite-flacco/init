import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionStep, Question } from "./QuestionStep";

interface ProgressiveFormProps {
  questions: Question[];
  onComplete: (answers: Record<string, string>) => void;
  title?: string;
  subtitle?: string;
}

export function ProgressiveForm({
  questions,
  onComplete,
  title,
  subtitle,
}: ProgressiveFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize answers
  useEffect(() => {
    const initialAnswers: Record<string, string> = {};
    questions.forEach((q) => {
      initialAnswers[q.id] = "";
    });
    setAnswers(initialAnswers);
  }, [questions]);

  // Helper functions defined before useEffect that uses them
  const isStepCompleted = useCallback(
    (stepIndex: number) => {
      const question = questions[stepIndex];
      return answers[question.id]?.trim() !== "";
    },
    [questions, answers],
  );

  const isStepActive = useCallback(
    (stepIndex: number) => {
      return currentStep === stepIndex;
    },
    [currentStep],
  );

  // Auto-scroll to current step - happens before animation starts
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentStepElement = stepRefs.current[currentStep];
      if (currentStepElement && editingStep === null) {
        // Scroll to the current question immediately, before animation
        currentStepElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    }, 50); // Quick delay for DOM updates

    return () => clearTimeout(timer);
  }, [currentStep, editingStep]);

  // Removed buggy auto-editing scroll behavior - users can simply click to edit

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleStepComplete = () => {
    if (editingStep !== null) {
      setEditingStep(null);
      // After editing, advance to the next unanswered question
      const nextUnansweredStep = findNextUnansweredStep(editingStep);
      if (nextUnansweredStep !== -1) {
        setCurrentStep(nextUnansweredStep);
        // Scroll to new question immediately after editing
        setTimeout(() => {
          const nextStepElement = stepRefs.current[nextUnansweredStep];
          if (nextStepElement) {
            nextStepElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          }
        }, 50);
      } else {
        // All questions are answered, show smooth transition
        setIsTransitioning(true);
        setTimeout(() => onComplete(answers), 2000);
      }
      return;
    }

    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      // Scroll to new question immediately, before animation starts
      setTimeout(() => {
        const nextStepElement = stepRefs.current[nextStep];
        if (nextStepElement) {
          nextStepElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
        }
      }, 100); // Immediate scroll, just after DOM updates
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

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Asymmetrical Adventure Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-16 py-12"
          >
            {title && (
              <div className="text-center">
                <h1 className="text-3d-gradient mb-6 leading-tight max-w-4xl">
                  {title}
                </h1>
              </div>
            )}
            {subtitle && (
              <div className="text-center ml-8 md:ml-16 lg:ml-32 max-w-2xl">
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
                    transition: {
                      duration: 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    },
                  }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: index * 0.15,
                  }}
                  className="flex justify-center items-center py-2"
                  ref={(el) => (stepRefs.current[index] = el)}
                >
                  {/* Asymmetrical question layout */}
                  <motion.div
                    className={`w-full max-w-3xl transition-all duration-150 cursor-pointer ${index % 2 === 0 ? "ml-8 lg:ml-16" : "mr-8 lg:mr-16"
                      }`}
                    whileHover={
                      !isCurrentlyEditing
                        ? {
                          scale: 1.03,
                          transition: {
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          },
                        }
                        : {}
                    }
                    animate={
                      isCurrentlyEditing
                        ? {
                          scale: 1.05,
                          transition: {
                            duration: 0.5,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          },
                        }
                        : {
                          scale: 1,
                          transition: {
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          },
                        }
                    }
                    onClick={() => !isCurrentlyEditing && handleStepEdit(index)}
                  >
                    {isCurrentlyEditing ? (
                      <QuestionStep
                        question={question}
                        value={answers[question.id] || ""}
                        onChange={(value) =>
                          handleAnswerChange(question.id, value)
                        }
                        isActive={true}
                        isCompleted={isStepCompleted(index)}
                        isEditing={true}
                        onComplete={handleStepComplete}
                        onEdit={() => handleStepEdit(index)}
                      />
                    ) : (
                      <QuestionStep
                        question={question}
                        value={answers[question.id] || ""}
                        onChange={(value) =>
                          handleAnswerChange(question.id, value)
                        }
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
            {currentStep < questions.length &&
              editingStep === null &&
              !isTransitioning && (
                <div className="min-h-screen relative px-4">
                  <div 
                    className="absolute left-1/2 w-full max-w-3xl" 
                    style={{ 
                      top: '55%',
                      transform: 'translate(-50%, -50%)' 
                    }}
                  >
                    <motion.div
                      key={`current-${questions[currentStep].id}`}
                      initial={{ opacity: 0, y: 400, scale: 0.8, rotateX: 15 }}
                      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                      exit={{ opacity: 0, y: -100, scale: 0.98, rotateX: -10 }}
                      transition={{
                        duration: 0.8,
                        ease: [0.25, 0.46, 0.45, 0.94],
                        opacity: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
                        scale: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
                        y: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
                      }}
                      ref={(el) => (stepRefs.current[currentStep] = el)}
                    >
                      <motion.div
                        initial={{
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                        animate={{
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <QuestionStep
                          question={questions[currentStep]}
                          value={answers[questions[currentStep].id] || ""}
                          onChange={(value) =>
                            handleAnswerChange(questions[currentStep].id, value)
                          }
                          isActive={true}
                          isCompleted={isStepCompleted(currentStep)}
                          isEditing={false}
                          onComplete={handleStepComplete}
                          onEdit={() => handleStepEdit(currentStep)}
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
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
                <motion.h3
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.4,
                    duration: 0.6,
                  }}
                  className="text-3xl font-display font-bold text-foreground mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
                >
                  🎯 Got it! Looking for your perfect trip
                </motion.h3>
                {/* <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.6,
                    duration: 0.6,
                  }}
                  className="text-xl text-foreground-secondary font-medium"
                >
                  Finding destinations that match what you're looking for...
                </motion.p> */}
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Adventure Scroll Hint */}
        {currentStep > 0 && (
          <div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-gradient-to-r from-primary/90 to-secondary/90 backdrop-blur-md shadow-glow rounded-full px-6 py-3 text-sm text-white font-medium border border-white/20">
              <span className="mr-2">✏️</span>
              Scroll up to edit your answers
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
