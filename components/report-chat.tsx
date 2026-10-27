'use client'

import { useState } from 'react'
import { ArrowUpRight, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ChatMessage = {
  from: 'user' | 'assistant'
  text: string
}

export function ReportChat({ reportFile }: { reportFile: File | null }) {
  const [question, setQuestion] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: 'assistant',
      text: 'Hi — ask me about medicines, follow-ups, instructions, or wording in this report. I will use the report text and let you know when it does not contain an answer.',
    },
  ])

  async function submitQuestion() {
    const clean = question.trim()
    if (!clean || !reportFile || isSending) return

    const history = messages.slice(1).map((message) => ({
      role: message.from,
      content: message.text,
    }))

    setQuestion('')
    setIsSending(true)
    setMessages((current) => [...current, { from: 'user', text: clean }])

    try {
      const formData = new FormData()
      formData.append('report', reportFile)
      formData.append('question', clean)
      formData.append('history', JSON.stringify(history))

      const response = await fetch('/api/reports/chat', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'The report assistant could not answer that question.')

      setMessages((current) => [...current, { from: 'assistant', text: result.answer }])
    } catch (error) {
      setMessages((current) => [...current, {
        from: 'assistant',
        text: error instanceof Error ? error.message : 'The report assistant could not answer that question. Please try again.',
      }])
    } finally {
      setIsSending(false)
    }
  }

  return <><section className="welcome-row"><div><div className="eyebrow"><span className="live-dot" /> LIVE REPORT CHAT</div><h1>Ask your report</h1><p className="subtitle">Ask a question in your own words. The assistant asks Gemini using only the extracted report text.</p></div><div className="grounded-pill"><ShieldCheck size={16} /> Text-only · not a doctor</div></section><div className="chat-layout"><div className="chat-card"><div className="chat-header"><div className="chat-agent"><div className="chat-agent-icon"><Sparkles size={18} /></div><div><strong>AI report assistant</strong><span>{isSending ? 'Thinking…' : 'Ready · report-grounded'}</span></div></div></div><div className="chat-messages">{messages.map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.text}-${index}`}><div className="chat-bubble" style={{ whiteSpace: 'pre-line' }}>{message.text}{message.from === 'assistant' && <span className="source-tag"><ShieldCheck size={12} /> Report-grounded AI response</span>}</div></div>)}</div><div className="chat-composer"><input value={question} disabled={isSending || !reportFile} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) submitQuestion() }} placeholder={reportFile ? 'Ask something about your report…' : 'Re-upload the report to start chat'} aria-label="Ask your report" /><Button size="icon" disabled={isSending || !reportFile || !question.trim()} onClick={submitQuestion} aria-label="Send question"><ArrowUpRight data-icon="inline-start" /></Button></div></div><aside className="suggested-card"><div className="side-card-title"><MessageCircle size={18} /><strong>Try asking</strong></div>{['When should I take my medicines?', 'What restrictions are listed?', 'When is my follow-up?'].map((prompt) => <button className="suggested-question" key={prompt} disabled={isSending || !reportFile} onClick={() => setQuestion(prompt)}>{prompt}<ArrowUpRight size={15} /></button>)}<div className="chat-note"><ShieldCheck size={15} /> For new symptoms, emergencies, or changes to treatment, contact a healthcare professional.</div></aside></div></>
}
