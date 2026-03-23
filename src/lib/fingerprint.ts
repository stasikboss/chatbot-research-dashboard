/**
 * Device fingerprinting utilities
 * Uses various browser features to create a unique device identifier
 */

export interface FingerprintComponents {
  userAgent: string
  language: string
  colorDepth: number
  deviceMemory: number
  hardwareConcurrency: number
  screenResolution: string
  timezone: string
  platform: string
  canvas?: string
  webgl?: string
}

/**
 * Generate a canvas fingerprint
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    canvas.width = 200
    canvas.height = 50

    // Draw text with specific styling
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Research 🔬', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Research 🔬', 4, 17)

    return canvas.toDataURL()
  } catch (e) {
    return ''
  }
}

/**
 * Generate a WebGL fingerprint
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return ''

    // @ts-ignore
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return ''

    // @ts-ignore
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
    // @ts-ignore
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

    return `${vendor}~${renderer}`
  } catch (e) {
    return ''
  }
}

/**
 * Collect fingerprint components from the browser
 */
export function collectFingerprintComponents(): FingerprintComponents {
  const nav = navigator as any

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    colorDepth: screen.colorDepth,
    deviceMemory: nav.deviceMemory || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
  }
}

/**
 * Simple hash function (FNV-1a)
 */
function hashString(str: string): string {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return (hash >>> 0).toString(36)
}

/**
 * Generate a fingerprint hash from components
 */
export function generateFingerprint(components: FingerprintComponents): string {
  const fingerprintString = JSON.stringify(components)
  return hashString(fingerprintString)
}

/**
 * Get the device fingerprint (main function to use)
 */
export async function getDeviceFingerprint(): Promise<string> {
  // Wait a bit for the browser to stabilize
  await new Promise((resolve) => setTimeout(resolve, 100))

  const components = collectFingerprintComponents()
  return generateFingerprint(components)
}

/**
 * Store fingerprint in localStorage
 */
export function storeFingerprintLocally(fingerprint: string): void {
  try {
    localStorage.setItem('device_fingerprint', fingerprint)
  } catch (e) {
    console.warn('Failed to store fingerprint in localStorage')
  }
}

/**
 * Get fingerprint from localStorage
 */
export function getStoredFingerprint(): string | null {
  try {
    return localStorage.getItem('device_fingerprint')
  } catch (e) {
    return null
  }
}

/**
 * Get or create device fingerprint
 */
export async function getOrCreateFingerprint(): Promise<string> {
  // Try to get from localStorage first
  const stored = getStoredFingerprint()
  if (stored) return stored

  // Generate new fingerprint
  const fingerprint = await getDeviceFingerprint()
  storeFingerprintLocally(fingerprint)

  return fingerprint
}
