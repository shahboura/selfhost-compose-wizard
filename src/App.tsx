import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { CodePanel } from './components/CodePanel'
import { CopyableCodeBlock } from './components/CopyableCodeBlock'
import { FieldEditor } from './components/FieldEditor'
import { ServiceDetails } from './components/ServiceDetails'
import { ServiceCard } from './components/ServiceCard'
import { TopNav } from './components/TopNav'
import { WizardStepper } from './components/WizardStepper'
import { SERVICE_CATALOG } from './data/service-catalog'
import { downloadTextFile } from './lib/download'
import { parseEnvContent } from './lib/env'
import { exportBundleAsZip } from './lib/export'
import { buildFieldDefinitions, generateOutputs, resolveWizardStateForService, type GenerationOutput } from './lib/generator'
import {
  dedupeReferencesByUrl,
  deriveAvailableCategories,
  filterServices,
  groupServicesByCategory,
  sortAndFilterFields,
} from './lib/service-utils'
import { extractComposeVariables } from './lib/template-parser'
import { TEMPLATE_CONTENT } from './templates/registry'
import { SERVICE_CATEGORIES, type ServiceCategory, type ServiceDefinition, type WizardFieldState } from './types'

type Step = 1 | 2 | 3

function App(): JSX.Element {
  const [step, setStep] = useState<Step>(1)
  const [selectedServiceId, setSelectedServiceId] = useState<string>('')
  const [searchText, setSearchText] = useState<string>('')
  const [fieldSearchText, setFieldSearchText] = useState<string>('')
  const [activeCategory, setActiveCategory] = useState<'all' | ServiceCategory>('all')
  const [importStatus, setImportStatus] = useState<string>('')
  const [wizardState, setWizardState] = useState<Record<string, WizardFieldState>>({})
  const selectedServiceIdRef = useRef<string>('')
  const envImportRequestIdRef = useRef<number>(0)

  useEffect(() => {
    selectedServiceIdRef.current = selectedServiceId
  }, [selectedServiceId])

  const selectedService = useMemo<ServiceDefinition | undefined>(
    () => SERVICE_CATALOG.find((service) => service.id === selectedServiceId),
    [selectedServiceId],
  )

  const templateContent = useMemo<string>(() => {
    if (!selectedService) {
      return ''
    }

    return TEMPLATE_CONTENT[selectedService.templateKey] ?? ''
  }, [selectedService])

  const templateError = useMemo<string>(() => {
    if (!selectedService) {
      return ''
    }

    if (templateContent.length === 0) {
      return `Template not found for key: ${selectedService.templateKey}`
    }

    return ''
  }, [selectedService, templateContent])

  const templateVariables = useMemo(
    () => extractComposeVariables(templateContent),
    [templateContent],
  )

  const fields = useMemo(
    () =>
      buildFieldDefinitions({
        templateVariables,
        fieldOverrides: selectedService?.fieldOverrides ?? {},
      }),
    [selectedService, templateVariables],
  )

  const output = useMemo<GenerationOutput | undefined>(() => {
    if (!selectedService) {
      return undefined
    }

    return generateOutputs({
      templateContent,
      fields,
      wizardState,
    })
  }, [fields, selectedService, templateContent, wizardState])

  const updateField = (key: string, patch: Partial<WizardFieldState>): void => {
    setWizardState((currentState) => {
      const previousValue = currentState[key] ?? {
        value: '',
        useDefault: true,
      }

      return {
        ...currentState,
        [key]: {
          ...previousValue,
          ...patch,
        },
      }
    })
  }

  const selectService = (serviceIdInput: string): void => {
    const normalizedServiceId = typeof serviceIdInput === 'string' ? serviceIdInput : ''
    const nextService = SERVICE_CATALOG.find((service) => service.id === normalizedServiceId)

    if (!nextService) {
      setImportStatus('Unable to select service. Please click a service card again.')
      setStep(1)
      return
    }

    setSelectedServiceId(nextService.id)
    setImportStatus('')
    setFieldSearchText('')
    const nextTemplate = TEMPLATE_CONTENT[nextService.templateKey] ?? ''
    if (nextTemplate.length === 0) {
      setStep(1)
      setImportStatus('Selected template could not be loaded. Please pick another service.')
      return
    }
    setWizardState(resolveWizardStateForService(nextTemplate, nextService.fieldOverrides))
    setStep(2)
  }

  const goHome = (): void => {
    setStep(1)
    setSelectedServiceId('')
    setSearchText('')
    setFieldSearchText('')
    setActiveCategory('all')
    setImportStatus('')
    setWizardState({})
  }

  const categories = useMemo<ServiceCategory[]>(
    () => deriveAvailableCategories(SERVICE_CATALOG, SERVICE_CATEGORIES),
    [],
  )

  function isServiceCategory(value: string): value is ServiceCategory {
    return categories.includes(value as ServiceCategory)
  }

  const handleCategoryChange = (value: string): void => {
    if (value === 'all') {
      setActiveCategory('all')
      return
    }

    if (isServiceCategory(value)) {
      setActiveCategory(value)
    }
  }

  const visibleServices = useMemo<ServiceDefinition[]>(() => {
    return filterServices(SERVICE_CATALOG, searchText, activeCategory)
  }, [activeCategory, searchText])

  const groupedVisibleServices = useMemo<Record<ServiceCategory, ServiceDefinition[]>>(() => {
    return groupServicesByCategory(visibleServices, SERVICE_CATEGORIES)
  }, [visibleServices])

  const importEnvFile = async (file: File): Promise<void> => {
    if (!selectedService) {
      setImportStatus('Select a service before importing an env file.')
      return
    }

    const serviceIdAtStart = selectedServiceIdRef.current
    const requestId = envImportRequestIdRef.current + 1
    envImportRequestIdRef.current = requestId
    const fieldsAtImportStart = fields

    const maxImportSizeBytes = 1_500_000
    if (file.size > maxImportSizeBytes) {
      setImportStatus('Import failed: file is too large. Please keep it below 1.5MB.')
      return
    }

    try {
      const text = await file.text()
      const parsed = parseEnvContent(text)

      if (envImportRequestIdRef.current !== requestId || selectedServiceIdRef.current !== serviceIdAtStart) {
        return
      }

      let importedCount = 0

      setWizardState((currentState) => {
        const nextState: Record<string, WizardFieldState> = { ...currentState }
        for (const field of fieldsAtImportStart) {
          const importedValue = parsed[field.key]
          if (typeof importedValue === 'string') {
            nextState[field.key] = {
              value: importedValue,
              useDefault: false,
            }
            importedCount += 1
          }
        }

        return nextState
      })

      setImportStatus(
        importedCount > 0
          ? `Imported ${importedCount} values from ${file.name}.`
          : 'No matching keys found in imported .env file.',
      )
    } catch {
      if (envImportRequestIdRef.current !== requestId || selectedServiceIdRef.current !== serviceIdAtStart) {
        return
      }
      setImportStatus('Import failed: could not parse the selected .env file.')
    }
  }

  const exportBundle = async (): Promise<void> => {
    if (!selectedService || !output) {
      return
    }

    try {
      await exportBundleAsZip({
        serviceId: selectedService.id,
        composeContent: output.composeContent,
        envContent: output.envContent,
      })
      return
    } catch {
      downloadTextFile('docker-compose.yaml', output.composeContent)
      downloadTextFile('.env', output.envContent)
    }
  }

  const hasMissingRequired = output ? output.missingRequired.length > 0 : false
  const statusClassName =
    importStatus.toLowerCase().includes('failed') || importStatus.toLowerCase().includes('unable')
      ? 'error-text'
      : 'status-note'
  const selectedResearchReferences = useMemo(() => {
    if (!selectedService) {
      return []
    }

    return dedupeReferencesByUrl(selectedService.researchReferences)
  }, [selectedService])

  const jumpToMissingFields = (): void => {
    setStep(2)
  }

  const visibleFields = useMemo(() => {
    return sortAndFilterFields(fields, fieldSearchText)
  }, [fieldSearchText, fields])

  return (
    <main className="app-shell">
      <TopNav onHome={goHome} />

      <p className="subtitle">
        Generate docker compose + env files with a guided wizard.
      </p>

      {selectedService && step > 1 ? <ServiceDetails service={selectedService} /> : null}

      {step > 1 ? (
        <WizardStepper
          currentStep={step}
          steps={[
            'Select service',
            'Configure values',
            'Generate files',
          ]}
        />
      ) : null}

      {step === 1 ? (
        <section className="card">
          <h2>1. Choose a service</h2>
          <p className="muted">Select a template card to jump directly into configuration.</p>
          <p className="privacy-inline">Privacy-first: all generation runs in your browser.</p>

          {importStatus ? <p className={statusClassName}>{importStatus}</p> : null}

          <div className="service-filters-inline">
            <label htmlFor="service-search" className="sr-only">
              Search services
            </label>
            <input
              id="service-search"
              type="search"
              value={searchText}
              placeholder="Quick search services"
              onChange={(event) => setSearchText(event.currentTarget.value)}
            />
          </div>

          <div className="category-chip-row" role="group" aria-label="Filter services by category">
            <button
              type="button"
              className="category-chip"
              data-active={activeCategory === 'all'}
              onClick={() => handleCategoryChange('all')}
            >
              All
            </button>
            {categories.map((entry) => (
              <button
                key={entry}
                type="button"
                className="category-chip"
                data-active={activeCategory === entry}
                onClick={() => handleCategoryChange(entry)}
              >
                {entry}
              </button>
            ))}
          </div>

          {visibleServices.length === 0 ? (
            <p className="muted">No services matched your current filters.</p>
          ) : (
            <div className="grouped-services">
              {Object.entries(groupedVisibleServices).map(([category, services]) => {
                if (!Array.isArray(services) || services.length === 0) {
                  return null
                }

                return (
                  <section key={category} className="category-group">
                    <h3>{category}</h3>
                    <div className="service-grid">
                      {services.map((service) => (
                        <ServiceCard
                          key={service.id}
                          service={service}
                          selected={service.id === selectedServiceId}
                          onSelect={selectService}
                        />
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          )}

          {templateError ? <p className="error-text">Failed to load template: {templateError}</p> : null}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="card">
          <h2>2. Configure env values</h2>
          <p className="muted">Use defaults or override any field.</p>
          {importStatus ? <p className={statusClassName}>{importStatus}</p> : null}

          <div className="field-search-row">
            <label htmlFor="field-search" className="sr-only">
              Search environment fields
            </label>
            <input
              id="field-search"
              type="search"
              placeholder="Search env fields (key, label, description)"
              value={fieldSearchText}
              onChange={(event) => setFieldSearchText(event.currentTarget.value)}
            />
            <small>
              Showing {visibleFields.length} of {fields.length} fields
            </small>
          </div>

          <div className="inline-actions">
            <label htmlFor="import-env" className="button">
              Import .env
            </label>
            <input
              id="import-env"
              className="sr-only"
              type="file"
              accept=".env,text/plain"
              onChange={(event) => {
                const selectedFile = event.currentTarget.files?.[0]
                if (selectedFile) {
                  void importEnvFile(selectedFile)
                }
                event.currentTarget.value = ''
              }}
            />
          </div>

          <div className="field-list">
            {!selectedService ? null : fields.length === 0 ? (
              <p className="muted">No configurable environment variables found in this template.</p>
            ) : visibleFields.length === 0 ? (
              <p className="muted">No fields match your search.</p>
            ) : (
              visibleFields.map((field) => (
                <FieldEditor
                  key={field.key}
                  field={field}
                  state={wizardState[field.key]}
                  idPrefix="env-field"
                  onChange={(patch) => updateField(field.key, patch)}
                />
              ))
            )}
          </div>

          <div className="actions sticky-actions">
            <button type="button" className="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="button primary"
              disabled={!selectedService}
              onClick={() => setStep(3)}
            >
              Generate
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 && output && selectedService ? (
        <section className="card">
          <h2>3. Generated output</h2>
          <p className="muted">
            Side-by-side preview of your template compose file and generated <code>.env</code>.
          </p>

          {output.missingRequired.length > 0 ? (
            <div className="warning">
              <strong>Missing required values will export as placeholders:</strong>
              <ul>
                {output.missingRequired.map((missingKey) => (
                  <li key={missingKey}>{missingKey}</li>
                ))}
              </ul>
              <button type="button" className="button" onClick={jumpToMissingFields}>
                Go fix missing values
              </button>
            </div>
          ) : null}

          <div className="code-grid">
            <CodePanel
              title={selectedService.templateFile}
              language="yaml"
              content={output.composeContent}
            />
            <CodePanel
              title=".env"
              language="dotenv"
              content={output.envContent}
            />
          </div>

          <section className="subsection">
            <h3>Security & setup helpers</h3>
            <p className="muted">
              Use in-form Generate buttons for supported secrets, or copy the service-specific commands below.
            </p>
            {selectedService.extraTooling.length === 0 ? (
              <p className="muted">No additional helper commands are required for this template.</p>
            ) : (
              <ul className="tool-list">
                {selectedService.extraTooling.map((tool) => (
                  <li key={tool.title}>
                    <p>
                      <strong>{tool.title}:</strong> {tool.description}
                    </p>
                    {tool.command ? <CopyableCodeBlock content={tool.command} /> : null}
                    {tool.url ? (
                      <a href={tool.url} target="_blank" rel="noreferrer">
                        Source
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="subsection">
            <h3>Defaults research references</h3>
            {selectedResearchReferences.length === 0 ? (
              <p className="muted">No service-specific references listed for this template.</p>
            ) : (
              <ul className="reference-list">
                {selectedResearchReferences.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="actions">
            <button type="button" className="button" onClick={() => setStep(2)}>
              Back to fields
            </button>
            <button type="button" className="button" onClick={() => void exportBundle()}>
              {hasMissingRequired ? 'Export bundle (with placeholders)' : 'Export bundle'}
            </button>
            <button type="button" className="button" onClick={() => setStep(1)}>
              Start over
            </button>
          </div>
        </section>
      ) : null}
    </main>
  )
}

export default App
