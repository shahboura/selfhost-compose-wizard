import type { FieldDefinition, ResearchReference, ServiceCategory, ServiceDefinition } from '../types'

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

export function deriveAvailableCategories(
  services: ServiceDefinition[],
  allCategories: readonly ServiceCategory[],
): ServiceCategory[] {
  return allCategories.filter((category) => services.some((service) => service.category === category))
}

export function filterServices(
  services: ServiceDefinition[],
  searchText: string,
  activeCategory: 'all' | ServiceCategory,
): ServiceDefinition[] {
  const normalizedSearch = normalize(searchText)

  return services.filter((service) => {
    if (activeCategory !== 'all' && service.category !== activeCategory) {
      return false
    }

    if (normalizedSearch.length === 0) {
      return true
    }

    const haystack = `${service.name} ${service.description} ${service.tags.join(' ')}`.toLowerCase()
    return haystack.includes(normalizedSearch)
  })
}

export function groupServicesByCategory(
  services: ServiceDefinition[],
  categories: readonly ServiceCategory[],
): Record<ServiceCategory, ServiceDefinition[]> {
  const grouped = categories.reduce<Record<ServiceCategory, ServiceDefinition[]>>((accumulator, category) => {
    accumulator[category] = []
    return accumulator
  }, {} as Record<ServiceCategory, ServiceDefinition[]>)

  for (const service of services) {
    grouped[service.category].push(service)
  }

  return grouped
}

export function dedupeReferencesByUrl(references: ResearchReference[]): ResearchReference[] {
  const uniqueByUrl = new Map<string, ResearchReference>()
  for (const reference of references) {
    if (!uniqueByUrl.has(reference.url)) {
      uniqueByUrl.set(reference.url, reference)
    }
  }

  return [...uniqueByUrl.values()]
}

export function sortAndFilterFields(fields: FieldDefinition[], searchText: string): FieldDefinition[] {
  const normalizedSearch = normalize(searchText)

  const sorted = [...fields].sort((left, right) => {
    if (left.required !== right.required) {
      return left.required ? -1 : 1
    }
    return left.key.localeCompare(right.key)
  })

  if (normalizedSearch.length === 0) {
    return sorted
  }

  return sorted.filter((field) => {
    const haystack = `${field.key} ${field.label} ${field.description}`.toLowerCase()
    return haystack.includes(normalizedSearch)
  })
}
