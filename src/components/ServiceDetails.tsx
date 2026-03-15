import type { JSX } from 'react'
import type { ServiceDefinition } from '../types'

interface ServiceDetailsProps {
  service: ServiceDefinition
}

export function ServiceDetails({ service }: ServiceDetailsProps): JSX.Element {
  const docsReference = service.researchReferences[0]
  const visibleTags = service.tags.slice(0, 2)
  const hiddenTagCount = Math.max(0, service.tags.length - visibleTags.length)
  const warningCount = service.riskWarnings?.length ?? 0

  return (
    <section className="card service-summary" aria-label="Selected service summary">
      <div className="service-summary-head">
        <div>
          <p className="muted">Selected service</p>
          <h2>{service.name}</h2>
        </div>
        {docsReference ? (
          <a href={docsReference.url} target="_blank" rel="noreferrer" className="button service-doc-link">
            Docs
          </a>
        ) : null}
      </div>

      <div className="service-summary-meta">
        <span className="summary-chip">{service.category}</span>
        {visibleTags.map((tag) => (
          <span key={tag} className="summary-chip secondary">
            {tag}
          </span>
        ))}
        {hiddenTagCount > 0 ? <span className="summary-chip secondary">+{hiddenTagCount} tags</span> : null}
        {warningCount > 0 ? <span className="summary-chip warning">Warnings: {warningCount}</span> : null}
      </div>

      <details className="service-details-expand">
        <summary>Service details</summary>
        <p className="muted">{service.description}</p>

        {service.riskWarnings && service.riskWarnings.length > 0 ? (
          <div className="risk-panel" role="note" aria-label="Deployment risk warnings">
            <strong>Risk warnings</strong>
            <ul>
              {service.riskWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </details>
    </section>
  )
}
