import type { JSX } from 'react'

interface WizardStepperProps {
  currentStep: number
  steps: string[]
}

export function WizardStepper({ currentStep, steps }: WizardStepperProps): JSX.Element {
  return (
    <ol className="wizard-stepper" aria-label="Wizard steps">
      {steps.map((stepLabel, index) => {
        const stepNumber = index + 1
        const state = stepNumber < currentStep ? 'done' : stepNumber === currentStep ? 'active' : 'todo'

        return (
          <li key={stepLabel} data-state={state} aria-current={state === 'active' ? 'step' : undefined}>
            <span className="index">{stepNumber}</span>
            <span>
              {stepLabel}
              <span className="sr-only">
                {' '}
                ({state === 'done' ? 'completed' : state === 'active' ? 'current step' : 'upcoming'})
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
