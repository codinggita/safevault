import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* ── Tiny inline SVG helper ─────────────────────────────────── */
const Ic = ({ d, size = 20, sw = 2, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);

const Icons = {
  users:    ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M9 7 a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'],
  file:     ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M16 13H8','M16 17H8'],
  heart:    'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  shield:   'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  user:     ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2','M12 3 a4 4 0 1 0 0 8 4 4 0 0 0 0-8'],
  lock:     ['M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z','M7 11V7a5 5 0 0 1 10 0v4'],
  check:    'M20 6L9 17l-5-5',
  alert:    ['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z','M12 9v4','M12 17h.01'],
  arrow:    'M5 12h14M12 5l7 7-7 7',
  plus:     ['M12 5v14','M5 12h14'],
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  wifi:     ['M5 12.55a11 11 0 0 1 14.08 0','M1.42 9a16 16 0 0 1 21.16 0','M8.53 16.11a6 6 0 0 1 6.95 0','M12 20h.01'],
  cpu:      ['M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 0-2-2V9m0 0h18'],
  eye:      ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z','M12 9 a3 3 0 1 0 0 6 3 3 0 0 0 0-6'],
  key:      ['M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4'],
  server:   ['M2 2h20v8H2z','M2 14h20v8H2z','M6 6h.01','M6 18h.01'],
};

/* ── Scoped CSS ─────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

  /* ═══ LIGHT MODE ═══ */
  .sv-dash {
    --bg:       #f0f4f8;
    --surface:  #ffffff;
    --surface2: rgba(255,255,255,0.9);
    --border:   rgba(100,140,220,0.18);
    --accent:   #2563eb;
    --bright:   #3b82f6;
    --cyan:     #0284c7;
    --green:    #059669;
    --rose:     #e11d48;
    --amber:    #d97706;
    --text:     #0f172a;
    --muted:    #475569;
    --subtle:   #94a3b8;
    --font-ui:   'Sora', sans-serif;
    --font-mono: 'Space Mono', monospace;
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-ui);
    padding: 2rem 2.5rem;
  }

  /* ═══ DARK MODE ═══ */
  html.dark .sv-dash {
    --bg:       #000000;
    --surface:  #0d0d1a;
    --surface2: rgba(13,13,30,0.9);
    --border:   rgba(59,130,246,0.16);
    --accent:   #3b82f6;
    --bright:   #60a5fa;
    --cyan:     #38bdf8;
    --green:    #34d399;
    --rose:     #fb7185;
    --amber:    #fbbf24;
    --text:     #e2e8f0;
    --muted:    #94a3b8;
    --subtle:   #475569;
  }

  @media(max-width:640px){ .sv-dash { padding: 1.25rem 1rem; } }

  /* ── Grid ── */
  .sv-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
  .sv-grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:1.25rem; }
  .sv-grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:1.25rem; }
  @media(max-width:900px){ .sv-grid-3{grid-template-columns:repeat(2,1fr);} .sv-grid-4{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:560px){ .sv-grid-3,.sv-grid-2,.sv-grid-4{grid-template-columns:1fr;} }

  /* ── Cards ── */
  .sv-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.6rem 1.8rem;
    position: relative; overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
    transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
  }
  html.dark .sv-card { box-shadow: 0 4px 24px rgba(0,0,0,0.4); }
  .sv-card:hover { transform: translateY(-3px); border-color: rgba(59,130,246,0.4); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
  html.dark .sv-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.5); }
  html.dark .sv-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.5); }

  /* ── Stat card ── */
  .sv-stat { padding:1.5rem 1.7rem; }
  .sv-stat-icon {
    width:50px;height:50px;border-radius:14px;
    display:flex;align-items:center;justify-content:center;
    margin-bottom:1rem;
  }
  .sv-stat-num {
    font-size:2.8rem;font-weight:800;letter-spacing:-2px;
    margin-bottom:0.15rem;line-height:1;color:var(--text);
  }
  .sv-stat-label {
    font-size:0.78rem;text-transform:uppercase;letter-spacing:1.5px;
    font-family:var(--font-mono);color:var(--muted);margin-bottom:1.1rem;
  }
  .sv-stat-link {
    display:inline-flex;align-items:center;gap:5px;
    font-size:0.84rem;font-weight:600;text-decoration:none;
    transition:gap 0.2s;
  }
  .sv-stat-link:hover { gap:10px; }

  /* ── Section heading ── */
  .sv-section-title {
    font-size:0.68rem;text-transform:uppercase;letter-spacing:2.5px;
    font-family:var(--font-mono);color:var(--subtle);margin-bottom:1rem;
    display:flex;align-items:center;gap:8px;
  }
  .sv-section-title::after { content:'';flex:1;border-top:1px solid var(--border); }

  /* ── Header bar ── */
  .sv-header {
    display:flex;align-items:center;justify-content:space-between;
    margin-bottom:2.5rem;flex-wrap:wrap;gap:1rem;
  }
  .sv-user-badge { display:flex;align-items:center;gap:0.9rem; }
  .sv-avatar {
    width:48px;height:48px;border-radius:50%;
    background:linear-gradient(135deg,#2563eb,#6366f1);
    display:flex;align-items:center;justify-content:center;
    font-size:1.1rem;font-weight:800;color:#fff;
    border:2px solid rgba(59,130,246,0.5);
    box-shadow:0 0 0 4px rgba(59,130,246,0.1);
    flex-shrink:0;
  }
  .sv-user-name { font-size:1.15rem;font-weight:700;color:var(--text);margin-bottom:0.1rem; }
  .sv-user-date { font-size:0.77rem;color:var(--muted);font-family:var(--font-mono); }

  /* ── Alert banner ── */
  .sv-alert {
    display:flex;align-items:flex-start;gap:0.9rem;
    background:rgba(251,191,36,0.07);
    border:1px solid rgba(251,191,36,0.25);
    border-radius:12px;padding:1rem 1.2rem;
    margin-bottom:2rem;
  }
  html:not(.dark) .sv-alert { background:rgba(217,119,6,0.07); border-color:rgba(217,119,6,0.2); }
  .sv-alert a { color:var(--amber);font-weight:600;text-decoration:none; }
  .sv-alert a:hover { text-decoration:underline; }

  /* ── Quick action tiles ── */
  .sv-quick {
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    gap:0.65rem;padding:1.4rem 0.8rem;text-decoration:none;
    background:var(--surface);border:1px solid var(--border);
    border-radius:14px;transition:all 0.2s;cursor:pointer;
    box-shadow:0 1px 4px rgba(0,0,0,0.06);
  }
  html.dark .sv-quick { background: rgba(13,13,30,0.8); }
  .sv-quick:hover {
    border-color:rgba(59,130,246,0.45);
    transform:translateY(-2px);
    box-shadow:0 8px 24px rgba(59,130,246,0.1);
  }
  html.dark .sv-quick:hover { box-shadow:0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.2); }
  .sv-quick-icon { width:44px;height:44px;border-radius:12px; display:flex;align-items:center;justify-content:center; }
  .sv-quick-label { font-size:0.81rem;font-weight:600;color:var(--muted); text-align:center; line-height:1.3; }
  .sv-quick:hover .sv-quick-label { color:var(--text); }

  /* ── Vault Health card ── */
  .sv-health-header {
    display:flex;align-items:center;justify-content:space-between;
    padding-bottom:1rem;border-bottom:1px solid var(--border);margin-bottom:1rem;
  }
  .sv-health-score {
    font-size:2rem;font-weight:800;line-height:1;
    background:linear-gradient(135deg,#60a5fa,#a78bfa);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-clip:text;
  }
  .sv-health-label { font-size:0.72rem;color:var(--muted);font-family:var(--font-mono);margin-top:2px; }
  .sv-health-icon {
    width:42px;height:42px;border-radius:12px;flex-shrink:0;
    background:linear-gradient(135deg,rgba(59,130,246,0.15),rgba(167,139,250,0.15));
    border:1px solid rgba(59,130,246,0.25);
    display:flex;align-items:center;justify-content:center;
  }
  .sv-progress-row { margin-bottom:0.85rem; }
  .sv-progress-row:last-child { margin-bottom:0; }
  .sv-progress-meta {
    display:flex;justify-content:space-between;align-items:center;
    margin-bottom:0.35rem;
  }
  .sv-progress-name { font-size:0.84rem;font-weight:600;color:var(--text);display:flex;align-items:center;gap:6px; }
  .sv-progress-pct  { font-size:0.72rem;font-family:var(--font-mono);color:var(--muted); }
  .sv-progress-bar  {
    width:100%;height:6px;border-radius:99px;
    background:rgba(255,255,255,0.07);overflow:hidden;
  }
  html:not(.dark) .sv-progress-bar { background:rgba(0,0,0,0.07); }
  .sv-progress-fill {
    height:100%;border-radius:99px;
    transition:width 0.8s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* ── Tip strip ── */
  .sv-tip {
    background:rgba(59,130,246,0.05);
    border:1px solid rgba(59,130,246,0.18);
    border-radius:14px;padding:1.25rem 1.5rem;
    display:flex;align-items:flex-start;gap:1rem;
    margin-top:0;
  }
  html.dark .sv-tip { background:linear-gradient(135deg,rgba(37,99,235,0.1),rgba(99,102,241,0.06)); border-color:rgba(59,130,246,0.2); }
  .sv-tip-icon {
    width:40px;height:40px;border-radius:10px;flex-shrink:0;
    background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);
    display:flex;align-items:center;justify-content:center;
  }

  /* ── Animations ── */
  @keyframes sv-fadein { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  .sv-a1 { animation: sv-fadein 0.45s ease both; }
  .sv-a2 { animation: sv-fadein 0.45s ease 0.08s both; }
  .sv-a3 { animation: sv-fadein 0.45s ease 0.16s both; }
  .sv-a4 { animation: sv-fadein 0.45s ease 0.24s both; }
  .sv-a5 { animation: sv-fadein 0.45s ease 0.32s both; }
  .sv-a6 { animation: sv-fadein 0.45s ease 0.40s both; }
`;

/* ── STAT CARD ─────────────────────────────────────────────── */
const StatCard = ({ label, count, icon, accentColor, link, animClass, gradient }) => (
  <Link to={link} style={{ textDecoration: 'none' }}>
    <div className={`sv-card sv-stat sv-stat-card ${animClass}`}
      style={{ '--card-accent': accentColor }}>
      <div className="sv-stat-icon"
        style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
        <span style={{ color: accentColor }}>{icon}</span>
      </div>
      <div className="sv-stat-num">{count}</div>
      <div className="sv-stat-label">{label}</div>
      <span className="sv-stat-link" style={{ color: accentColor }}>
        Manage <Ic d="M5 12h14M12 5l7 7-7 7" size={14}/>
      </span>
    </div>
  </Link>
);

/* ── QUICK ACTION ──────────────────────────────────────────── */
const QuickAction = ({ label, icon, iconBg, iconColor, link }) => (
  <Link to={link} className="sv-quick">
    <div className="sv-quick-icon"
      style={{ background: `${iconBg}15`, border: `1px solid ${iconBg}30` }}>
      <span style={{ color: iconColor }}>{icon}</span>
    </div>
    <span className="sv-quick-label">{label}</span>
  </Link>
);

/* ── VAULT HEALTH PROGRESS ROW ─────────────────────────────── */
const HealthRow = ({ icon, label, count, max = 5, color, gradFrom, gradTo }) => {
  const filled = count > 0;
  const pct = filled ? Math.min(Math.round((count / max) * 100), 100) : 0;
  return (
    <div className="sv-progress-row">
      <div className="sv-progress-meta">
        <span className="sv-progress-name">
          <span style={{ color }}>{icon}</span>
          {label}
          <span style={{ fontSize:'0.75rem', color:'var(--muted)', fontFamily:'var(--font-mono)', fontWeight:400 }}>
            ({count} {count === 1 ? 'entry' : 'entries'})
          </span>
        </span>
        <span className="sv-progress-pct">{pct}%</span>
      </div>
      <div className="sv-progress-bar">
        <div className="sv-progress-fill" style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})`
        }}/>
      </div>
    </div>
  );
};

