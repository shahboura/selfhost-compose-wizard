import type { JSX } from 'react'
import type { ServiceDefinition } from '../types'

interface ServiceDetailsProps {
  service: ServiceDefinition
}

export function ServiceDetails({ service }: ServiceDetailsProps): JSX.Element {
  const docsReference = service.researchReferences[0]

  return (
    <section className="card service-details" aria-label="Selected service details">
      <h2>Selected service</h2>
      <p className="muted">{service.description}</p>
      <dl>
        <div>
          <dt>Category</dt>
          <dd>{service.category}</dd>
        </div>
        <div>
          <dt>Tags</dt>
          <dd>{service.tags.join(', ')}</dd>
        </div>
        {docsReference ? (
          <div>
            <dt>Docs</dt>
            <dd>
              <a href={docsReference.url} target="_blank" rel="noreferrer">
                {docsReference.title}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>

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
    </section>
  )
}
