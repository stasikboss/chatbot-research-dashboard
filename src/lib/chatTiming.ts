/**
 * Calculate realistic typing delay based on message length
 * Simulates human typing speed: ~50-70 characters per minute
 */
export function calculateTypingDelay(message: string): number {
  const baseDelay = 500 // Minimum delay before typing starts
  const charsPerMinute = 60 // Average typing speed
  const msPerChar = (60 * 1000) / charsPerMinute // ~1000ms per char

  const messageLength = message.length
  const typingTime = messageLength * msPerChar

  // Add small random variation (±200ms) for realism
  const randomVariation = Math.random() * 400 - 200

  // Total: base delay + typing time + random
  const totalDelay = baseDelay + typingTime + randomVariation

  // Cap at reasonable limits (min 800ms, max 4000ms)
  return Math.max(800, Math.min(4000, totalDelay))
}

/**
 * Calculate "reading" delay - time bot takes to "read" user message
 */
export function calculateReadingDelay(message: string): number {
  const baseDelay = 300
  const wordsPerMinute = 200 // Fast reading speed
  const words = message.split(/\s+/).length
  const readingTime = (words / wordsPerMinute) * 60 * 1000

  return baseDelay + readingTime
}

/**
 * Add natural pause between messages
 */
export function getMessageGap(): number {
  // Random gap between 300-600ms
  return 300 + Math.random() * 300
}
