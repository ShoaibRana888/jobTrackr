'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Application } from '@/types'
import ApplicationCard from '@/components/ApplicationCard'
import ApplicationModal from '@/components/ApplicationModal'
import AIModal from '@/components/AIModal'
import { useRouter } from 'next/navigation'

const STATUSES = [
  { key: 'applied',   label: 'Applied',    icon: '📤', color: '#63b3ed' },
  { key: 'interview', label: 'Interview',  icon: '🎯', color: '#fbbf24' },
  { key: 'offer',     label: 'Offer',      icon: '🏆', color: '#34d399' },
  { key: 'rejected',  label: 'Rejected',   icon: '✕',  color: '#f87171' },
] as const

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .dash-root { min-height: 100vh; background: #080c14; color: #f0f4ff; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
  .bg-glow { position: fixed; pointer-events: none; border-radius: 50%; }
  .bg-glow-1 { top: -8%; right: -8%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(99,179,237,0.06) 0%, transparent 65%); }
  .bg-glow-2 { bottom: -12%; left: -8%; width: 700px; height: 700px; background: radial-gradient(circle, rgba(34,211,238,0.04) 0%, transparent 65%); }
  .bg-grid { position: fixed; inset: 0; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,0.013) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.013) 1px, transparent 1px); background-size: 48px 48px; }
  .dash-nav { position: sticky; top: 0; z-index: 30; background: rgba(8,12,20,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255,255,255,0.07); }
  .dash-nav-inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; height: 60px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { display: flex; align-items: center; gap: 10px; }
  .nav-logo-icon { width: 32px; height: 32px; border-radius: 9px; background: linear-gradient(135deg, #63b3ed, #22d3ee); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 14px; color: #080c14; box-shadow: 0 0 16px rgba(99,179,237,0.3); }
  .nav-logo-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #f0f4ff; }
  .nav-right { display: flex; align-items: center; gap: 16px; }
  .nav-email { font-size: 13px; color: #3d5070; }
  .nav-logout { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4b5a72; background: none; border: none; cursor: pointer; padding: 6px 12px; border-radius: 8px; transition: background 0.15s, color 0.15s; font-family: 'DM Sans', sans-serif; }
  .nav-logout:hover { background: rgba(255,255,255,0.05); color: #94a3b8; }
  .dash-main { max-width: 1280px; margin: 0 auto; padding: 32px 24px; position: relative; z-index: 1; }
  .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 32px; }
  .dash-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 28px; color: #f0f4ff; letter-spacing: -0.5px; margin-bottom: 4px; }
  .dash-subtitle { font-size: 14px; color: #3d5070; }
  .add-btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 12px; border: none; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; cursor: pointer; background: linear-gradient(135deg, #63b3ed, #22d3ee); color: #080c14; box-shadow: 0 4px 16px rgba(99,179,237,0.25); transition: transform 0.15s, box-shadow 0.15s; white-space: nowrap; }
  .add-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(99,179,237,0.35); }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
  .stat-card { background: #0d1624; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px; }
  .stat-label { font-size: 11px; color: #3d5070; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
  .stat-value { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 36px; line-height: 1; }
  .kanban-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .col-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding: 0 2px; }
  .col-title { display: flex; align-items: center; gap: 8px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 13px; }
  .col-count { font-size: 11px; padding: 2px 8px; border-radius: 100px; background: rgba(255,255,255,0.05); color: #3d5070; font-family: 'JetBrains Mono', monospace; }
  .col-empty { border: 1px dashed rgba(255,255,255,0.07); border-radius: 16px; padding: 28px; text-align: center; }
  .col-empty-text { font-size: 12px; color: #2d3f58; }
  .col-cards { display: flex; flex-direction: column; gap: 12px; }

  @media (max-width: 1024px) { .kanban-grid { grid-template-columns: repeat(2, 1fr); } }

  @media (max-width: 768px) {
    .nav-email { display: none; }
    .dash-nav-inner { padding: 0 16px; }
    .dash-main { padding: 20px 16px; }
    .dash-header { flex-direction: column; gap: 14px; margin-bottom: 20px; }
    .dash-header > div:first-child { width: 100%; }
    .dash-title { font-size: 22px; }
    .add-btn { width: 100%; justify-content: center; padding: 12px; font-size: 14px; }
    .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
    .stat-card { padding: 14px; border-radius: 12px; }
    .stat-value { font-size: 28px; }
    .stat-label { font-size: 10px; }
    .kanban-grid { grid-template-columns: 1fr; gap: 24px; }
    .col-header { margin-bottom: 10px; }
  }
`

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editApp, setEditApp] = useState<Application | null>(null)
  const [analyzeApp, setAnalyzeApp] = useState<Application | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserEmail(user.email || '')
    const { data } = await supabase.from('applications').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setApplications(data || [])
    setLoading(false)
  }

  async function handleSave(formData: Partial<Application>) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (editApp) {
      const { data } = await supabase.from('applications').update({ ...formData, updated_at: new Date().toISOString() }).eq('id', editApp.id).select().single()
      if (data) setApplications(prev => prev.map(a => a.id === editApp.id ? data : a))
    } else {
      const { data } = await supabase.from('applications').insert({ ...formData, user_id: user.id }).select().single()
      if (data) setApplications(prev => [data, ...prev])
    }
    setShowModal(false)
    setEditApp(null)
  }

  async function handleDelete(id: string) {
    await supabase.from('applications').delete().eq('id', id)
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const stats = {
    total: applications.length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const statCards = [
    { label: 'Total Applied', value: stats.total, color: '#63b3ed', icon: '📋' },
    { label: 'Interviews', value: stats.interviews, color: '#fbbf24', icon: '🎯' },
    { label: 'Offers', value: stats.offers, color: '#34d399', icon: '🏆' },
    { label: 'Rejected', value: stats.rejected, color: '#f87171', icon: '✕' },
  ]

  return (
    <div className="dash-root">
      <style>{S}</style>
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-grid" />

      <nav className="dash-nav">
        <div className="dash-nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-icon">J</div>
            <span className="nav-logo-name">JobTrackr</span>
          </div>
          <div className="nav-right">
            <span className="nav-email">{userEmail}</span>
            <button className="nav-logout" onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Applications</h1>
            <p className="dash-subtitle">Track and manage your job search</p>
          </div>
          <button className="add-btn" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Application
          </button>
        </div>

        <div className="stats-grid">
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">
                <span>{s.label}</span>
                <span>{s.icon}</span>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="kanban-grid">
            {STATUSES.map(s => (
              <div key={s.key}>
                <div style={{ height: 32, background: '#0d1624', borderRadius: 10, marginBottom: 12, opacity: 0.6 }} />
                {[1,2].map(i => <div key={i} style={{ height: 120, background: '#0d1624', borderRadius: 16, marginBottom: 12, opacity: 0.4 }} />)}
              </div>
            ))}
          </div>
        ) : (
          <div className="kanban-grid">
            {STATUSES.map(col => {
              const colApps = applications.filter(a => a.status === col.key)
              return (
                <div key={col.key}>
                  <div className="col-header">
                    <div className="col-title" style={{ color: col.color }}>
                      <span>{col.icon}</span>
                      <span style={{ color: '#f0f4ff' }}>{col.label}</span>
                    </div>
                    <span className="col-count">{colApps.length}</span>
                  </div>
                  <div className="col-cards">
                    {colApps.length === 0 ? (
                      <div className="col-empty">
                        <p className="col-empty-text">No applications yet</p>
                      </div>
                    ) : (
                      colApps.map(app => (
                        <ApplicationCard key={app.id} app={app} onDelete={handleDelete} onEdit={a => { setEditApp(a); setShowModal(true) }} onAnalyze={setAnalyzeApp} />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {showModal && <ApplicationModal onClose={() => { setShowModal(false); setEditApp(null) }} onSave={handleSave} initial={editApp} />}
      {analyzeApp && <AIModal app={analyzeApp} onClose={() => setAnalyzeApp(null)} />}
    </div>
  )
}