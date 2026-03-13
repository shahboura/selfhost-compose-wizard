import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { CodePanel } from './components/CodePanel'
import { FieldEditor } from './components/FieldEditor'
import { PrivacyNotice } from './components/PrivacyNotice'
import { ServiceDetails } from './components/ServiceDetails'
import { ServiceCard } from './components/ServiceCard'
import { ServiceFilters } from './components/ServiceFilters'
import { TopNav } from './components/TopNav'
import { WizardStepper } from './components/WizardStepper'
import { SERVICE_CATALOG } from './data/service-catalog'
import { downloadTextFile } from './lib/download'
import { parseEnvContent } from './lib/env'
import { exportBundleAsZip } from './lib/export'
import { buildFieldDefinitions, generateOutputs, resolveWizardStateForService, type GenerationOutput } from './lib/generator'
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
  const [showOnboardingTip, setShowOnboardingTip] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.localStorage.getItem('onboarding_tip_dismissed') !== 'true'
  })
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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (!(event.altKey && event.key.toLowerCase() === 'h')) {
        return
      }

      const target = event.target as HTMLElement | null
      const tagName = target?.tagName.toLowerCase()
      const isTypingContext =
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.isContentEditable === true

      if (isTypingContext) {
        return
      }

      event.preventDefault()
      goHome()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const dismissOnboardingTip = (): void => {
    setShowOnboardingTip(false)
    window.localStorage.setItem('onboarding_tip_dismissed', 'true')
  }

  const categories = useMemo<ServiceCategory[]>(
    () => SERVICE_CATEGORIES.filter((category) => SERVICE_CATALOG.some((service) => service.category === category)),
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
    const normalizedSearch = searchText.trim().toLowerCase()
    return SERVICE_CATALOG.filter((service) => {
      const categoryMatch = activeCategory === 'all' || service.category === activeCategory
      if (!categoryMatch) {
        return false
      }

      if (normalizedSearch.length === 0) {
        return true
      }

      const haystack = `${service.name} ${service.description} ${service.tags.join(' ')}`.toLowerCase()
      return haystack.includes(normalizedSearch)
    })
  }, [activeCategory, searchText])

  const groupedVisibleServices = useMemo<Record<ServiceCategory, ServiceDefinition[]>>(() => {
    const base = SERVICE_CATEGORIES.reduce<Record<ServiceCategory, ServiceDefinition[]>>((accumulator, category) => {
      accumulator[category] = []
      return accumulator
    }, {} as Record<ServiceCategory, ServiceDefinition[]>)

    for (const service of visibleServices) {
      base[service.category].push(service)
    }

    return base
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
  const selectedResearchReferences = useMemo(() => {
    if (!selectedService) {
      return []
    }

    const uniqueByUrl = new Map<string, { title: string; url: string }>()
    for (const reference of selectedService.researchReferences) {
      if (!uniqueByUrl.has(reference.url)) {
        uniqueByUrl.set(reference.url, reference)
      }
    }

    return [...uniqueByUrl.values()]
  }, [selectedService])

  const jumpToMissingFields = (): void => {
    setStep(2)
  }

  const visibleFields = useMemo(() => {
    const normalized = fieldSearchText.trim().toLowerCase()
    const sorted = [...fields].sort((left, right) => {
      if (left.required !== right.required) {
        return left.required ? -1 : 1
      }
      return left.key.localeCompare(right.key)
    })

    if (normalized.length === 0) {
      return sorted
    }

    return sorted.filter((field) => {
      const haystack = `${field.key} ${field.label} ${field.description}`.toLowerCase()
      return haystack.includes(normalized)
    })
  }, [fieldSearchText, fields])

  return (
    <main className="app-shell">
      <TopNav onHome={goHome} />

      <p className="subtitle">
        Generate docker compose + env files with a guided wizard.
      </p>

      {step === 1 && showOnboardingTip ? (
        <section className="tip-banner" aria-live="polite">
          <p>
            Quick start: choose a service card to jump straight into configuration. Use Home (Alt+H)
            anytime.
          </p>
          <button type="button" className="button" onClick={dismissOnboardingTip}>
            Got it
          </button>
        </section>
      ) : null}

      {importStatus && step === 1 ? <p className="status-note">{importStatus}</p> : null}

      {importStatus && step === 2 ? <p className="status-note">{importStatus}</p> : null}

      {step === 1 ? <PrivacyNotice /> : null}

      {step === 1 ? (
        <ServiceFilters
          search={searchText}
          category={activeCategory}
          categories={categories}
          onSearchChange={setSearchText}
          onCategoryChange={handleCategoryChange}
        />
      ) : null}

      {selectedService && step > 1 ? <ServiceDetails service={selectedService} /> : null}

      <WizardStepper
        currentStep={step}
        steps={[
          'Select service',
          'Configure values',
          'Generate files',
        ]}
      />

      {step === 1 ? (
        <section className="card">
          <h2>1. Choose a service</h2>
          {visibleServices.length === 0 ? (
            <p className="muted">No services matched your current filters.</p>
          ) : (
            <div className="grouped-services">
              {Object.entries(groupedVisibleServices).map(([category, services]) =>
                services.length === 0 ? null : (
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
                ),
              )}
            </div>
          )}

          <div className="actions">
            <button
              type="button"
              className="button primary"
              disabled={!selectedService || Boolean(templateError)}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </div>

          {templateError ? <p className="error-text">Failed to load template: {templateError}</p> : null}
        </section>
      ) : null}

      {step === 2 ? (
        <section className="card">
          <h2>2. Configure env values</h2>
          <p className="muted">Use defaults or override any field.</p>

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
              <strong>Review required values:</strong>
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
                    {tool.command ? <pre>{tool.command}</pre> : null}
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
            <button type="button" className="button" disabled={hasMissingRequired} onClick={() => void exportBundle()}>
              Export bundle
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
