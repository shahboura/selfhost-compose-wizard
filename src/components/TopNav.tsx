import type { JSX } from 'react'

interface TopNavProps {
  selectedServiceName: string
  selectedTemplatePath: string
  selectedServiceId: string
  onHome: () => void
}

export function TopNav({ selectedServiceName, selectedTemplatePath, selectedServiceId, onHome }: TopNavProps): JSX.Element {
  const hasSelectedService = selectedServiceId.trim().length > 0

  return (
    <header className="top-nav" role="banner">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          ⚙
        </span>
        <div>
          <p className="eyebrow">Self-hosting onboarding wizard</p>
          <h1>Docker Compose Generator</h1>
        </div>
      </div>

      <div className="selection-meta">
        <button type="button" className="button" onClick={onHome}>
          Home
        </button>
        <p>
          <strong>Service:</strong> {hasSelectedService ? selectedServiceName : 'Not selected'}
        </p>
        {hasSelectedService ? (
          <p>
            <strong>Template:</strong> <code>{selectedTemplatePath}</code>
          </p>
        ) : null}
      </div>
    </header>
  )
}
