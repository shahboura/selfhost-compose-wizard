import type { JSX } from 'react'
import type { ServiceDefinition } from '../types'

interface ServiceCardProps {
  service: ServiceDefinition
  selected: boolean
  onSelect: () => void
}

export function ServiceCard({ service, selected, onSelect }: ServiceCardProps): JSX.Element {
  return (
    <button
      type="button"
      className="service-card"
      data-selected={selected}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <p className="service-category">Category: {service.category}</p>
      <div className="tags">
        {service.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <small>{service.templateFile}</small>
    </button>
  )
}
