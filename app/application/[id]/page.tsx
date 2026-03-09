'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Application, ApplicationStatus } from '@/types'
import { useRouter, useParams } from 'next/navigation'
import AIModal from '@/components/AIModal'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  applied:   { label: 'Applied',   bg: 'rgba(99,179,237,0.08)',  color: '#63b3ed', border: 'rgba(99,179,237,0.25)'  },
  interview: { label: 'Interview', bg: 'rgba(251,191,36,0.08)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)'  },
  offer:     { label: 'Offer',     bg: 'rgba(52,211,153,0.08)',  color: '#34d399', border: 'rgba(52,211,153,0.25)'  },
  rejected:  { label: 'Rejected',  bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
}

const STATUSES: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected']

const PS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .page-root { min-height: 100vh; background: #080c14; color: #f0f4ff; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  .bg-glow { position: fixed; pointer-events: none; border-radius: 50%; }
  .bg-g1 { top: -10%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,179,237,0.06) 0%, transparent 65%); }
  .bg-g2 { bottom: -10%; left: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 65%); }
  .bg-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px); background-size: 48px 48px; }
  .p-nav { position: sticky; top: 0; z-index: 30; background: rgba(8,12,20,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.07); }
  .p-nav-inner { max-width: 900px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .nav-logo-icon { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, #63b3ed, #22d3ee); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: #080c14; }
  .nav-logo-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #f0f4ff; }
  .back-btn { display: flex; align-items: center; gap: 7px; font-size: 13px; color: #4b5a72; background: none; border: none; cursor: pointer; padding: 7px 12px; border-radius: 8px; transition: background 0.15s, color 0.15s; font-family: 'DM Sans', sans-serif; }
  .back-btn:hover { background: rgba(255,255,255,0.05); color: #94a3b8; }
  .p-main { max-width: 900px; margin: 0 auto; padding: 36px 24px; position: relative; z-index: 1; }
  .p-hero { margin-bottom: 32px; animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1); }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .p-company { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; color: #f0f4ff; letter-spacing: -0.8px; margin-bottom: 6px; }
  .p-role { font-size: 18px; color: #4b5a72; margin-bottom: 16px; }
  .p-meta-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .status-badge { display: inline-flex; align-items: center; font-size: 12px; font-weight: 500; padding: 5px 14px; border-radius: 100px; border: 1px solid; }
  .meta-chip { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: #4b5a72; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 100px; padding: 5px 12px; font-family: 'JetBrains Mono', monospace; }
  .p-grid { display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
  @media (max-width: 768px) { .p-grid { grid-template-columns: 1fr; } .p-company { font-size: 28px; } }
  .p-card { background: #0d1624; border: 1px solid rgba(255,255,255,0.07); border-radius: 18px; padding: 24px; }
  .p-card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; color: #3d5070; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; }
  .notes-area { width: 100%; background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px 16px; font-size: 14px; color: #f0f4ff; font-family: 'DM Sans', sans-serif; outline: none; resize: vertical; min-height: 160px; line-height: 1.7; transition: border-color 0.15s; box-sizing: border-box; }
  .notes-area::placeholder { color: #1e2d42; }
  .notes-area:focus { border-color: rgba(99,179,237,0.4); }
  .save-btn { margin-top: 12px; padding: 10px 20px; border-radius: 10px; border: none; background: linear-gradient(135deg, #63b3ed, #22d3ee); color: #080c14; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
  .save-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,179,237,0.3); }
  .save-btn:disabled { background: #1a2235; color: #2d3f58; cursor: not-allowed; transform: none; box-shadow: none; }
  .saved-msg { font-size: 12px; color: #34d399; margin-top: 8px; }
  .status-select { width: 100%; background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 11px 14px; font-size: 14px; color: #f0f4ff; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; transition: border-color 0.15s; margin-bottom: 12px; }
  .status-select:focus { border-color: rgba(99,179,237,0.4); }
  .job-link { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px; border-radius: 10px; border: 1px solid rgba(99,179,237,0.2); background: rgba(99,179,237,0.05); color: #63b3ed; font-size: 13px; text-decoration: none; transition: background 0.15s, border-color 0.15s; margin-bottom: 12px; }
  .job-link:hover { background: rgba(99,179,237,0.1); border-color: rgba(99,179,237,0.35); }
  .ai-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px; border-radius: 10px; border: none; background: linear-gradient(135deg, rgba(99,179,237,0.15), rgba(34,211,238,0.15)); color: #63b3ed; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; border: 1px solid rgba(99,179,237,0.2); }
  .ai-btn:hover { background: linear-gradient(135deg, rgba(99,179,237,0.25), rgba(34,211,238,0.25)); }
  .delete-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px; border-radius: 10px; border: 1px solid rgba(248,113,113,0.15); background: rgba(248,113,113,0.05); color: #f87171; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; margin-top: 8px; }
  .delete-btn:hover { background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.3); }
  .detail-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #3d5070; }
  .detail-value { color: #94a3b8; font-family: 'JetBrains Mono', monospace; font-size: 12px; }
  .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 12px 0; }
  .skeleton { background: #0d1624; border-radius: 18px; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
`

export default function ApplicationPage() {
  const { id } = useParams<{ id: string }>()
  const [app, setApp] = useState<Application | null>(null)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<ApplicationStatus>('applied')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadApp() }, [id])

  async function loadApp() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase.from('applications').select('*').eq('id', id).eq('user_id', user.id).single()
    if (!data) { router.push('/dashboard'); return }
    setApp(data)
    setNotes(data.notes || '')
    setStatus(data.status)
    setLoading(false)
  }

  async function saveNotes() {
    if (!app) return
    setSaving(true)
    await supabase.from('applications').update({ notes, updated_at: new Date().toISOString() }).eq('id', app.id)
    setApp(prev => prev ? { ...prev, notes } : prev)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function saveStatus(newStatus: ApplicationStatus) {
    if (!app) return
    setStatus(newStatus)
    await supabase.from('applications').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', app.id)
    setApp(prev => prev ? { ...prev, status: newStatus } : prev)
  }

  async function deleteApp() {
    if (!app || !confirm('Delete this application?')) return
    await supabase.from('applications').delete().eq('id', app.id)
    router.push('/dashboard')
  }

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.applied
  const daysAgo = app ? Math.floor((Date.now() - new Date(app.applied_date).getTime()) / 86400000) : 0
  const appliedDate = app ? new Date(app.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''
  const createdDate = app ? new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

  return (
    <div className="page-root">
      <style>{PS}</style>
      <div className="bg-glow bg-g1" />
      <div className="bg-glow bg-g2" />
      <div className="bg-grid" />

      <nav className="p-nav">
        <div className="p-nav-inner">
          <a className="nav-logo" href="/dashboard">
            <div className="nav-logo-icon">J</div>
            <span className="nav-logo-name">JobTrackr</span>
          </a>
          <button className="back-btn" onClick={() => router.push('/dashboard')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to dashboard
          </button>
        </div>
      </nav>

      <main className="p-main">
        {loading ? (
          <div>
            <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 24, width: '25%', marginBottom: 24 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
              <div className="skeleton" style={{ height: 320 }} />
              <div className="skeleton" style={{ height: 320 }} />
            </div>
          </div>
        ) : app ? (
          <>
            <div className="p-hero">
              <div className="p-company">{app.company}</div>
              <div className="p-role">{app.role}</div>
              <div className="p-meta-row">
                <span className="status-badge" style={{ background: statusCfg.bg, color: statusCfg.color, borderColor: statusCfg.border }}>
                  {statusCfg.label}
                </span>
                <span className="meta-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Applied {appliedDate}
                </span>
                <span className="meta-chip">{daysAgo === 0 ? 'Today' : `${daysAgo} days ago`}</span>
              </div>
            </div>

            <div className="p-grid">
              {/* Left — Notes */}
              <div>
                <div className="p-card">
                  <div className="p-card-title">Notes</div>
                  <textarea
                    className="notes-area"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add interview notes, recruiter contact, salary info, follow-up dates..."
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="save-btn" onClick={saveNotes} disabled={saving || notes === (app.notes || '')}>
                      {saving ? 'Saving...' : 'Save Notes'}
                    </button>
                    {saved && <span className="saved-msg">✓ Saved</span>}
                  </div>
                </div>
              </div>

              {/* Right — Actions + Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Status */}
                <div className="p-card">
                  <div className="p-card-title">Status</div>
                  <select className="status-select" value={status} onChange={e => saveStatus(e.target.value as ApplicationStatus)}>
                    {STATUSES.map(s => <option key={s} value={s} style={{ background: '#111827' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>

                  {app.job_url && (
                    <a className="job-link" href={app.job_url} target="_blank" rel="noopener noreferrer">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      View Job Posting
                    </a>
                  )}

                  <button className="ai-btn" onClick={() => setShowAI(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>
                    AI Analyze
                  </button>

                  <div className="divider" />
                  <button className="delete-btn" onClick={deleteApp}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    Delete Application
                  </button>
                </div>

                {/* Details */}
                <div className="p-card">
                  <div className="p-card-title">Details</div>
                  <div className="detail-row">
                    <span className="detail-label">Company</span>
                    <span className="detail-value">{app.company}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">{app.role}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Applied</span>
                    <span className="detail-value">{appliedDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Added</span>
                    <span className="detail-value">{createdDate}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">ID</span>
                    <span className="detail-value" style={{ fontSize: 10 }}>{app.id.slice(0, 8)}...</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>

      {showAI && app && <AIModal app={app} onClose={() => setShowAI(false)} />}
    </div>
  )
}