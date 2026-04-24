import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

export function ChatExplainer({ isOpen, onToggle, profile, recommendation, disabled }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask me anything about your recommended policy or insurance terms.' },
  ])
  const [typing, setTyping] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const chatRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isOpen])

  const handleSend = useCallback(async () => {
    if (!message.trim() || disabled) {
      return
    }
    const userMessage = { role: 'user', text: message.trim() }
    setMessages((current) => [...current, userMessage])
    setMessage('')
    setTyping(true)
    setError('')

    try {
      const response = await axios.post(
        'http://localhost:5001/api/chat',
        {
          message: userMessage.text,
          history: messages,
          policyId: recommendation?.recommendedPolicyId,
        },
        { withCredentials: true },
      )
      setMessages((current) => [...current, { role: 'assistant', text: response.data.reply || 'I could not find that answer in the policy documents.' }])
    } catch (err) {
      console.error(err)
      let errorMessage = 'Unable to answer right now. Please try again.'
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error
        
        // Add specific guidance based on error type
        if (err.response.data.type === 'context_error') {
          errorMessage = 'Please complete your profile first to get personalized answers.'
        } else if (err.response.data.type === 'policy_not_found') {
          errorMessage = 'Please get a new recommendation first to chat about policies.'
        } else if (err.response.data.type === 'ai_service_error') {
          errorMessage = 'Chat service temporarily unavailable. Please try again in a moment.'
        } else if (err.response.data.type === 'network_error') {
          errorMessage = 'Connection issue. Please check your internet and try again.'
        }
      }
      
      setError(errorMessage)
      setMessages((current) => [...current, { role: 'assistant', text: errorMessage }])
    } finally {
      setTyping(false)
    }
  }, [disabled, message, recommendation])

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
    if (event.key === 'Escape' && isOpen) {
      onToggle()
    }
  }, [handleSend, isOpen, onToggle])

  const title = useMemo(() => (isOpen ? 'Close chat' : 'Open chat'), [isOpen])

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[360px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--color-shadow)]" role="dialog" aria-modal="true" aria-labelledby="chat-title">
          <div className="flex items-center justify-between rounded-t-[24px] bg-[var(--color-primary)] px-4 py-4 text-white">
            <div>
              <p id="chat-title" className="font-semibold">PolicyMate Assistant</p>
              <p className="text-xs text-[rgba(255,255,255,0.8)]">Grounded policy explainer</p>
            </div>
            <button
              className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25 focus-visible:outline-none"
              onClick={onToggle}
              aria-label={title}
              aria-expanded="true"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div ref={chatRef} className="max-h-[360px] overflow-y-auto p-4 space-y-3 text-sm text-[var(--color-text)]" aria-live="polite">
            {messages.map((messageItem, index) => (
              <div key={`${messageItem.role}-${index}`} className={`flex ${messageItem.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-3xl px-4 py-3 ${messageItem.role === 'user' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-primary-soft)] text-[var(--color-text)]'}`}>
                  {messageItem.role === 'assistant' ? <ReactMarkdown>{messageItem.text}</ReactMarkdown> : messageItem.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-2 text-[var(--color-muted)]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-dotPulse" style={{ animationDelay: '0s' }} />
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-dotPulse" style={{ animationDelay: '0.15s' }} />
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-dotPulse" style={{ animationDelay: '0.3s' }} />
              </div>
            )}
          </div>
          <div className="border-t border-[var(--color-border)] px-4 py-3">
            <label htmlFor="chatInput" className="sr-only">
              Chat input
            </label>
            <textarea
              ref={inputRef}
              id="chatInput"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows="2"
              placeholder="Ask about waiting periods, co-pay, or your policy coverage..."
              className="w-full resize-none rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm leading-6 focus:border-[var(--color-primary)] focus:ring focus:ring-blue-200"
              aria-label="Chat message"
            />
            {error ? <p className="mt-2 text-xs text-[var(--color-error)]">{error}</p> : null}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleSend}
                disabled={!message.trim() || typing || disabled}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
      <button
        type="button"
        aria-label={title}
        aria-expanded={isOpen}
        onClick={onToggle}
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[var(--color-shadow)] transition hover:scale-[1.02] focus-visible:outline-none"
      >
        <span className="material-symbols-outlined">chat_bubble</span>
      </button>
    </div>
  )
}
