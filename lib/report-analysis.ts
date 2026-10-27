export type Medication = {
  name: string
  dose: string
  schedule: string
  instructions: string
  source: string
}

export type CareTask = {
  title: string
  timing: string
  details: string
  source: string
}

export type Restriction = {
  title: string
  details: string
  source: string
}

export type FollowUp = {
  clinician: string
  specialty: string
  date: string
  time: string
  location: string
  reason: string
  source: string
}

export type SafetyFlag = {
  level: 'urgent' | 'confirm' | 'info'
  title: string
  details: string
  source: string
}

export type ReportAnalysis = {
  summary: string
  diagnoses: string[]
  medications: Medication[]
  tasks: CareTask[]
  restrictions: Restriction[]
  followUps: FollowUp[]
  safetyFlags: SafetyFlag[]
  questionsForCareTeam: string[]
  disclaimer: string
}
