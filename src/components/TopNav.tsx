import type { JSX } from 'react'

interface TopNavProps {
  selectedServiceName: string
  selectedTemplatePath: string
  onImportEnv: (file: File) => void
}

export function TopNav({ selectedServiceName, selectedTemplatePath, onImportEnv }: TopNavProps): JSX.Element {
  const openFilePicker = (): void => {
    const fileInput = document.getElementById('import-env') as HTMLInputElement | null
    fileInput?.click()
  }

  return (
    <header className="top-nav" role="banner">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          ⚙
        </span>
        <div>
          <p className="eyebrow">Self-hosting onboarding wizard</p>
          <h1>Docker Compose Generator</h1>
        </div>
      </div>

      <div className="selection-meta">
        <p>
          <strong>Service:</strong> {selectedServiceName}
        </p>
        <p>
          <strong>Template:</strong> <code>{selectedTemplatePath}</code>
        </p>
        <button type="button" className="button import-env-button" onClick={openFilePicker}>
          Import .env
        </button>
        <input
          id="import-env"
          className="sr-only"
          type="file"
          accept=".env,text/plain"
          onChange={(event) => {
            const selectedFile = event.currentTarget.files?.[0]
            if (selectedFile) {
              onImportEnv(selectedFile)
            }
            event.currentTarget.value = ''
          }}
        />
      </div>
    </header>
  )
}
