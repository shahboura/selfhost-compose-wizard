import { describe, expect, it } from 'vitest'
import {
  dedupeReferencesByUrl,
  deriveAvailableCategories,
  filterServices,
  groupServicesByCategory,
  sortAndFilterFields,
} from './service-utils'
import type { FieldDefinition, ResearchReference, ServiceDefinition } from '../types'

const sampleServices: ServiceDefinition[] = [
  {
    id: 'alpha',
    name: 'Alpha',
    templateFile: 'services/alpha/base.compose.yaml',
    templateKey: 'services/bentopdf/base.compose.yaml',
    category: 'utilities',
    description: 'Utility tool',
    tags: ['tooling'],
    fieldOverrides: {},
    extraTooling: [],
    researchReferences: [],
  },
  {
    id: 'beta',
    name: 'Beta',
    templateFile: 'services/beta/base.compose.yaml',
    templateKey: 'services/immich/base.compose.yaml',
    category: 'media',
    description: 'Media server',
    tags: ['photos'],
    fieldOverrides: {},
    extraTooling: [],
    researchReferences: [],
  },
]

describe('service-utils', () => {
  it('derives available categories based on catalog presence', () => {
    const categories = deriveAvailableCategories(sampleServices, ['media', 'observability', 'utilities'])
    expect(categories).toEqual(['media', 'utilities'])
  })

  it('filters services by search and category', () => {
    expect(filterServices(sampleServices, 'media', 'all').map((service) => service.id)).toEqual(['beta'])
    expect(filterServices(sampleServices, '', 'utilities').map((service) => service.id)).toEqual(['alpha'])
  })

  it('groups services by category', () => {
    const grouped = groupServicesByCategory(sampleServices, ['media', 'utilities'])
    expect(grouped.media).toHaveLength(1)
    expect(grouped.utilities).toHaveLength(1)
  })

  it('deduplicates references by URL', () => {
    const references: ResearchReference[] = [
      { title: 'One', url: 'https://example.com/a' },
      { title: 'Two', url: 'https://example.com/a' },
      { title: 'Three', url: 'https://example.com/b' },
    ]

    expect(dedupeReferencesByUrl(references)).toEqual([
      { title: 'One', url: 'https://example.com/a' },
      { title: 'Three', url: 'https://example.com/b' },
    ])
  })

  it('sorts fields required-first and filters by search', () => {
    const fields: FieldDefinition[] = [
      {
        key: 'B_FIELD',
        label: 'B Field',
        description: 'optional',
        required: false,
        sensitive: false,
      },
      {
        key: 'A_FIELD',
        label: 'A Field',
        description: 'required',
        required: true,
        sensitive: false,
      },
    ]

    expect(sortAndFilterFields(fields, '').map((field) => field.key)).toEqual(['A_FIELD', 'B_FIELD'])
    expect(sortAndFilterFields(fields, 'optional').map((field) => field.key)).toEqual(['B_FIELD'])
  })
})
