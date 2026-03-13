import type { JSX } from 'react'

interface TopNavProps {
  selectedServiceName: string
  selectedTemplatePath: string
  selectedServiceId: string
  onHome: () => void
}

export function TopNav({ selectedServiceName, selectedTemplatePath, selectedServiceId, onHome }: TopNavProps): JSX.Element {
  const normalizedSelectedServiceId =
    typeof selectedServiceId === 'string' ? selectedServiceId : String(selectedServiceId ?? '')
  const hasSelectedService = normalizedSelectedServiceId.trim().length > 0

  return (
    <header className="top-nav" role="banner">
      <button type="button" className="brand-home" onClick={onHome}>
        <div>
          <p className="eyebrow">Self-hosting onboarding wizard</p>
          <h1>Docker Compose Generator</h1>
        </div>
      </button>

      <div className="selection-meta">
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
