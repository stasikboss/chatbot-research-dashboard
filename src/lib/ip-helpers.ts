import { NextRequest } from 'next/server'

/**
 * Extract client IP address from request headers
 */
export function getClientIp(req: NextRequest | Request): string | null {
  // Try various headers that proxies/load balancers use
  const headers = req.headers

  // Check X-Forwarded-For first (most common)
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim()
  }

  // Check other common headers
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  const cfConnectingIp = headers.get('cf-connecting-ip') // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  // Fallback to remote address (if available in Next.js context)
  return null
}

/**
 * Parse User-Agent string to extract device information
 */
export function parseUserAgent(userAgent: string | null): string {
  if (!userAgent) {
    return 'Unknown Device'
  }

  // Simple parsing - detect OS and browser
  let os = 'Unknown OS'
  let browser = 'Unknown Browser'

  // Detect OS
  if (userAgent.includes('Windows NT 10.0')) {
    os = 'Windows 10/11'
  } else if (userAgent.includes('Windows NT')) {
    os = 'Windows'
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS'
  } else if (userAgent.includes('Linux')) {
    os = 'Linux'
  } else if (userAgent.includes('Android')) {
    os = 'Android'
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS'
  }

  // Detect Browser
  if (userAgent.includes('Edg/')) {
    browser = 'Edge'
  } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
    browser = 'Chrome'
  } else if (userAgent.includes('Firefox/')) {
    browser = 'Firefox'
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    browser = 'Safari'
  }

  return `${browser} on ${os}`
}

/**
 * Check if the device is mobile based on User-Agent
 */
export function isMobileDevice(userAgent: string | null): boolean {
  if (!userAgent) {
    return false
  }

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
}
