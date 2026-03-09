'use client'
import { useState } from 'react'
import { Application } from '@/types'
import { X, Brain, Sparkles, Copy, Check } from 'lucide-react'

const AS = `
  .ai-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); }
  .ai-box { background: #0d1624; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; width: 100%; max-width: 680px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 32px 80px rgba(0,0,0,0.6); font-family: 'DM Sans', sans-serif; animation: modalIn 0.2s cubic-bezier(0.16,1,0.3,1); }
  @keyframes modalIn { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }
  .ai-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; }
  .ai-head-left { display: flex; align-items: center; gap: 12px; }
  .ai-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, rgba(99,179,237,0.15), rgba(34,211,238,0.15)); border: 1px solid rgba(99,179,237,0.25); display: flex; align-items: center; justify-content: center; }
  .ai-head-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 16px; color: #f0f4ff; }
  .ai-head-sub { font-size: 12px; color: #3d5070; margin-top: 1px; }
  .ai-close { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #3d5070; transition: background 0.15s; }
  .ai-close:hover { background: rgba(255,255,255,0.05); }
  .ai-tabs { display: flex; padding: 0 24px; border-bottom: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; }
  .ai-tab { padding: 12px 16px; font-size: 13px; font-weight: 500; color: #3d5070; background: none; border: none; cursor: pointer; position: relative; transition: color 0.15s; font-family: 'DM Sans', sans-serif; }
  .ai-tab.active { color: #63b3ed; }
  .ai-tab.active::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: #63b3ed; border-radius: 2px 2px 0 0; }
  .ai-body { overflow-y: auto; flex: 1; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
  .ai-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ai-field label { display: block; font-size: 11px; color: #4b5a72; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 7px; }
  .ai-textarea { width: 100%; background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #f0f4ff; font-family: 'DM Sans', sans-serif; outline: none; resize: vertical; min-height: 110px; line-height: 1.6; box-sizing: border-box; transition: border-color 0.15s; }
  .ai-textarea::placeholder { color: #1e2d42; }
  .ai-textarea:focus { border-color: rgba(99,179,237,0.4); }
  .ai-btn { width: 100%; padding: 13px; border-radius: 10px; border: none; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
  .ai-btn:not(:disabled) { background: linear-gradient(135deg, #63b3ed, #22d3ee); color: #080c14; }
  .ai-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,179,237,0.3); }
  .ai-btn:disabled { background: #111827; color: #2d3f58; cursor: not-allowed; }
  .ai-error { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #f87171; }
  .ai-result { background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; }
  .ai-score-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
  .ai-score-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 42px; line-height: 1; }
  .ai-score-label { font-size: 10px; color: #3d5070; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px; }
  .ai-score-summary { font-size: 13px; color: #64748b; }
  .ai-feedback-item { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: #64748b; margin-bottom: 8px; line-height: 1.5; }
  .ai-cover-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .ai-cover-label { font-size: 10px; color: #3d5070; text-transform: uppercase; letter-spacing: 0.8px; }
  .ai-copy-btn { display: flex; align-items: center; gap: 6px; font-size: 12px; background: none; border: none; cursor: pointer; padding: 5px 10px; border-radius: 7px; transition: background 0.15s; font-family: 'DM Sans', sans-serif; }
  .ai-copy-btn:hover { background: rgba(255,255,255,0.05); }
  .ai-cover-text { padding: 16px; font-size: 13px; color: #64748b; line-height: 1.75; white-space: pre-wrap; font-family: 'DM Sans', sans-serif; }
`

interface Props { app: Application; onClose: () => void }

export default function AIModal({ app, onClose }: Props) {
  const [tab, setTab] = useState<'analyze' | 'cover'>('analyze')
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ score: number; feedback: string[]; summary: string } | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  async function handleAnalyze() {
    if (!jobDescription || !resume) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_URL}/ai/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_description: jobDescription, resume }) })
      if (!res.ok) throw new Error()
      setResult(await res.json())
    } catch { setError('Failed to analyze. Make sure the API server is running.') }
    setLoading(false)
  }

  async function handleCoverLetter() {
    if (!jobDescription || !resume) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`${API_URL}/ai/cover-letter`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_description: jobDescription, resume, company_name: app.company, role: app.role }) })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setCoverLetter(data.cover_letter)
    } catch { setError('Failed to generate. Make sure the API server is running.') }
    setLoading(false)
  }

  const scoreColor = result ? (result.score >= 70 ? '#34d399' : result.score >= 40 ? '#fbbf24' : '#f87171') : '#3d5070'
  const canRun = !!jobDescription && !!resume && !loading

  return (
    <div className="ai-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{AS}</style>
      <div className="ai-box">
        <div className="ai-head">
          <div className="ai-head-left">
            <div className="ai-icon"><Brain size={16} color="#63b3ed" /></div>
            <div>
              <div className="ai-head-title">AI Assistant</div>
              <div className="ai-head-sub">{app.role} @ {app.company}</div>
            </div>
          </div>
          <button className="ai-close" onClick={onClose}><X size={17} color="#4b5a72" /></button>
        </div>

        <div className="ai-tabs">
          <button className={`ai-tab ${tab === 'analyze' ? 'active' : ''}`} onClick={() => setTab('analyze')}>📊 Match Score</button>
          <button className={`ai-tab ${tab === 'cover' ? 'active' : ''}`} onClick={() => setTab('cover')}>✉️ Cover Letter</button>
        </div>

        <div className="ai-body">
          <div className="ai-row">
            <div className="ai-field">
              <label>Job Description *</label>
              <textarea className="ai-textarea" value={jobDescription} onChange={e => setJobDescription(e.target.value)} placeholder="Paste the job description here..." />
            </div>
            <div className="ai-field">
              <label>Your Resume *</label>
              <textarea className="ai-textarea" value={resume} onChange={e => setResume(e.target.value)} placeholder="Paste your resume text here..." />
            </div>
          </div>

          {error && <div className="ai-error">{error}</div>}

          {tab === 'analyze' && (
            <>
              <button className="ai-btn" onClick={handleAnalyze} disabled={!canRun}>
                <Sparkles size={15} /> {loading ? 'Analyzing...' : 'Analyze Match'}
              </button>
              {result && (
                <div className="ai-result">
                  <div className="ai-score-row">
                    <div className="ai-score-num" style={{ color: scoreColor }}>{result.score}</div>
                    <div>
                      <div className="ai-score-label">Match Score</div>
                      <div className="ai-score-summary">{result.summary}</div>
                    </div>
                  </div>
                  {result.feedback.map((f, i) => (
                    <div key={i} className="ai-feedback-item">
                      <span style={{ color: scoreColor, marginTop: 2 }}>•</span> {f}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'cover' && (
            <>
              <button className="ai-btn" onClick={handleCoverLetter} disabled={!canRun}>
                <Sparkles size={15} /> {loading ? 'Generating...' : 'Generate Cover Letter'}
              </button>
              {coverLetter && (
                <div className="ai-result" style={{ padding: 0 }}>
                  <div className="ai-cover-head">
                    <span className="ai-cover-label">Generated Cover Letter</span>
                    <button className="ai-copy-btn" style={{ color: copied ? '#34d399' : '#63b3ed' }} onClick={() => { navigator.clipboard.writeText(coverLetter); setCopied(true); setTimeout(() => setCopied(false), 2000) }}>
                      {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                  <div className="ai-cover-text">{coverLetter}</div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}