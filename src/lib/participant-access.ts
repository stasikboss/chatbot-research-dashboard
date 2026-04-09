import { createHmac, timingSafeEqual } from 'crypto'

const PARTICIPANT_TOKEN_PREFIX = 'ptok'

function getSigningSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is not configured')
  }
  return secret
}

function signValue(value: string): string {
  return createHmac('sha256', getSigningSecret()).update(value).digest('hex')
}

export function createParticipantAccessToken(participantId: string): string {
  const payload = `${PARTICIPANT_TOKEN_PREFIX}.${participantId}`
  const signature = signValue(payload)
  return `${payload}.${signature}`
}

export function verifyParticipantAccessToken(
  participantId: string,
  token: string | null
): boolean {
  if (!token) return false

  const expectedToken = createParticipantAccessToken(participantId)

  const expectedBuffer = Buffer.from(expectedToken)
  const receivedBuffer = Buffer.from(token)

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer)
}
