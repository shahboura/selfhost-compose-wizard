import type { JSX } from 'react'
import type { ServiceDefinition } from '../types'

interface ServiceDetailsProps {
  service: ServiceDefinition
}

export function ServiceDetails({ service }: ServiceDetailsProps): JSX.Element {
  return (
    <section className="card service-details" aria-label="Selected service details">
      <h2>Selected service details</h2>
      <p className="muted">Review what this template includes before generating files.</p>
      <dl>
        <div>
          <dt>Name</dt>
          <dd>{service.name}</dd>
        </div>
        <div>
          <dt>Description</dt>
          <dd>{service.description}</dd>
        </div>
        <div>
          <dt>Template path</dt>
          <dd>
            <code>{service.templateFile}</code>
          </dd>
        </div>
        <div>
          <dt>Tags</dt>
          <dd>{service.tags.join(', ')}</dd>
        </div>
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
