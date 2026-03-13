import type { JSX } from 'react'

export function PrivacyNotice(): JSX.Element {
  return (
    <section className="privacy-notice">
      <h2>Privacy-first by default</h2>
      <ul>
        <li>Generation runs entirely in your browser (client-side).</li>
        <li>No form values are posted to a backend API.</li>
        <li>No analytics or telemetry is included by this starter.</li>
        <li>Templates are bundled with the app; generation does not require server round-trips.</li>
      </ul>
    </section>
  )
}
