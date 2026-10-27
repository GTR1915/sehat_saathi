'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ReportChat } from '@/components/report-chat'
import type { FollowUp, ReportAnalysis } from '@/lib/report-analysis'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  HeartPulse,
  Languages,
  LayoutDashboard,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Pill,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
  type LucideIcon,
} from 'lucide-react'

type Tab = 'overview' | 'care-plan' | 'safety' | 'ask-report'
type Task = { id: number; title: string; time: string; detail: string; source: string; done: boolean }

const demoAnalysis: ReportAnalysis = {
  summary: 'This demonstration report describes recovery after a heart-related hospital admission. Follow the listed medicines, keep activity gentle, and attend the cardiology follow-up. Confirm any instruction that is unclear with the care team.',
  diagnoses: ['Heart-related hospital admission'],
  medications: [
    { name: 'Metoprolol', dose: '25 mg', schedule: '8:00 AM', instructions: 'With breakfast', source: 'Medication list, page 7' },
    { name: 'Aspirin', dose: '75 mg', schedule: '8:00 AM', instructions: 'After food', source: 'Medication list, page 7' },
    { name: 'Atorvastatin', dose: '40 mg', schedule: '9:00 PM', instructions: 'At bedtime', source: 'Medication list, page 7' },
  ],
  tasks: [
    { title: 'Take Metoprolol 25 mg', timing: '8:00 AM', details: 'With breakfast', source: 'Medication list, page 7' },
    { title: 'Take Aspirin 75 mg', timing: '8:00 AM', details: 'After food', source: 'Medication list, page 7' },
    { title: 'Walk for 10 minutes', timing: '10:00 AM', details: 'Light activity only', source: 'Activity instructions, page 8' },
    { title: 'Check blood pressure', timing: '7:00 PM', details: 'Write down the reading', source: 'Discharge instructions, page 8' },
    { title: 'Take Atorvastatin 40 mg', timing: '9:00 PM', details: 'At bedtime', source: 'Medication list, page 7' },
  ],
  restrictions: [
    { title: 'Activity', details: 'Walk gently for 10–15 minutes. Stop if you feel dizzy or short of breath.', source: 'Page 8' },
    { title: 'Diet', details: 'Low-salt meals. Avoid packaged foods and drink plenty of water.', source: 'Page 8' },
  ],
  followUps: [{ clinician: 'Dr. Mehta', specialty: 'Cardiology', date: '20 June 2024', time: '10:30 AM', location: 'City Hospital', reason: 'Cardiology follow-up', source: 'Discharge summary, page 7' }],
  safetyFlags: [{ level: 'confirm', title: 'Clarify a medication instruction', details: 'The note says “hold if BP low” but does not give the medicine name or a blood-pressure threshold.', source: '“Hold if BP low” · Page 8' }],
  questionsForCareTeam: ['Which medicine should be held for a low blood-pressure reading, and what reading counts as low?'],
  disclaimer: 'This care plan is a summary of the report. Confirm it with your healthcare professional.',
}

const DEMO_REPORT_TEXT = `Patient is stable for discharge after a heart-related hospital admission.
Continue Metoprolol 25 mg with breakfast at 8:00 AM, Aspirin 75 mg after food at 8:00 AM, and Atorvastatin 40 mg at bedtime at 9:00 PM.
Walk gently for 10–15 minutes and stop if dizzy or short of breath. Follow a low-salt diet and avoid packaged foods.
Follow up with Dr. Mehta in Cardiology at City Hospital on 20 June 2024 at 10:30 AM.
Clarify which medicine to hold for low blood pressure and the relevant blood-pressure threshold.`

const navItems: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'care-plan', label: 'My care plan', icon: ClipboardCheck },
  { id: 'safety', label: 'Safety audit', icon: ShieldCheck },
  { id: 'ask-report', label: 'Ask your report', icon: MessageCircle },
]

function SourceTag({ children = 'From your report' }: { children?: string }) {
  return <span className="source-tag"><FileText size={12} /> {children}</span>
}

function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 38
  return <div className="progress-ring" aria-label={`${value}% complete`}><svg viewBox="0 0 88 88" aria-hidden="true"><circle className="ring-track" cx="44" cy="44" r="38" /><circle className="ring-value" cx="44" cy="44" r="38" strokeDasharray={circumference} strokeDashoffset={circumference - (value / 100) * circumference} /></svg><span><strong>{value}%</strong><small>done</small></span></div>
}

