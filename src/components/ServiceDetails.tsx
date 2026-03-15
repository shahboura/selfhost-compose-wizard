import type { JSX } from 'react'
import type { ServiceDefinition } from '../types'

interface ServiceDetailsProps {
  service: ServiceDefinition
}

export function ServiceDetails({ service }: ServiceDetailsProps): JSX.Element {
  const docsReference = service.researchReferences[0]
  const visibleTags = service.tags.filter((tag) => tag !== service.category)

  return (
    <section className="card service-summary" aria-label="Selected service summary">
      <div className="service-summary-head">
        <h2>{service.name}</h2>
        {docsReference ? (
          <a
            href={docsReference.url}
            target="_blank"
            rel="noreferrer"
            className="doc-tag optional"
          >
            Docs
          </a>
        ) : null}
      </div>

      <p className="muted service-summary-description">{service.description}</p>

      <div className="service-summary-meta">
        <span className="summary-chip category">{service.category}</span>
        {visibleTags.length > 0 ? (
          <div className="tags">
            {visibleTags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {service.riskWarnings && service.riskWarnings.length > 0 ? (
        <div className="risk-panel risk-compact" role="note" aria-label="Deployment risk warnings">
          <strong>Risk warnings</strong>
          <ul>
            {service.riskWarnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
