import type { JSX } from 'react'

interface IconProps {
  title?: string
}

export function EyeIcon({ title }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function EyeOffIcon({ title }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M2 12s3.5-6 10-6c2.3 0 4.2.7 5.8 1.7M22 12s-3.5 6-10 6c-2.3 0-4.2-.7-5.8-1.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 9.9a3 3 0 0 0 4.2 4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function CopyIcon({ title }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <rect x="9" y="9" width="11" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function CheckIcon({ title }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M5 12.5l4.5 4.5L19 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GitHubIcon({ title }: IconProps): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden={title ? undefined : true} role="img">
      {title ? <title>{title}</title> : null}
      <path
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.15-1.11-1.45-1.11-1.45-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.33 1.09 2.9.84.09-.65.35-1.09.63-1.34-2.22-.26-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.29.1-2.68 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.84c.85 0 1.71.11 2.51.32 1.9-1.29 2.74-1.02 2.74-1.02.56 1.39.21 2.43.1 2.68.65.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.69-4.57 4.95.36.31.68.92.68 1.86v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z"
        fill="currentColor"
      />
    </svg>
  )
}