function followUpTitle(followUp: FollowUp) {
  return [followUp.clinician, followUp.specialty].filter(Boolean).join(' · ') || followUp.reason || 'Follow-up appointment'
}

function followUpTiming(followUp: FollowUp) {
  return [followUp.date, followUp.time, followUp.location].filter(Boolean).join(' · ')
}

function isChecklistTask(title: string, detail: string) {
  const action = `${title} ${detail}`.toLowerCase()

  // These are valuable care-plan notes, but they cannot be meaningfully checked
  // off as a single action today. Medication doses are added separately below.
  return ![
    /\b(resume|continue)\b.*\b(home )?(medications?|medicines|meds?)\b/,
    /\b(complete|finish)\b.*\b(antibiotic|antimicrobial|medication|medicine|meds?|course)\b/,
    /\b(gradual|gradually)\b.*\b(activity|activities|exercise)\b/,
    /\b(activity|activities)\s+resumption\b/,
    /\b(take|use)\b.*\b(as prescribed|as directed)\b/,
  ].some((pattern) => pattern.test(action))
}

function taskList(analysis: ReportAnalysis): Task[] {
  const reportTasks = analysis.tasks
    .filter((task) => isChecklistTask(task.title, task.details))
    .map((task) => ({
      title: task.title,
      time: task.timing || 'As directed',
      detail: task.details || 'See discharge instructions',
      source: task.source,
    }))
  const medicationTasks = analysis.medications
    .filter((medication) => medication.name && !reportTasks.some((task) => task.title.toLowerCase().includes(medication.name.toLowerCase())))
    .map((medication) => ({
      title: 'Take ' + medication.name + (medication.dose ? ' ' + medication.dose : ''),
      time: medication.schedule || 'As directed',
      detail: medication.instructions || 'See discharge instructions',
      source: medication.source,
    }))

  return [...medicationTasks, ...reportTasks].map((task, index) => ({
    id: index + 1,
    title: task.title,
    time: task.time,
    detail: task.detail,
    source: task.source,
    done: false,
  }))
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [analysis, setAnalysis] = useState<ReportAnalysis | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [language, setLanguage] = useState('English')
  const [menuOpen, setMenuOpen] = useState(false)
  const [reportName, setReportName] = useState('')
  const [reportStatus, setReportStatus] = useState('No report submitted')
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const hasReport = analysis !== null
  const completed = tasks.filter((task) => task.done).length
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0
  const greeting = useMemo(() => language === 'Hindi' ? 'नमस्ते' : language === 'Hinglish' ? 'Namaste' : 'Good morning', [language])
  const followUp = analysis?.followUps[0]
  const safetyFlag = analysis?.safetyFlags[0]

  function applyAnalysis(nextAnalysis: ReportAnalysis, name: string, status: string, file: File) {
    setAnalysis(nextAnalysis)
    setTasks(taskList(nextAnalysis))
    setReportName(name)
    setReportStatus(status)
    setReportFile(file)
  }

  function toggleTask(id: number) {
    setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task))
  }

  async function processReport(file: File) {
    setIsProcessing(true)
    setAnalysis(null)
    setTasks([])
    setReportFile(null)
    setReportName(file.name)
    setReportStatus('Processing with AI…')
    try {
      const formData = new FormData()
      formData.append('report', file)
      const response = await fetch('/api/reports', { method: 'POST', body: formData })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Could not process report')
      applyAnalysis(result.analysis as ReportAnalysis, file.name, 'AI care plan generated', file)
      setActiveTab('care-plan')
    } catch (error) {
      setReportStatus(error instanceof Error ? error.message : 'Could not process report')
    } finally {
      setIsProcessing(false)
    }
  }

  function loadDemoReport() {
    const demoFile = new File([DEMO_REPORT_TEXT], 'demo-discharge-report.txt', { type: 'text/plain' })
    applyAnalysis(demoAnalysis, 'Demo discharge report', 'Demo care plan ready', demoFile)
    setActiveTab('care-plan')
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><HeartPulse size={21} /></div><div><strong>Discharge<span>Ready</span></strong><small>care, made clearer</small></div></div>
      <div className="patient-card">{hasReport ? <><div className="avatar">PS</div><div><strong>Patient report</strong><span>Care plan active</span></div><CheckCircle2 size={17} className="patient-check" /></> : <><div className="avatar"><FileText size={15} /></div><div><strong>No patient report</strong><span>Upload a report to begin</span></div></>}</div>
      <nav className="nav-list" aria-label="Main navigation"><p className="nav-label">YOUR CARE</p>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => { setActiveTab(id); setMenuOpen(false) }}><Icon size={18} /><span>{label}</span>{id === 'safety' && analysis?.safetyFlags.length ? <span className="nav-badge">{analysis.safetyFlags.length}</span> : null}</button>)}<p className="nav-label nav-label-space">TOOLS</p><button className="nav-item"><CalendarDays size={18} /><span>Calendar reminders</span></button></nav>
      <div className="sidebar-bottom"><div className="support-card"><div className="support-icon"><ShieldCheck size={18} /></div><div><strong>Report-grounded</strong><span>Items cite their source</span></div></div><div className="sidebar-footer"><ShieldCheck size={14} /> Your data stays private</div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={21} /></button><div className="breadcrumbs"><span>My care</span><ChevronRight size={14} /><strong>{navItems.find((item) => item.id === activeTab)?.label}</strong></div><div className="top-actions"><div className="language-select"><Languages size={16} /><select value={language} onChange={(event) => setLanguage(event.target.value)} aria-label="Language"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div><button className="icon-button" aria-label="Open settings" onClick={() => setSettingsOpen(true)}><Settings size={18} /></button><button className="icon-button" aria-label="Notifications"><Bell size={18} /></button><div className="top-avatar">PS</div></div></header>

      {settingsOpen && <div className="settings-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div className="settings-panel"><div className="settings-header"><div><span className="eyebrow">AI CONNECTION</span><h2 id="settings-title">OpenRouter settings</h2></div><button className="icon-button" aria-label="Close settings" onClick={() => setSettingsOpen(false)}><X size={18} /></button></div><p className="settings-description">The API key is read from <code>OPENROUTER_API_KEY</code> on the server. It is never sent from this browser.</p><div className="model-note"><Sparkles size={15} /><span>Model: <strong>Gemini 3.1 Flash Lite</strong><small>google/gemini-3.1-flash-lite</small></span></div><Button onClick={() => setSettingsOpen(false)}>Close</Button></div></div>}

      <div className="page-wrap">
        {activeTab === 'overview' && <Overview greeting={greeting} analysis={analysis} tasks={tasks} completed={completed} progress={progress} reportName={reportName} reportStatus={reportStatus} isProcessing={isProcessing} onUpload={processReport} onDemo={loadDemoReport} onOpenPlan={() => setActiveTab('care-plan')} onOpenSafety={() => setActiveTab('safety')} onToggleTask={toggleTask} />}
        {activeTab !== 'overview' && !analysis && <EmptyState onDemo={loadDemoReport} />}
        {activeTab === 'care-plan' && analysis && <CarePlan analysis={analysis} tasks={tasks} language={language} onToggleTask={toggleTask} />}
        {activeTab === 'safety' && analysis && <SafetyAudit analysis={analysis} />}
        {activeTab === 'ask-report' && analysis && <ReportChat reportFile={reportFile} />}
      </div>
    </main>
  </div>
}

