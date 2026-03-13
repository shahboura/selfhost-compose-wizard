import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { downloadTextFile } from '../lib/download'

interface CodePanelProps {
  title: string
  language: 'yaml' | 'dotenv' | 'text'
  content: string
  fileName: string
}

export function CodePanel({ title, language, content, fileName }: CodePanelProps): JSX.Element {
  const [copied, setCopied] = useState<boolean>(false)
  const [showCopyIndicator, setShowCopyIndicator] = useState<boolean>(false)
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
          <button type="button" className="button" onClick={() => downloadTextFile(fileName, content)}>
            Download
          </button>
        </div>
      </header>
      <div
        className="code-pre-wrap"
        onMouseEnter={() => setShowCopyIndicator(true)}
        onMouseLeave={() => setShowCopyIndicator(false)}
      >
        <button
          type="button"
          className="copy-indicator"
          data-visible={showCopyIndicator || copied}
          onClick={() => void copyContent()}
          aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <pre>{content}</pre>
      </div>
    </section>
  )
}
