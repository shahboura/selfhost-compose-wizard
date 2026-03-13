import type { JSX } from 'react'

export function PrivacyNotice(): JSX.Element {
  return (
    <p className="privacy-footnote">
      Privacy-first: generation runs entirely in your browser. No form values are sent to a server.
    </p>
  )
}