function Overview({ greeting, analysis, tasks, completed, progress, reportName, reportStatus, isProcessing, onUpload, onDemo, onOpenPlan, onOpenSafety, onToggleTask }: { greeting: string; analysis: ReportAnalysis | null; tasks: Task[]; completed: number; progress: number; reportName: string; reportStatus: string; isProcessing: boolean; onUpload: (file: File) => void; onDemo: () => void; onOpenPlan: () => void; onOpenSafety: () => void; onToggleTask: (id: number) => void }) {
  const followUp = analysis?.followUps[0]
  const safetyFlag = analysis?.safetyFlags[0]
  return <>
    <section className="welcome-row"><div><div className="eyebrow"><span className="live-dot" /> CARE PLAN</div><h1>{greeting}</h1><p className="subtitle">Upload a discharge report for a clear, report-grounded recovery plan.</p></div></section>
    <section className="report-upload-panel"><div className="upload-copy"><div className="upload-icon"><Upload size={19} /></div><div><strong>Upload a discharge report</strong><p>PDF text is extracted on our server. Only the extracted text is sent to the AI.</p><span className="upload-status">{reportName ? `${reportName} · ${reportStatus}` : 'No report submitted'}</span></div></div><div className="upload-actions"><label className={`upload-button ${isProcessing ? 'disabled' : ''}`}><Upload size={16} /> {isProcessing ? 'Processing…' : 'Choose report'}<input type="file" accept=".pdf,.txt,text/plain,application/pdf" disabled={isProcessing} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file) }} /></label><button className="demo-button" onClick={onDemo}>Use demo report</button></div></section>
    {!analysis ? <EmptyState onDemo={onDemo} /> : <>
      <section className="hero-banner"><div className="hero-glow" /><div className="hero-copy"><span className="mini-label"><Sparkles size={14} /> REPORT EXTRACTED</span><h2>Your care plan is ready to review.</h2><p>{tasks.length ? `${completed} of ${tasks.length} report-grounded tasks completed.` : 'No specific checklist items were found in this report.'} Confirm anything unclear with your care team.</p><Button onClick={onOpenPlan}>View your care plan <ArrowUpRight data-icon="inline-end" /></Button></div><ProgressRing value={progress} /></section>
      <div className="content-grid"><section className="main-column"><div className="section-heading"><div><h2>Today&apos;s checklist</h2><p>Actions extracted from your report</p></div><button className="text-button" onClick={onOpenPlan}>See full plan <ChevronRight size={15} /></button></div><div className="task-list">{tasks.length ? tasks.map((task) => <button className={`task-row ${task.done ? 'task-done' : ''}`} key={task.id} onClick={() => onToggleTask(task.id)}><span className="task-check">{task.done && <Check size={14} />}</span><span className="task-content"><strong>{task.title}</strong><small>{task.time} · {task.detail}</small></span><ChevronRight size={17} className="task-arrow" /></button>) : <div className="task-row"><span className="task-content"><strong>No checklist actions found</strong><small>Review the plan and confirm follow-up needs with your care team.</small></span></div>}</div><div className="section-heading reports-heading"><div><h2>Recent report</h2><p>Your source document and AI extraction</p></div></div><div className="report-card"><div className="report-icon"><FileText size={21} /></div><div className="report-info"><strong>{reportName}</strong><span>Added today · structured care plan</span><SourceTag>{reportStatus}</SourceTag></div><button className="more-button" aria-label="More report options"><MoreHorizontal size={19} /></button></div></section>
      <aside className="right-column"><div className="section-heading"><div><h2>Upcoming</h2><p>Next item from your report</p></div></div>{followUp ? <div className="upcoming-card"><div className="upcoming-date"><strong>{followUp.date || '—'}</strong><span>{followUp.time || 'FOLLOW-UP'}</span></div><div><span className="event-label">FOLLOW-UP</span><strong>{followUpTitle(followUp)}</strong><small>{[followUp.location, followUp.reason].filter(Boolean).join(' · ') || 'See your care team'}</small></div><ChevronRight size={17} /></div> : <div className="upcoming-card"><div><span className="event-label">NO FOLLOW-UP FOUND</span><strong>Confirm your next appointment</strong><small>Your report did not include appointment details.</small></div></div>}<div className="section-heading medication-heading"><div><h2>Medicines</h2><p>Only items listed in your report</p></div><button className="text-button" onClick={onOpenPlan}>See schedule <ChevronRight size={15} /></button></div><div className="med-list">{analysis.medications.length ? analysis.medications.map((medication, index) => <div className="med-row" key={`${medication.name}-${index}`}><div className={`med-icon ${['teal', 'blue', 'purple'][index % 3]}`}><Pill size={18} /></div><div><strong>{medication.name} <span>{medication.dose}</span></strong><small>{medication.schedule || 'As directed'} · {medication.instructions || 'See discharge instructions'}</small></div></div>) : <div className="med-row"><div><strong>No discharge medicines found</strong><small>Check the source report or confirm with the care team.</small></div></div>}</div>{safetyFlag && <div className="safety-note"><AlertTriangle size={17} /><div><strong>{safetyFlag.title}</strong><span>{safetyFlag.details} <button onClick={onOpenSafety}>Review safety audit</button></span></div></div>}</aside></div>
    </>}
  </>
}

