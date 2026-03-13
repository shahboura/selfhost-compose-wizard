import { useEffect, useMemo, useRef, useState, type JSX } from 'react'

interface CodePanelProps {
  title: string
  language: 'yaml' | 'dotenv' | 'text'
  content: string
  fileName: string
}

function downloadTextFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function CodePanel({ title, language, content, fileName }: CodePanelProps): JSX.Element {
  const [copied, setCopied] = useState<boolean>(false)
  const timeoutRef = useRef<number | undefined>(undefined)
  const lineCount = useMemo<number>(() => content.split('\n').length, [content])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const copyContent = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="code-panel" aria-label={`${title} output`}>
      <header>
        <div>
          <h3>{title}</h3>
          <small>
            {lineCount} lines • {language}
          </small>
        </div>
        <div className="actions-inline">
          <button type="button" className="button" onClick={() => void copyContent()}>
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" className="button" onClick={() => downloadTextFile(fileName, content)}>
            Download
          </button>
        </div>
      </header>
      <pre>{content}</pre>
    </section>
  )
}
