import type { JSX } from 'react'

interface ServiceFiltersProps {
  search: string
  category: string
  categories: string[]
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
}

export function ServiceFilters({
  search,
  category,
  categories,
  onSearchChange,
  onCategoryChange,
}: ServiceFiltersProps): JSX.Element {
  return (
    <section className="card" aria-label="Service filters">
      <h2>Templates</h2>
      <div className="filters-grid">
        <label htmlFor="service-search" className="filter-control">
          Search
          <input
            id="service-search"
            type="text"
            value={search}
            placeholder="Find service..."
            onChange={(event) => onSearchChange(event.currentTarget.value)}
          />
        </label>

        <label htmlFor="service-category" className="filter-control">
          Category
          <select
            id="service-category"
            value={category}
            onChange={(event) => onCategoryChange(event.currentTarget.value)}
          >
            <option value="all">All categories</option>
            {categories.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}
