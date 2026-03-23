'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { MessageBubble } from '@/components/chat/MessageBubble'
import { TypingIndicator } from '@/components/chat/TypingIndicator'
import { QuickReplies, QuickReply } from '@/components/chat/QuickReplies'
import { SatisfactionSlider } from '@/components/chat/SatisfactionSlider'
import { MonthSelector } from '@/components/chat/MonthSelector'
import { ChatStep, Sender } from '@/types'
import { ChatFlowManager } from '@/lib/chatFlow'
import { getMessage, MESSAGES } from '@/lib/conditions'
import { Condition, CommStyle } from '@prisma/client'

interface Message {
  id: string
  sender: Sender
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [showTyping, setShowTyping] = useState(false)
  const [currentStep, setCurrentStep] = useState<ChatStep>(ChatStep.OPENING)
  const [participantId, setParticipantId] = useState<string | null>(null)
  const [condition, setCondition] = useState<Condition | null>(null)
  const [chatFlow, setChatFlow] = useState<ChatFlowManager | null>(null)
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([])
  const [showSatisfactionSlider, setShowSatisfactionSlider] = useState(false)
  const [showMonthSelector, setShowMonthSelector] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  // Initialize chat
  useEffect(() => {
    const pid = localStorage.getItem('participantId')
    const cond = localStorage.getItem('condition')

    if (!pid || !cond) {
      router.push('/register')
      return
    }

    setParticipantId(pid)
    const parsedCondition = JSON.parse(cond)
    setCondition(parsedCondition)

    const flow = new ChatFlowManager(pid, parsedCondition)
    setChatFlow(flow)
  }, [])

  // Send opening message after chatFlow is initialized
  useEffect(() => {
    if (chatFlow && participantId && !hasInitialized.current) {
      hasInitialized.current = true
      // Start with user opening message
      addUserMessage(MESSAGES.userOpening, ChatStep.OPENING)
    }
  }, [chatFlow, participantId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, showTyping])

