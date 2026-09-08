import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCurrentMember from '../../profile/hooks/useCurrentMember'
import { fetchGreeting, sendChatMessage } from '../api/chatbotApi'
import '../chatbot.css'

export default function ChatbotWidget() {
  const navigate = useNavigate()
  const currentMember = useCurrentMember()
  const [open, setOpen] = useState(false)
  const [greeted, setGreeted] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTop = listRef.current.scrollHeight
      }
    })
  }

  async function handleOpen() {
    setOpen(true)
    if (greeted) return
    setGreeted(true)
    setLoading(true)
    try {
      const data = await fetchGreeting()
      setMessages([{ role: 'bot', text: data.reply, action: data.action }])
    } catch (err) {
      setMessages([{ role: 'bot', text: err.message, action: null }])
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text, action: null }])
    setLoading(true)
    scrollToBottom()
    try {
      const data = await sendChatMessage(text)
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply, action: data.action }])
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', text: err.message, action: null }])
    } finally {
      setLoading(false)
      scrollToBottom()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleActionClick(action) {
    if (action?.type === 'NAVIGATE_RECORD') {
      navigate('/festival-log/new')
    }
  }

  if (!currentMember?.memberId) {
    return null
  }

  return (
    <div className="chatbot-widget">
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-panel__header">
            <span>페스티벌 AI 챗봇</span>
            <button type="button" className="chatbot-panel__close" onClick={() => setOpen(false)}>
              ✕
            </button>
          </div>
          <div className="chatbot-panel__messages" ref={listRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message chatbot-message--${msg.role}`}>
                <div className="chatbot-message__bubble">{msg.text}</div>
                {msg.action?.type === 'NAVIGATE_RECORD' && (
                  <button
                    type="button"
                    className="chatbot-message__action"
                    onClick={() => handleActionClick(msg.action)}
                  >
                    기록 만들러 가기
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="chatbot-message chatbot-message--bot">
                <div className="chatbot-message__bubble chatbot-message__bubble--loading">...</div>
              </div>
            )}
          </div>
          <div className="chatbot-panel__input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="공연 시간, 추천, 취향 분석 등을 물어보세요"
              disabled={loading}
            />
            <button type="button" onClick={handleSend} disabled={loading || !input.trim()}>
              전송
            </button>
          </div>
        </div>
      )}
      <button type="button" className="chatbot-fab" onClick={() => (open ? setOpen(false) : handleOpen())}>
        {open ? '✕' : '💬'}
      </button>
    </div>
  )
}