function EmptyState({ onDemo }: { onDemo: () => void }) {
  return <section className="empty-report-state"><div className="empty-report-icon"><FileText size={24} /></div><h2>Your care plan will appear here</h2><p>Submit a discharge report to generate patient-specific medicines, tasks, appointments, and safety guidance.</p><button className="demo-button" onClick={onDemo}>Load demo report</button></section>
}

function CarePlan({ analysis, tasks, language, onToggleTask }: { analysis: ReportAnalysis; tasks: Task[]; language: string; onToggleTask: (id: number) => void }) {
  const followUp = analysis.followUps[0]
  return <><section className="welcome-row"><div><div className="eyebrow"><span className="live-dot" /> AI-GENERATED CARE PLAN</div><h1>Your care plan</h1><p className="subtitle">A clear, source-grounded guide for recovery after discharge.</p></div></section><div className="plan-layout"><div className="plan-main"><div className="plan-card"><div className="plan-card-header"><div><span className="mini-label teal-label"><Sparkles size={14} /> SIMPLIFIED SUMMARY · {language.toUpperCase()}</span><h2>What happened &amp; what matters now</h2></div></div><p>{analysis.summary}</p>{analysis.diagnoses.length > 0 && <p><strong>Reported diagnoses:</strong> {analysis.diagnoses.join(', ')}</p>}<SourceTag>Generated only from your uploaded report</SourceTag></div><div className="section-heading inner-heading"><div><h2>Medication schedule</h2><p>Never change a dose without asking your healthcare professional.</p></div></div><div className="schedule-card">{analysis.medications.length ? analysis.medications.map((medication, index) => <div className="schedule-row" key={`${medication.name}-${index}`}><div className="time-column"><strong>{medication.schedule || 'As directed'}</strong><span>Report instruction</span></div><div className={`med-icon ${['teal', 'blue', 'purple'][index % 3]}`}><Pill size={18} /></div><div className="schedule-info"><strong>{medication.name} <span>{medication.dose}</span></strong><small>{medication.instructions || 'See discharge instructions'}</small><SourceTag>{medication.source}</SourceTag></div></div>) : <div className="schedule-row"><div className="schedule-info"><strong>No discharge medicines found</strong><small>Confirm the medication plan directly with your care team.</small></div></div>}</div><div className="two-cards">{analysis.restrictions.length ? analysis.restrictions.map((restriction, index) => <div className="small-plan-card" key={`${restriction.title}-${index}`}><div className={`small-card-icon ${index % 2 ? 'orange' : 'green'}`}><Activity size={18} /></div><h3>{restriction.title}</h3><p>{restriction.details}</p><SourceTag>{restriction.source}</SourceTag></div>) : <div className="small-plan-card"><div className="small-card-icon green"><Activity size={18} /></div><h3>No restrictions extracted</h3><p>The report did not state activity or diet restrictions.</p></div>}</div></div><aside className="plan-side"><div className="side-card"><div className="side-card-title"><ClipboardCheck size={18} /><strong>Today&apos;s progress</strong></div>{tasks.length ? tasks.map((task) => <button className="mini-task" key={task.id} onClick={() => onToggleTask(task.id)}><span className={`task-check ${task.done ? 'checked' : ''}`}>{task.done && <Check size={12} />}</span><span>{task.title}</span></button>) : <p>No tasks extracted from this report.</p>}</div><div className="side-card followup-card"><div className="side-card-title"><CalendarDays size={18} /><strong>Next follow-up</strong></div>{followUp ? <><strong className="followup-name">{followUpTitle(followUp)}</strong><span>{followUpTiming(followUp) || followUp.reason}</span><SourceTag>{followUp.source}</SourceTag></> : <span>No follow-up appointment was found in the report.</span>}</div></aside></div><div className="disclaimer"><AlertTriangle size={15} /><span>{analysis.disclaimer}</span></div></>
}