  const addUserMessage = async (content: string, step: ChatStep, userInput?: any) => {
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      sender: Sender.USER,
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])

    // Save to database
    if (participantId) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          sender: 'USER',
          content,
          stepNumber: step,
        }),
      })
    }

    // Advance flow and get bot responses
    chatFlow?.advanceStep(userInput)
    await showBotResponses()
  }

  const addBotMessage = async (content: string, step: ChatStep) => {
    const newMessage: Message = {
      id: `bot-${Date.now()}-${Math.random()}`,
      sender: Sender.BOT,
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])

    // Save to database
    if (participantId) {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          sender: 'BOT',
          content,
          stepNumber: step,
        }),
      })
    }
  }

  const showBotResponses = async () => {
    if (!chatFlow || !condition) return

    const currentStepBeforeMessages = chatFlow.getCurrentStep()
    const responses = await chatFlow.getNextMessages()

    for (const response of responses) {
      if (response.delay && response.delay > 0) {
        if (response.showTyping) {
          setShowTyping(true)
        }
        await new Promise((resolve) => setTimeout(resolve, response.delay))
        setShowTyping(false)
      }

      await addBotMessage(response.content, chatFlow.getCurrentStep())
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Auto-advance for bot-only steps (no user interaction required)
    if (currentStepBeforeMessages === ChatStep.INITIAL_RESPONSE) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      chatFlow.advanceStep()
      await showBotResponses()
      return
    }

    if (currentStepBeforeMessages === ChatStep.USER_CONFIRM) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      chatFlow.advanceStep()
      await showBotResponses()
      return
    }

    if (currentStepBeforeMessages === ChatStep.REGIONAL_ISSUE) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      chatFlow.advanceStep()
      await showBotResponses()
      return
    }

    if (currentStepBeforeMessages === ChatStep.COMPENSATION) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      chatFlow.advanceStep()
      await showBotResponses()
      return
    }

    if (currentStepBeforeMessages === ChatStep.RESOLVED) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      chatFlow.advanceStep()
      await showBotResponses()
      return
    }

    if (currentStepBeforeMessages === ChatStep.COUNTER_OFFER) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      chatFlow.advanceStep()
      await showBotResponses()
      return
    }

    // Set up UI for next step
    setupNextStep()
  }

  const setupNextStep = () => {
    if (!chatFlow || !condition) return

    const step = chatFlow.getCurrentStep()
    setCurrentStep(step)

    const style = condition.communicationStyle

    switch (step) {
      case ChatStep.DIAGNOSTIC:
        // Wait for bot message to appear, then show confirmation button
        setTimeout(() => {
          setQuickReplies([
            { text: MESSAGES.userConfirmation, value: 'confirmed' },
          ])
        }, 1000)
        break

      case ChatStep.SATISFACTION:
        setTimeout(() => {
          setShowSatisfactionSlider(true)
        }, 1000)
        break

      case ChatStep.NEGOTIATION_OFFER:
        setTimeout(() => {
          setQuickReplies([
            { text: 'כן', value: true },
            { text: 'לא', value: false },
          ])
        }, 1000)
        break

      case ChatStep.NEGOTIATION_ASK:
        setTimeout(() => {
          setShowMonthSelector(true)
        }, 1000)
        break

      case ChatStep.FINAL_DECISION:
        setTimeout(() => {
          setQuickReplies([
            { text: 'מקבל/ת', value: true },
            { text: 'דוחה/ה', value: false },
          ])
        }, 1000)
        break

      case ChatStep.CLOSING:
        // Complete chat
        setTimeout(async () => {
          if (participantId) {
            await fetch('/api/messages', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                participantId,
                status: 'COMPLETED',
                completedAt: new Date().toISOString(),
              }),
            })
          }
          router.push('/complete')
        }, 2000)
        break
    }
  }

  const handleQuickReply = async (value: any) => {
    setQuickReplies([])

    if (currentStep === ChatStep.DIAGNOSTIC) {
      await addUserMessage(MESSAGES.userConfirmation, currentStep)
    } else if (currentStep === ChatStep.NEGOTIATION_OFFER) {
      const text = value ? 'כן' : 'לא'
      await addUserMessage(text, currentStep, { participateInNegotiation: value })
    } else if (currentStep === ChatStep.FINAL_DECISION) {
      const text = value ? 'מקבל/ת' : 'דוחה/ה'
      await addUserMessage(text, currentStep, { acceptCounterOffer: value })

      // Save result after advancing
      setTimeout(async () => {
        const state = chatFlow?.getState()
        if (participantId && state) {
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              participantId,
              sender: 'SYSTEM',
              content: 'Result saved',
              stepNumber: ChatStep.CLOSING,
              resultData: {
                satisfactionScore: state.satisfactionScore,
                participatedNegotiation: state.participatedNegotiation,
                initialOffer: state.initialOffer,
                acceptedCounterOffer: state.acceptedCounterOffer,
                totalDurationSeconds: chatFlow.getTotalDuration(),
              },
            }),
          })
        }
      }, 100)
    }
  }

  const handleSatisfactionSubmit = async (score: number) => {
    setShowSatisfactionSlider(false)
    await addUserMessage(`שביעות רצון: ${score}/7`, currentStep, { satisfactionScore: score })
  }

  const handleMonthSelect = async (months: number) => {
    setShowMonthSelector(false)
    await addUserMessage(`${months} חודשים`, currentStep, { initialOffer: months })
  }

  if (!participantId || !condition) {
    return null
  }

  return (
    <ChatContainer>
      <div className="flex flex-col gap-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            sender={msg.sender}
            content={msg.content}
            timestamp={msg.timestamp}
          />
        ))}

        {showTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && (
        <QuickReplies replies={quickReplies} onSelect={handleQuickReply} />
      )}

      {showSatisfactionSlider && (
        <SatisfactionSlider onSubmit={handleSatisfactionSubmit} />
      )}

      {showMonthSelector && (
        <MonthSelector onSelect={handleMonthSelect} />
      )}
    </ChatContainer>
  )
}
