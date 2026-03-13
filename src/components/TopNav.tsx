import type { JSX } from 'react'

interface TopNavProps {
  onHome: () => void
}

export function TopNav({ onHome }: TopNavProps): JSX.Element {
  return (
    <header className="top-nav" role="banner">
      <button type="button" className="brand-home" onClick={onHome}>
        <div>
          <p className="eyebrow">Self-hosting onboarding wizard</p>
          <h1>Docker Compose Generator</h1>
        </div>
      </button>
    </header>
  )
}
