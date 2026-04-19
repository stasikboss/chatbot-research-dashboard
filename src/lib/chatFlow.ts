import { ChatStep, ChatState } from '@/types'
import { ResponseTime, CommStyle, Condition } from '@prisma/client'
import { getMessage, DELAY_DURATION_MS } from './conditions'

// Chat flow state machine
export class ChatFlowManager {
  private state: ChatState
  private condition: Condition

  constructor(participantId: string, condition: Condition) {
    this.condition = condition
    this.state = {
      participantId,
      conditionId: condition.id,
      currentStep: ChatStep.OPENING,
      participatedNegotiation: false,
      startTime: Date.now(),
      lastActivityTime: Date.now(),
    }
  }

  // Load existing state
  static fromState(state: ChatState, condition: Condition): ChatFlowManager {
    const manager = new ChatFlowManager(state.participantId, condition)
    manager.state = state
    return manager
  }

  // Get current state
  getState(): ChatState {
    return { ...this.state }
  }

  // Update last activity time
  updateActivity(): void {
    this.state.lastActivityTime = Date.now()
  }

  // Check if session is abandoned (30 minutes of inactivity)
  isAbandoned(): boolean {
    const thirtyMinutes = 30 * 60 * 1000
    return Date.now() - this.state.lastActivityTime > thirtyMinutes
  }

  // Get total duration in seconds
  getTotalDuration(): number {
    return Math.floor((Date.now() - this.state.startTime) / 1000)
  }

  // Get next message(s) to display
  async getNextMessages(): Promise<Array<{ content: string; delay?: number; showTyping?: boolean }>> {
    const messages: Array<{ content: string; delay?: number; showTyping?: boolean }> = []
    const style = this.condition.communicationStyle

    switch (this.state.currentStep) {
      case ChatStep.OPENING:
        // User sends opening message (handled by UI)
        break

      case ChatStep.INITIAL_RESPONSE:
        // Handle delay logic based on condition
        if (this.condition.responseTime === ResponseTime.DELAY_WITH_MESSAGE) {
          messages.push({
            content: getMessage('delayMessage', style),
            delay: 0,
          })
          messages.push({
            content: getMessage('initialResponse', style),
            delay: DELAY_DURATION_MS,
          })
        } else if (this.condition.responseTime === ResponseTime.DELAY_NO_MESSAGE) {
          messages.push({
            content: getMessage('initialResponse', style),
            delay: DELAY_DURATION_MS,
            showTyping: true,
          })
        } else {
          // IMMEDIATE
          messages.push({
            content: getMessage('initialResponse', style),
            delay: 0,
          })
        }
        break

      case ChatStep.DIAGNOSTIC:
        messages.push({
          content: getMessage('diagnosticQuestion', style),
          delay: 1000,
        })
        break

      case ChatStep.USER_CONFIRM:
        // User clicks confirmation button (handled by UI)
        break

      case ChatStep.REGIONAL_ISSUE:
        messages.push({
          content: getMessage('regionalIssue', style),
          delay: 1500,
        })
        break

      case ChatStep.COMPENSATION:
        messages.push({
          content: getMessage('compensationOffer', style),
          delay: 2000,
        })
        break

      case ChatStep.SATISFACTION:
        messages.push({
          content: getMessage('satisfactionQuestion', style),
          delay: 1000,
        })
        break

      case ChatStep.RESOLVED:
        messages.push({
          content: getMessage('issueResolved', style),
          delay: 1000,
        })
        messages.push({
          content: getMessage('negotiationOffer', style),
          delay: 2000,
        })
        break

      case ChatStep.NEGOTIATION_OFFER:
        // User chooses yes/no (handled by UI)
        break

      case ChatStep.NEGOTIATION_ASK:
        messages.push({
          content: getMessage('negotiationOpening', style),
          delay: 1000,
        })
        break

      case ChatStep.COUNTER_OFFER:
        if (this.state.initialOffer) {
          const counterOffer = Math.max(1, this.state.initialOffer - 2)
          this.state.counterOffer = counterOffer
          messages.push({
            content: getMessage('counterOffer', style, counterOffer),
            delay: 1500,
          })
        }
        break

      case ChatStep.FINAL_DECISION:
        // User accepts or rejects (handled by UI)
        break

      case ChatStep.SECOND_COUNTER_OFFER:
        if (this.state.initialOffer) {
          const secondOffer = Math.max(1, this.state.initialOffer - 1)
          this.state.secondCounterOffer = secondOffer
          messages.push({
            content: getMessage('secondCounterOffer', style, secondOffer),
            delay: 1500,
          })
        }
        break

      case ChatStep.SECOND_DECISION:
        // User accepts or rejects second offer (handled by UI)
        break

      case ChatStep.CLOSING:
        // Choose message based on negotiation outcome
        if (this.state.acceptedCounterOffer === true) {
          // Accepted first offer (X-2)
          const acceptedMonths = this.state.counterOffer || 0
          messages.push({
            content: getMessage('acceptedFirstOffer', style, acceptedMonths),
            delay: 1000,
          })
        } else if (this.state.acceptedSecondOffer === true) {
          // Accepted second offer (X-1)
          const acceptedMonths = this.state.secondCounterOffer || 0
          messages.push({
            content: getMessage('acceptedSecondOffer', style, acceptedMonths),
            delay: 1000,
          })
        } else if (this.state.acceptedCounterOffer === false && this.state.acceptedSecondOffer === false) {
          // Rejected both offers
          messages.push({
            content: getMessage('rejectedBothOffers', style),
            delay: 1000,
          })
        } else {
          // Declined negotiation entirely
          messages.push({
            content: getMessage('declinedNegotiation', style),
            delay: 1000,
          })
        }
        break
    }

    return messages
  }

