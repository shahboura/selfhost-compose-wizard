import JSZip from 'jszip'

interface ExportBundleInput {
  composeContent: string
  envContent: string
}

export async function exportBundleAsZip({ composeContent, envContent }: ExportBundleInput): Promise<void> {
  const zip = new JSZip()
  zip.file('docker-compose.yaml', composeContent)
  zip.file('.env', envContent)
  const compressedBlob = await zip.generateAsync({ type: 'blob' })

  const downloadUrl = URL.createObjectURL(compressedBlob)
  const anchor = document.createElement('a')
  anchor.href = downloadUrl
  anchor.download = 'compose-bundle.zip'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(downloadUrl)
}
