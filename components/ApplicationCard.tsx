'use client'
import { Application } from '@/types'
import { ExternalLink, MoreVertical, Trash2, Edit3, Brain } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  applied:   { label: 'Applied',   bg: 'rgba(99,179,237,0.08)',  color: '#63b3ed', border: 'rgba(99,179,237,0.2)'  },
  interview: { label: 'Interview', bg: 'rgba(251,191,36,0.08)',  color: '#fbbf24', border: 'rgba(251,191,36,0.2)'  },
  offer:     { label: 'Offer',     bg: 'rgba(52,211,153,0.08)',  color: '#34d399', border: 'rgba(52,211,153,0.2)'  },
  rejected:  { label: 'Rejected',  bg: 'rgba(248,113,113,0.08)', color: '#f87171', border: 'rgba(248,113,113,0.2)' },
}

const CS = `
  .app-card { background: #0d1624; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 18px; position: relative; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; font-family: 'DM Sans', sans-serif; cursor: pointer; }
  .app-card:hover { transform: translateY(-2px); border-color: rgba(99,179,237,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
  .card-company { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; color: #f0f4ff; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-role { font-size: 13px; color: #4b5a72; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-menu-btn { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 6px; color: #3d5070; transition: background 0.15s, color 0.15s; flex-shrink: 0; margin-left: 8px; }
  .card-menu-btn:hover { background: rgba(255,255,255,0.05); color: #94a3b8; }
  .card-dropdown { position: absolute; right: 12px; top: 44px; background: #151e2e; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 6px; z-index: 20; min-width: 148px; box-shadow: 0 16px 40px rgba(0,0,0,0.5); }
  .card-menu-item { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px 12px; border: none; background: none; border-radius: 8px; font-size: 13px; cursor: pointer; transition: background 0.12s; font-family: 'DM Sans', sans-serif; text-align: left; }
  .card-menu-item:hover { background: rgba(255,255,255,0.05); }
  .card-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
  .status-badge { display: inline-block; font-size: 11px; font-weight: 500; padding: 3px 10px; border-radius: 100px; border: 1px solid; margin-bottom: 12px; }
  .card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); }
  .card-date { font-size: 11px; color: #2d3f58; font-family: 'JetBrains Mono', monospace; }
  .card-link { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #63b3ed; text-decoration: none; transition: opacity 0.15s; }
  .card-link:hover { opacity: 0.75; }
  .card-notes { font-size: 12px; color: #2d3f58; margin-top: 10px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .card-detail-hint { font-size: 11px; color: #1e2d42; margin-top: 8px; text-align: center; transition: color 0.15s; }
  .app-card:hover .card-detail-hint { color: #3d5070; }
`

interface Props {
  app: Application
  onDelete: (id: string) => void
  onEdit: (app: Application) => void
  onAnalyze: (app: Application) => void
}

export default function ApplicationCard({ app, onDelete, onEdit, onAnalyze }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const status = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied
  const daysAgo = Math.floor((Date.now() - new Date(app.applied_date).getTime()) / 86400000)

  function handleCardClick(e: React.MouseEvent) {
    // Don't navigate if clicking the menu or its children
    const target = e.target as HTMLElement
    if (target.closest('.card-menu-btn') || target.closest('.card-dropdown') || target.closest('.card-link')) return
    router.push(`/application/${app.id}`)
  }

  return (
    <div className="app-card" onClick={handleCardClick}>
      <style>{CS}</style>
      <div className="card-header">
        <div style={{ minWidth: 0 }}>
          <div className="card-company">{app.company}</div>
          <div className="card-role">{app.role}</div>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="card-menu-btn" onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen) }}>
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <div className="card-dropdown" onMouseLeave={() => setMenuOpen(false)}>
              <button className="card-menu-item" style={{ color: '#94a3b8' }} onClick={e => { e.stopPropagation(); onEdit(app); setMenuOpen(false) }}>
                <Edit3 size={13} /> Edit
              </button>
              <button className="card-menu-item" style={{ color: '#63b3ed' }} onClick={e => { e.stopPropagation(); onAnalyze(app); setMenuOpen(false) }}>
                <Brain size={13} /> AI Analyze
              </button>
              <div className="card-divider" />
              <button className="card-menu-item" style={{ color: '#f87171' }} onClick={e => { e.stopPropagation(); onDelete(app.id); setMenuOpen(false) }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <span className="status-badge" style={{ background: status.bg, color: status.color, borderColor: status.border }}>
        {status.label}
      </span>

      <div className="card-footer">
        <span className="card-date">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
        {app.job_url && (
          <a className="card-link" href={app.job_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
            View job <ExternalLink size={11} />
          </a>
        )}
      </div>

      {app.notes && <p className="card-notes">{app.notes}</p>}
      <div className="card-detail-hint">Click to open →</div>
    </div>
  )
}