import { useEffect, useRef, useState, type JSX } from 'react'

interface CopyableCodeBlockProps {
  content: string
}

export function CopyableCodeBlock({ content }: CopyableCodeBlockProps): JSX.Element {
  const [copied, setCopied] = useState<boolean>(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="copyable-pre-wrap">
      <button type="button" className="copy-indicator" data-visible="true" onClick={() => void copy()}>
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre>{content}</pre>
    </div>
  )
}
