'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getUiCopy, type Language } from '@/lib/language'

type ChatMessage = { from: 'user' | 'assistant'; text: string }

export function ReportChat({ reportFile, language }: { reportFile: File | null; language: Language }) {
  const copy = getUiCopy(language)
  const initial = language === 'Hindi' ? 'नमस्ते — दवाओं, फॉलो-अप या रिपोर्ट की हिदायतों के बारे में पूछें।' : language === 'Hinglish' ? 'Namaste — dawa, follow-up ya report instructions ke baare mein poochhein.' : 'Hi — ask about medicines, follow-ups, instructions, or wording in this report.'
  const [question, setQuestion] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{ from: 'assistant', text: initial }])

  useEffect(() => setMessages([{ from: 'assistant', text: initial }]), [language, initial])

  async function submitQuestion() {
    const clean = question.trim()
    if (!clean || !reportFile || isSending) return
    const history = messages.slice(1).map((message) => ({ role: message.from, content: message.text }))
    setQuestion('')
    setIsSending(true)
    setMessages((current) => [...current, { from: 'user', text: clean }])
    try {
      const formData = new FormData()
      formData.append('report', reportFile)
      formData.append('question', clean)
      formData.append('history', JSON.stringify(history))
      formData.append('language', language)
      const response = await fetch('/api/reports/chat', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The report assistant could not answer that question.')
      setMessages((current) => [...current, { from: 'assistant', text: result.answer }])
    } catch (error) {
      setMessages((current) => [...current, { from: 'assistant', text: error instanceof Error ? error.message : 'Please try again.' }])
    } finally { setIsSending(false) }
  }

  return <><section className="welcome-row"><div><div className="eyebrow"><span className="live-dot" /> LIVE REPORT CHAT</div><h1>{copy.askTitle}</h1><p className="subtitle">{copy.chatHint}</p></div><div className="grounded-pill"><ShieldCheck size={16} /> Text-only · not a doctor</div></section><div className="chat-layout"><div className="chat-card"><div className="chat-header"><div className="chat-agent"><div className="chat-agent-icon"><Sparkles size={18} /></div><div><strong>{copy.askTitle}</strong><span>{isSending ? '…' : copy.source}</span></div></div></div><div className="chat-messages">{messages.map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.text}-${index}`}><div className="chat-bubble" style={{ whiteSpace: 'pre-line' }}>{message.text}{message.from === 'assistant' && <span className="source-tag"><ShieldCheck size={12} /> {copy.source}</span>}</div></div>)}</div><div className="chat-composer"><input value={question} disabled={isSending || !reportFile} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) submitQuestion() }} placeholder={copy.askTitle} aria-label={copy.askTitle} /><Button size="icon" disabled={isSending || !reportFile || !question.trim()} onClick={submitQuestion} aria-label={copy.send}><ArrowUpRight data-icon="inline-start" /></Button></div></div><aside className="suggested-card"><div className="side-card-title"><MessageCircle size={18} /><strong>{copy.askTitle}</strong></div></aside></div></>
}
