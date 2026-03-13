import JSZip from 'jszip'
import type { ServiceDefinition, ToolingHint } from '../types'

interface ExportBundleInput {
  service: ServiceDefinition
  composeContent: string
  envContent: string
  extraTooling: ToolingHint[]
}

function composeNotes(service: ServiceDefinition, tooling: ToolingHint[]): string {
  const lines: string[] = []
  lines.push(`# ${service.name} setup notes`)
  lines.push('')
  lines.push(`Template: ${service.templateFile}`)
  lines.push('')

  if (service.riskWarnings && service.riskWarnings.length > 0) {
    lines.push('Risk warnings:')
    for (const warning of service.riskWarnings) {
      lines.push(`- ${warning}`)
    }
    lines.push('')
  }

  if (tooling.length === 0) {
    lines.push('No additional tooling required for this template.')
    return lines.join('\n')
  }

  lines.push('Additional tooling:')
  for (const item of tooling) {
    lines.push(`- ${item.title}: ${item.description}`)
    if (item.command) {
      lines.push(`  Command: ${item.command}`)
    }
    if (item.url) {
      lines.push(`  Reference: ${item.url}`)
    }
  }

  return lines.join('\n')
}

export async function exportBundleAsZip({
  service,
  composeContent,
  envContent,
  extraTooling,
}: ExportBundleInput): Promise<void> {
  const zip = new JSZip()
  zip.file(service.templateFile, composeContent)
  zip.file('.env', envContent)
  zip.file('notes.txt', composeNotes(service, extraTooling))
  const compressedBlob = await zip.generateAsync({ type: 'blob' })

  const downloadUrl = URL.createObjectURL(compressedBlob)
  const anchor = document.createElement('a')
  anchor.href = downloadUrl
  anchor.download = `${service.id}-bundle.zip`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(downloadUrl)
}