/* ── MAIN DASHBOARD ────────────────────────────────────────── */
const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ contacts: 0, documents: 0, medical: 0 });
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cR, dR, mR, pR] = await Promise.all([
          api.get('/contacts').catch(() => ({ data: [] })),
          api.get('/documents').catch(() => ({ data: [] })),
          api.get('/medical').catch(() => ({ data: [] })),
          api.get('/profile').catch(() => ({ data: null })),
        ]);
        setStats({ contacts: cR.data.length, documents: dR.data.length, medical: mR.data.length });
        if (pR.data?.bloodGroup) setProfileComplete(true);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
    : '?';

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric' });

  return (
    <>
      <style>{CSS}</style>
      <div className="sv-dash">

        {/* ── Header ── */}
        <div className="sv-header sv-a1">
          <div className="sv-user-badge">
            <div className="sv-avatar">{initials}</div>
            <div>
              <p className="sv-user-name">{user?.name || 'SafeVault User'}</p>
              <p className="sv-user-date">{today}</p>
            </div>
          </div>
        </div>

        {/* ── Alert ── */}
        {!loading && !profileComplete && (
          <div className="sv-alert sv-a1">
            <span style={{ color: '#fbbf24', flexShrink:0, marginTop:1 }}>
              <Ic d={Icons.alert} size={18}/>
            </span>
            <div>
              <p style={{ fontSize:'0.9rem', fontWeight:600, color:'#fbbf24', marginBottom:'0.3rem' }}>
                Emergency Profile Incomplete
              </p>
              <p style={{ fontSize:'0.84rem', color:'var(--muted)', lineHeight:1.6 }}>
                Add your blood group, medical conditions and emergency contacts so first responders can assist you quickly.{' '}
                <Link to="/profile" style={{ color:'var(--amber)', fontWeight:600, textDecoration:'none' }}>
                  Complete Profile →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ── Vault Summary ── */}
        <p className="sv-section-title">Vault Summary</p>
        <div className="sv-grid-3" style={{ marginBottom:'2.5rem' }}>
          <StatCard label="Emergency Contacts" count={loading?'—':stats.contacts}
            icon={<Ic d={Icons.users} size={22}/>} accentColor="#3b82f6" link="/contacts" animClass="sv-a2"/>
          <StatCard label="Identity Documents" count={loading?'—':stats.documents}
            icon={<Ic d={Icons.file} size={22}/>} accentColor="#34d399" link="/documents" animClass="sv-a3"/>
          <StatCard label="Medical Records" count={loading?'—':stats.medical}
            icon={<Ic d={Icons.heart} size={22}/>} accentColor="#fb7185" link="/medical" animClass="sv-a4"/>
        </div>

        {/* ── Bottom 2-col ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1.15fr', gap:'1.5rem', marginBottom:'2rem' }}>

          {/* Quick Actions */}
          <div className="sv-a5">
            <p className="sv-section-title">Quick Actions</p>
            <div className="sv-grid-2">
              <QuickAction label="Add Contact"      icon={<Ic d={Icons.plus} size={20}/>}     iconBg="#3b82f6" iconColor="#60a5fa" link="/contacts"/>
              <QuickAction label="Upload Document"  icon={<Ic d={Icons.file} size={20}/>}     iconBg="#34d399" iconColor="#34d399" link="/documents"/>
              <QuickAction label="Add Medical Info" icon={<Ic d={Icons.activity} size={20}/>} iconBg="#fb7185" iconColor="#fb7185" link="/medical"/>
              <QuickAction label="My Profile"       icon={<Ic d={Icons.user} size={20}/>}     iconBg="#a78bfa" iconColor="#a78bfa" link="/profile"/>
            </div>
          </div>

          {/* Vault Health */}
          <div className="sv-a6">
            <p className="sv-section-title">Vault Health</p>
            <div className="sv-card" style={{ padding:'1.4rem 1.6rem' }}>

              <div className="sv-health-header">
                <div>
                  <div className="sv-health-score">
                    {loading ? '—' : (
                      (() => {
                        const total = stats.contacts + stats.documents + stats.medical + (profileComplete ? 1 : 0);
                        const max = 15;
                        const score = Math.min(Math.round((total / max) * 100), 100);
                        return `${score}%`;
                      })()
                    )}
                  </div>
                  <div className="sv-health-label">VAULT COMPLETE</div>
                </div>
                <div className="sv-health-icon">
                  <Ic d={Icons.activity} size={20} style={{ color:'#60a5fa' }}/>
                </div>
              </div>

              <HealthRow
                icon={<Ic d={Icons.user}  size={14}/>} label="Profile"
                count={profileComplete ? 1 : 0} max={1}
                color="#a78bfa" gradFrom="#6366f1" gradTo="#a78bfa"
              />
              <HealthRow
                icon={<Ic d={Icons.users} size={14}/>} label="Emergency Contacts"
                count={loading ? 0 : stats.contacts} max={5}
                color="#60a5fa" gradFrom="#2563eb" gradTo="#60a5fa"
              />
              <HealthRow
                icon={<Ic d={Icons.file}  size={14}/>} label="Identity Documents"
                count={loading ? 0 : stats.documents} max={5}
                color="#34d399" gradFrom="#059669" gradTo="#34d399"
              />
              <HealthRow
                icon={<Ic d={Icons.heart} size={14}/>} label="Medical Records"
                count={loading ? 0 : stats.medical} max={5}
                color="#fb7185" gradFrom="#e11d48" gradTo="#fb7185"
              />
            </div>
          </div>
        </div>

        {/* ── Tip strip ── */}
        <div className="sv-tip sv-a6">
          <div className="sv-tip-icon">
            <Ic d={Icons.lock} size={18} style={{ color:'#60a5fa' }}/>
          </div>
          <div>
            <p style={{ fontWeight:700, fontSize:'0.93rem', color:'var(--text)', marginBottom:'0.35rem' }}>
              💡 Keep your vault up-to-date
            </p>
            <p style={{ fontSize:'0.84rem', color:'var(--muted)', lineHeight:1.6, margin:0 }}>
              Outdated emergency contacts or missing medical data can delay help in a crisis.
              Review your vault regularly and keep your blood group, primary doctor, and insurance details accurate.{' '}
              <Link to="/profile" style={{ color:'#60a5fa', fontWeight:600, textDecoration:'none' }}>
                Review now →
              </Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