  // Advance to next step
  advanceStep(userInput?: any): void {
    this.updateActivity()

    switch (this.state.currentStep) {
      case ChatStep.OPENING:
        this.state.currentStep = ChatStep.INITIAL_RESPONSE
        break

      case ChatStep.INITIAL_RESPONSE:
        this.state.currentStep = ChatStep.DIAGNOSTIC
        break

      case ChatStep.DIAGNOSTIC:
        this.state.currentStep = ChatStep.USER_CONFIRM
        break

      case ChatStep.USER_CONFIRM:
        this.state.currentStep = ChatStep.REGIONAL_ISSUE
        break

      case ChatStep.REGIONAL_ISSUE:
        this.state.currentStep = ChatStep.COMPENSATION
        break

      case ChatStep.COMPENSATION:
        this.state.currentStep = ChatStep.SATISFACTION
        break

      case ChatStep.SATISFACTION:
        if (userInput?.satisfactionScore) {
          this.state.satisfactionScore = userInput.satisfactionScore
        }
        this.state.currentStep = ChatStep.RESOLVED
        break

      case ChatStep.RESOLVED:
        this.state.currentStep = ChatStep.NEGOTIATION_OFFER
        break

      case ChatStep.NEGOTIATION_OFFER:
        if (userInput?.participateInNegotiation === true) {
          this.state.participatedNegotiation = true
          this.state.currentStep = ChatStep.NEGOTIATION_ASK
        } else {
          this.state.participatedNegotiation = false
          this.state.currentStep = ChatStep.CLOSING
        }
        break

      case ChatStep.NEGOTIATION_ASK:
        if (userInput?.initialOffer) {
          this.state.initialOffer = userInput.initialOffer
          // Special case: if user asks for 1 month, accept immediately
          if (userInput.initialOffer === 1) {
            this.state.acceptedCounterOffer = true
            this.state.counterOffer = 1
            this.state.currentStep = ChatStep.CLOSING
          } else {
            this.state.currentStep = ChatStep.COUNTER_OFFER
          }
        } else {
          this.state.currentStep = ChatStep.COUNTER_OFFER
        }
        break

      case ChatStep.COUNTER_OFFER:
        this.state.currentStep = ChatStep.FINAL_DECISION
        break

      case ChatStep.FINAL_DECISION:
        if (userInput?.acceptCounterOffer === true) {
          this.state.acceptedCounterOffer = true
          this.state.currentStep = ChatStep.CLOSING  // Accept → end
        } else if (userInput?.acceptCounterOffer === false) {
          this.state.acceptedCounterOffer = false
          // Special case: if initial offer was 2 (counter was 1), end immediately after rejection
          if (this.state.initialOffer === 2) {
            this.state.acceptedSecondOffer = false
            this.state.currentStep = ChatStep.CLOSING
          } else {
            this.state.currentStep = ChatStep.SECOND_COUNTER_OFFER  // Reject → second offer
          }
        }
        break

      case ChatStep.SECOND_COUNTER_OFFER:
        this.state.currentStep = ChatStep.SECOND_DECISION
        break

      case ChatStep.SECOND_DECISION:
        if (userInput?.acceptSecondOffer !== undefined) {
          this.state.acceptedSecondOffer = userInput.acceptSecondOffer
        }
        this.state.currentStep = ChatStep.CLOSING
        break

      case ChatStep.CLOSING:
        // Chat completed
        break
    }
  }

  // Check if chat is complete
  isComplete(): boolean {
    return this.state.currentStep === ChatStep.CLOSING
  }

  // Get current step
  getCurrentStep(): ChatStep {
    return this.state.currentStep
  }
}
