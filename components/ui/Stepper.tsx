'use client';

import React, { useState, Children, useRef, useLayoutEffect, HTMLAttributes, ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  onBeforeStepChange?: (currentStep: number, nextStep: number) => boolean;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  completeButtonText?: string;
  disableStepIndicators?: boolean;
  hideStepIndicators?: boolean;
  fullWidthContent?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (clicked: number) => void;
  }) => ReactNode;
  stepsLabels?: string[];
  isLoading?: boolean;
}

export function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  onBeforeStepChange,
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'חזור',
  nextButtonText = 'המשך',
  completeButtonText = 'סיום',
  disableStepIndicators = false,
  hideStepIndicators = false,
  fullWidthContent = false,
  renderStepIndicator,
  stepsLabels = [],
  isLoading = false,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [direction, setDirection] = useState<number>(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    // Check if we can proceed with the step change
    if (onBeforeStepChange && newStep > currentStep) {
      const canProceed = onBeforeStepChange(currentStep, newStep);
      if (!canProceed) return;
    }

    setCurrentStep(newStep);
    if (newStep > totalSteps) {
      onFinalStepCompleted();
    } else {
      onStepChange(newStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
      onStepChange(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      // Validate before moving forward
      if (onBeforeStepChange) {
        const canProceed = onBeforeStepChange(currentStep, currentStep + 1);
        if (!canProceed) return;
      }
      setDirection(1);
      setCurrentStep(currentStep + 1);
      onStepChange(currentStep + 1);
    }
  };

  const handleComplete = () => {
    // Validate before completing
    if (onBeforeStepChange) {
      const canProceed = onBeforeStepChange(currentStep, totalSteps + 1);
      if (!canProceed) return;
    }
    setDirection(1);
    setCurrentStep(totalSteps + 1);
    onFinalStepCompleted();
  };

  return (
    <div className="flex flex-col w-full" {...rest}>
      {/* Step Indicators */}
      {!hideStepIndicators && (
        <div className={`${stepCircleContainerClassName} bg-white rounded-2xl shadow-sm border border-gray-100 mb-6`}>
          <div className={`${stepContainerClassName} flex w-full items-center justify-between p-4 sm:p-6`}>
            {stepsArray.map((_, index) => {
              const stepNumber = index + 1;
              const isNotLastStep = index < totalSteps - 1;
              return (
                <React.Fragment key={stepNumber}>
                  {renderStepIndicator ? (
                    renderStepIndicator({
                      step: stepNumber,
                      currentStep,
                      onStepClick: clicked => {
                        setDirection(clicked > currentStep ? 1 : -1);
                        updateStep(clicked);
                      }
                    })
                  ) : (
                    <StepIndicator
                      step={stepNumber}
                      label={stepsLabels[index]}
                      disableStepIndicators={disableStepIndicators}
                      currentStep={currentStep}
                      onClickStep={clicked => {
                        setDirection(clicked > currentStep ? 1 : -1);
                        updateStep(clicked);
                      }}
                    />
                  )}
                  {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className={`${fullWidthContent ? '' : 'bg-white rounded-2xl shadow-sm border border-gray-100'} ${stepCircleContainerClassName}`}>
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={`p-4 sm:p-6 ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {/* Navigation Buttons */}
        {!isCompleted && (
          <div className={`px-4 sm:px-6 pb-4 sm:pb-6 ${footerClassName}`}>
            <div className={`mt-6 flex ${currentStep !== 1 ? 'justify-between' : 'justify-end'} gap-3`}>
              {currentStep !== 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-medium transition-all hover:border-gray-300 hover:bg-gray-50"
                  {...backButtonProps}
                >
                  {backButtonText}
                </button>
              )}
              <button
                onClick={isLastStep ? handleComplete : handleNext}
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                {...nextButtonProps}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    טוען...
                  </span>
                ) : (
                  isLastStep ? completeButtonText : nextButtonText
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className = ''
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(0);

  return (
    <motion.div
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
      className={className}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={h => setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface SlideTransitionProps {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}

function SlideTransition({ children, direction, onHeightReady }: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) {
      onHeightReady(containerRef.current.offsetHeight);
    }
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants: Variants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '-100%' : '100%',
    opacity: 0
  }),
  center: {
    x: '0%',
    opacity: 1
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '50%' : '-50%',
    opacity: 0
  })
};

interface StepProps {
  children: ReactNode;
  className?: string;
}

export function Step({ children, className = '' }: StepProps) {
  return <div className={className}>{children}</div>;
}

interface StepIndicatorProps {
  step: number;
  currentStep: number;
  onClickStep: (clicked: number) => void;
  disableStepIndicators?: boolean;
  label?: string;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators = false, label }: StepIndicatorProps) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) {
      onClickStep(step);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`relative flex flex-col items-center ${!disableStepIndicators ? 'cursor-pointer' : ''} outline-none focus:outline-none`}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
          active: { scale: 1, backgroundColor: '#ec4899', borderColor: '#ec4899' },
          complete: { scale: 1, backgroundColor: '#10b981', borderColor: '#10b981' }
        }}
        transition={{ duration: 0.3 }}
        className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border-2 font-semibold"
      >
        {status === 'complete' ? (
          <CheckIcon className="h-5 w-5 text-white" />
        ) : status === 'active' ? (
          <span className="text-white text-sm sm:text-base">{step}</span>
        ) : (
          <span className="text-gray-400 text-sm sm:text-base">{step}</span>
        )}
      </motion.div>
      {label && (
        <motion.span
          variants={{
            inactive: { color: '#9ca3af' },
            active: { color: '#ec4899' },
            complete: { color: '#10b981' }
          }}
          className="mt-2 text-xs sm:text-sm font-medium text-center hidden sm:block"
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );
}

interface StepConnectorProps {
  isComplete: boolean;
}

function StepConnector({ isComplete }: StepConnectorProps) {
  const lineVariants: Variants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: '#10b981' }
  };

  return (
    <div className="relative mx-2 sm:mx-4 h-0.5 flex-1 overflow-hidden rounded bg-gray-200">
      <motion.div
        className="absolute left-0 top-0 h-full"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

interface CheckIconProps extends React.SVGProps<SVGSVGElement> {}

function CheckIcon(props: CheckIconProps) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: 'tween',
          ease: 'easeOut',
          duration: 0.3
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

export default Stepper;
