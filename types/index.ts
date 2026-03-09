export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected'

export interface Application {
  id: string
  user_id: string
  company: string
  role: string
  status: ApplicationStatus
  job_url?: string
  notes?: string
  applied_date: string
  created_at: string
  updated_at: string
}

export interface AIAnalysis {
  id: string
  application_id: string
  score: number
  feedback: string[]
  summary: string
  cover_letter?: string
  created_at: string
}

export interface AnalyzeRequest {
  job_description: string
  resume: string
}

export interface CoverLetterRequest {
  job_description: string
  resume: string
  company_name: string
  role: string
}
