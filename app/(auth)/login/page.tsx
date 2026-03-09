'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .auth-root {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          background: #080c14; font-family: 'DM Sans', sans-serif; position: relative;
          overflow: hidden; padding: 24px;
        }
        .bg-glow-1 {
          position: fixed; top: -10%; right: -10%; width: 600px; height: 600px;
          border-radius: 50%; background: radial-gradient(circle, rgba(99,179,237,0.08) 0%, transparent 65%);
          pointer-events: none;
        }
        .bg-glow-2 {
          position: fixed; bottom: -15%; left: -10%; width: 700px; height: 700px;
          border-radius: 50%; background: radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 65%);
          pointer-events: none;
        }
        .bg-grid {
          position: fixed; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 48px 48px; pointer-events: none;
        }
        .auth-card {
          width: 100%; max-width: 420px; position: relative; z-index: 10;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .logo-area { text-align: center; margin-bottom: 36px; }
        .logo-mark { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .logo-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: linear-gradient(135deg, #63b3ed, #22d3ee);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Syne', sans-serif; font-weight: 800; font-size: 17px;
          color: #080c14; box-shadow: 0 0 24px rgba(99,179,237,0.35);
        }
        .logo-name { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 20px; color: #f0f4ff; letter-spacing: -0.3px; }
        .auth-heading { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 30px; color: #f0f4ff; letter-spacing: -0.5px; margin-bottom: 8px; line-height: 1.1; }
        .auth-subheading { font-size: 14px; color: #4b5a72; font-weight: 400; }
        .card-box {
          background: #0d1624; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04);
        }
        .field { margin-bottom: 18px; }
        .field-label { display: block; font-size: 11px; font-weight: 500; color: #64748b; margin-bottom: 8px; letter-spacing: 0.8px; text-transform: uppercase; }
        .field-input {
          width: 100%; background: #111827; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px;
          padding: 13px 16px; font-size: 14px; color: #f0f4ff; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
        }
        .field-input::placeholder { color: #1e2d42; }
        .field-input:focus { border-color: rgba(99,179,237,0.45); box-shadow: 0 0 0 3px rgba(99,179,237,0.07); }
        .error-box { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 10px; padding: 12px 14px; font-size: 13px; color: #f87171; margin-bottom: 18px; }
        .field-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .forgot-link { font-size: 12px; color: #4b5a72; text-decoration: none; }
        .forgot-link:hover { color: #63b3ed; }
        .submit-btn {
          width: 100%; padding: 14px; border-radius: 12px; border: none;
          font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.3px;
          cursor: pointer; transition: all 0.2s;
        }
        .submit-btn:not(:disabled) {
          background: linear-gradient(135deg, #63b3ed 0%, #22d3ee 100%); color: #080c14;
          box-shadow: 0 4px 20px rgba(99,179,237,0.25);
        }
        .submit-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(99,179,237,0.35); }
        .submit-btn:not(:disabled):active { transform: translateY(0); }
        .submit-btn:disabled { background: #131d2e; color: #2d3f58; cursor: not-allowed; }
        .switch-link { text-align: center; margin-top: 22px; font-size: 13px; color: #3d5070; }
        .switch-link a { color: #63b3ed; font-weight: 500; text-decoration: none; margin-left: 4px; }
        .switch-link a:hover { text-decoration: underline; }
        .welcome-back-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(99,179,237,0.06); border: 1px solid rgba(99,179,237,0.12);
          border-radius: 100px; padding: 5px 14px; font-size: 12px; color: #63b3ed;
          margin-bottom: 16px; letter-spacing: 0.3px;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 6px rgba(34,211,238,0.6); }
      `}</style>

      <div className="auth-root">
        <div className="bg-glow-1" />
        <div className="bg-glow-2" />
        <div className="bg-grid" />

        <div className="auth-card">
          <div className="logo-area">
            <div className="logo-mark">
              <div className="logo-icon">J</div>
              <span className="logo-name">JobTrackr</span>
            </div>
            <div className="welcome-back-badge">
              <div className="badge-dot" />
              Welcome back
            </div>
            <h1 className="auth-heading">Sign in to your account</h1>
            <p className="auth-subheading">Pick up right where you left off</p>
          </div>

          <div className="card-box">
            <form onSubmit={handleLogin}>
              <div className="field">
                <label className="field-label">Email address</label>
                <input className="field-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="field">
                <div className="field-row">
                  <label className="field-label" style={{marginBottom: 0}}>Password</label>
                  <a href="#" className="forgot-link">Forgot password?</a>
                </div>
                <input className="field-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{marginTop: '8px'}} />
              </div>
              {error && <div className="error-box">{error}</div>}
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>
          </div>

          <p className="switch-link">
            Don&apos;t have an account?
            <Link href="/signup">Sign up free</Link>
          </p>
        </div>
      </div>
    </>
  )
}