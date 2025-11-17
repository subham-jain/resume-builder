'use client';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps?: number[];
  onStepClick?: (stepIndex: number) => void;
  clickable?: boolean;
}

export default function Stepper({ steps, currentStep, completedSteps = [], onStepClick, clickable = false }: StepperProps) {
  const handleStepClick = (index: number) => {
    if (clickable && onStepClick && (completedSteps.includes(index) || index < currentStep || index === currentStep)) {
      onStepClick(index);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const isClickable = clickable && (isCompleted || isCurrent);

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  onClick={() => handleStepClick(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-100 border-blue-600 text-blue-600 ring-4 ring-blue-100'
                      : 'bg-white border-gray-300 text-gray-400'
                  } ${
                    isClickable ? 'cursor-pointer hover:scale-110 hover:shadow-lg' : 'cursor-default'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