function SafetyAudit({ analysis }: { analysis: ReportAnalysis }) {
  return <><section className="welcome-row"><div><div className="eyebrow"><span className="live-dot amber" /> SAFETY REVIEW</div><h1>Safety audit</h1><p className="subtitle">Potentially important items identified directly from your report.</p></div></section><div className="audit-banner"><div className="audit-shield"><ShieldCheck size={25} /></div><div><strong>Source-grounded safety review</strong><p>Flags are extracted from the report. They are not new medical advice.</p></div><CheckCircle2 size={22} className="audit-check" /></div>{analysis.safetyFlags.length ? <div className="agent-grid">{analysis.safetyFlags.map((flag, index) => <div className="agent-card" key={`${flag.title}-${index}`}><div className="agent-top"><span className="agent-number">{String(index + 1).padStart(2, '0')}</span><div className={`agent-icon ${flag.level === 'urgent' ? 'review' : 'done'}`}><AlertTriangle size={20} /></div><span className={`agent-status ${flag.level === 'urgent' ? 'review' : 'done'}`}>{flag.level === 'urgent' ? 'Urgent' : flag.level === 'confirm' ? 'Confirm' : 'Review'}</span></div><h2>{flag.title}</h2><p>{flag.details}</p><SourceTag>{flag.source}</SourceTag></div>)}</div> : <div className="warning-card"><div className="warning-icon"><ShieldCheck size={21} /></div><div className="warning-content"><span className="warning-label">NO FLAGS EXTRACTED</span><h2>No specific safety flags were found</h2><p>This does not replace instructions from your healthcare professional or emergency care when needed.</p></div></div>}{analysis.questionsForCareTeam.length > 0 && <div className="warning-card"><div className="warning-icon"><AlertTriangle size={21} /></div><div className="warning-content"><span className="warning-label">QUESTIONS FOR YOUR CARE TEAM</span><h2>Items to confirm</h2><p>{analysis.questionsForCareTeam.join(' ')}</p></div></div>}<div className="disclaimer"><AlertTriangle size={15} /><span>{analysis.disclaimer}</span></div></>
}

