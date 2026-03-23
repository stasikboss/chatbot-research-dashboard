import { prisma } from './prisma'
import { CommStyle } from '@prisma/client'
import { MESSAGES } from './conditions'

// Type for cached messages
interface CachedMessage {
  id: number
  stepNumber: number
  messageKey: string
  sender: string
  isFixed: boolean
  formalContent: string | null
  friendlyContent: string | null
  fixedContent: string | null
  description: string | null
  isActive: boolean
  order: number
}

// In-memory cache for chat messages
let messageCache: Map<string, CachedMessage> | null = null
let lastCacheLoad: Date | null = null
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Load all active chat messages from database into memory cache
 */
export async function loadMessagesIntoCache(): Promise<void> {
  try {
    console.log('[MessageFetcher] Loading messages into cache...')

    const messages = await prisma.chatMessage.findMany({
      where: { isActive: true },
      orderBy: [{ stepNumber: 'asc' }, { order: 'asc' }],
    })

    messageCache = new Map()
    messages.forEach((msg) => {
      messageCache!.set(msg.messageKey, msg as CachedMessage)
    })

    lastCacheLoad = new Date()
    console.log(`[MessageFetcher] Loaded ${messages.length} messages into cache`)
  } catch (error) {
    console.error('[MessageFetcher] Failed to load messages:', error)
    // Don't throw - fallback to hardcoded messages will be used
    messageCache = new Map()
  }
}

/**
 * Check if cache needs refresh based on age
 */
function shouldRefreshCache(): boolean {
  if (!lastCacheLoad) return true
  const age = Date.now() - lastCacheLoad.getTime()
  return age > CACHE_DURATION_MS
}

/**
 * Get a message from the database cache by messageKey and style
 * Falls back to hardcoded messages if DB is unavailable
 *
 * @param messageKey - The unique message identifier
 * @param style - Communication style (FORMAL or FRIENDLY)
 * @param args - Additional arguments for function-based messages
 * @returns The message content as a string
 */
export async function getMessageFromDB(
  messageKey: string,
  style?: CommStyle,
  ...args: any[]
): Promise<string> {
  // Ensure cache is loaded and fresh
  if (!messageCache || shouldRefreshCache()) {
    await loadMessagesIntoCache()
  }

  // Try to get from cache
  const message = messageCache?.get(messageKey)

  if (!message) {
    console.warn(
      `[MessageFetcher] Message not found in DB: ${messageKey}, using fallback`
    )
    return getMessageFallback(messageKey, style, ...args)
  }

  // Handle fixed messages (no style variation)
  if (message.isFixed) {
    return message.fixedContent || ''
  }

  // Handle style-specific messages
  if (style === CommStyle.FORMAL) {
    let content = message.formalContent || ''
    // Handle template substitution for messages with placeholders
    content = handleTemplateSubstitution(content, args)
    return content
  }

  // Default to FRIENDLY style
  let content = message.friendlyContent || ''
  content = handleTemplateSubstitution(content, args)
  return content
}

/**
 * Handle template variable substitution
 * Replaces {months} with actual values from args
 */
function handleTemplateSubstitution(content: string, args: any[]): string {
  if (args.length === 0) return content

  // Replace {months} placeholder with first argument
  if (content.includes('{months}') && args[0] !== undefined) {
    return content.replace('{months}', String(args[0]))
  }

  return content
}

/**
 * Fallback to hardcoded messages from conditions.ts
 * Used when database is unavailable or message not found
 */
function getMessageFallback(
  messageKey: string,
  style?: CommStyle,
  ...args: any[]
): string {
  try {
    const message = MESSAGES[messageKey as keyof typeof MESSAGES]

    if (!message) {
      console.error(`[MessageFetcher] Message key not found: ${messageKey}`)
      return ''
    }

    // Handle object messages with style variations
    if (typeof message === 'object' && style && style in message) {
      const styleMessage = message[style as keyof typeof message]

      // Handle function messages
      if (typeof styleMessage === 'function') {
        return styleMessage(...args)
      }

      return styleMessage as string
    }

    // Handle plain string messages
    if (typeof message === 'string') {
      return message
    }

    return ''
  } catch (error) {
    console.error(`[MessageFetcher] Error in fallback for ${messageKey}:`, error)
    return ''
  }
}

/**
 * Invalidate the message cache
 * Call this after updating messages in the database
 */
export function invalidateMessageCache(): void {
  console.log('[MessageFetcher] Cache invalidated')
  messageCache = null
  lastCacheLoad = null
}

/**
 * Get all cached messages (for debugging)
 */
export function getCachedMessages(): CachedMessage[] | null {
  if (!messageCache) return null
  return Array.from(messageCache.values())
}

/**
 * Check if cache is loaded and ready
 */
export function isCacheReady(): boolean {
  return messageCache !== null && messageCache.size > 0
}
