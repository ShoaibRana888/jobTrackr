'use client'
import { useState, useEffect } from 'react'
import { Application, ApplicationStatus } from '@/types'
import { X } from 'lucide-react'

const MS = `
  .modal-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 16px; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); }
  .modal-box { background: #0d1624; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; width: 100%; max-width: 520px; box-shadow: 0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04); font-family: 'DM Sans', sans-serif; animation: modalIn 0.2s cubic-bezier(0.16,1,0.3,1); }
  @keyframes modalIn { from { opacity:0; transform: scale(0.96) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }
  .modal-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.07); }
  .modal-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 17px; color: #f0f4ff; }
  .modal-close { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 8px; color: #3d5070; transition: background 0.15s, color 0.15s; }
  .modal-close:hover { background: rgba(255,255,255,0.05); color: #94a3b8; }
  .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
  .modal-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .m-field label { display: block; font-size: 11px; color: #4b5a72; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 7px; font-weight: 500; }
  .m-input { width: 100%; background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 11px 14px; font-size: 14px; color: #f0f4ff; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.15s, box-shadow 0.15s; box-sizing: border-box; }
  .m-input::placeholder { color: #1e2d42; }
  .m-input:focus { border-color: rgba(99,179,237,0.4); box-shadow: 0 0 0 3px rgba(99,179,237,0.07); }
  .m-textarea { min-height: 80px; resize: vertical; }
  .modal-actions { display: flex; gap: 10px; padding-top: 4px; }
  .btn-cancel { flex: 1; padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: none; color: #4b5a72; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s, color 0.15s; }
  .btn-cancel:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
  .btn-save { flex: 1; padding: 12px; border-radius: 10px; border: none; background: linear-gradient(135deg, #63b3ed, #22d3ee); color: #080c14; font-size: 13px; font-family: 'Syne', sans-serif; font-weight: 700; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
  .btn-save:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,179,237,0.3); }
`

const STATUSES: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected']

interface Props {
  onClose: () => void
  onSave: (data: Partial<Application>) => void
  initial?: Application | null
}

export default function ApplicationModal({ onClose, onSave, initial }: Props) {
  const [form, setForm] = useState({
    company: '', role: '', status: 'applied' as ApplicationStatus,
    job_url: '', notes: '', applied_date: new Date().toISOString().split('T')[0],
  })

  useEffect(() => {
    if (initial) setForm({ company: initial.company, role: initial.role, status: initial.status, job_url: initial.job_url || '', notes: initial.notes || '', applied_date: initial.applied_date })
  }, [initial])

  function set(key: string, val: string) { setForm(p => ({ ...p, [key]: val })) }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <style>{MS}</style>
      <div className="modal-box">
        <div className="modal-head">
          <span className="modal-title">{initial ? 'Edit Application' : 'Add Application'}</span>
          <button className="modal-close" onClick={onClose}><X size={17} /></button>
        </div>
        <form className="modal-body" onSubmit={e => { e.preventDefault(); onSave(form) }}>
          <div className="modal-row">
            <div className="m-field">
              <label>Company *</label>
              <input className="m-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Inc." required />
            </div>
            <div className="m-field">
              <label>Role *</label>
              <input className="m-input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="Software Engineer" required />
            </div>
          </div>
          <div className="modal-row">
            <div className="m-field">
              <label>Status</label>
              <select className="m-input" value={form.status} onChange={e => set('status', e.target.value)} style={{ cursor: 'pointer' }}>
                {STATUSES.map(s => <option key={s} value={s} style={{ background: '#111827' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="m-field">
              <label>Applied Date</label>
              <input className="m-input" type="date" value={form.applied_date} onChange={e => set('applied_date', e.target.value)} />
            </div>
          </div>
          <div className="m-field">
            <label>Job URL</label>
            <input className="m-input" value={form.job_url} onChange={e => set('job_url', e.target.value)} placeholder="https://..." />
          </div>
          <div className="m-field">
            <label>Notes</label>
            <textarea className="m-input m-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Recruiter name, interview notes, salary range..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">{initial ? 'Save Changes' : 'Add Application'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}