function AskReport({ analysis }: { analysis: ReportAnalysis }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([{ from: 'assistant', text: 'Ask about medicines, tasks, follow-ups, or safety items in the extracted care plan.' }])

  function submitQuestion() {
    const clean = question.trim()
    if (!clean) return
    const searchTerms = clean.toLowerCase().split(/\W+/).filter((term) => term.length > 2)
    const items = [
      ...analysis.medications.map((item) => `Medicine: ${item.name} ${item.dose}. ${item.schedule}. ${item.instructions}. Source: ${item.source}`),
      ...analysis.tasks.map((item) => `Task: ${item.title}. ${item.timing}. ${item.details}. Source: ${item.source}`),
      ...analysis.followUps.map((item) => `Follow-up: ${[item.clinician, item.specialty, item.date, item.time, item.location, item.reason].filter(Boolean).join(' · ')}. Source: ${item.source}`),
      ...analysis.restrictions.map((item) => `${item.title}: ${item.details}. Source: ${item.source}`),
      ...analysis.safetyFlags.map((item) => `Safety item: ${item.title}. ${item.details}. Source: ${item.source}`),
    ]
    const matches = items.filter((item) => searchTerms.some((term) => item.toLowerCase().includes(term))).slice(0, 3)
    const answer = matches.length ? matches.join('\n\n') : `The extracted care plan does not state a specific answer to that question. Summary: ${analysis.summary}\n\nPlease confirm with your care team rather than making a change based on missing information.`
    setMessages((current) => [...current, { from: 'user', text: clean }, { from: 'assistant', text: answer }])
    setQuestion('')
  }

  return <><section className="welcome-row"><div><div className="eyebrow"><span className="live-dot" /> REPORT-GROUNDED CHAT</div><h1>Ask your report</h1><p className="subtitle">Answers use the care plan extracted from your uploaded report.</p></div><div className="grounded-pill"><ShieldCheck size={16} /> Report-grounded</div></section><div className="chat-layout"><div className="chat-card"><div className="chat-header"><div className="chat-agent"><div className="chat-agent-icon"><Sparkles size={18} /></div><div><strong>Report assistant</strong><span>Uses extracted report data</span></div></div></div><div className="chat-messages">{messages.map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.text}-${index}`}><div className="chat-bubble" style={{ whiteSpace: 'pre-line' }}>{message.text}{message.from === 'assistant' && <SourceTag>Extracted care plan</SourceTag>}</div></div>)}</div><div className="chat-composer"><input value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitQuestion() }} placeholder="Ask about your report..." aria-label="Ask your report" /><Button size="icon" onClick={submitQuestion} aria-label="Send question"><ArrowUpRight data-icon="inline-start" /></Button></div></div><aside className="suggested-card"><div className="side-card-title"><MessageCircle size={18} /><strong>Try asking</strong></div>{['When should I take my medicines?', 'What restrictions are listed?', 'When is my follow-up?'].map((prompt) => <button className="suggested-question" key={prompt} onClick={() => setQuestion(prompt)}>{prompt}<ArrowUpRight size={15} /></button>)}<div className="chat-note"><ShieldCheck size={15} /> If the report does not state an answer, confirm with your care team.</div></aside></div></>
}
