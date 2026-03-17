import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SmartAlerts from './SmartAlerts';

/* ── Inline SVG helpers ─────────────────────────────────────── */
const SvIcon = ({ d, size = 20, strokeWidth = 2, fill = 'none', color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={fill} stroke={color} strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

/* Premium Shield Logo SVG */
const ShieldLogo = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
    <defs>
      <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3b82f6"/>
        <stop offset="100%" stopColor="#6366f1"/>
      </linearGradient>
    </defs>
    <path d="M16 2L4 7V15C4 21.5 9.5 27.5 16 30C22.5 27.5 28 21.5 28 15V7L16 2Z"
      fill="url(#shieldGrad)" opacity="0.15" stroke="url(#shieldGrad)" strokeWidth="1.5"/>
    <path d="M16 4.5L6 9V15C6 20.5 10.5 26 16 28.5C21.5 26 26 20.5 26 15V9L16 4.5Z"
      fill="url(#shieldGrad)" opacity="0.2"/>
    <path d="M11 16L14.5 19.5L21 13" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 5L7 9.5V15.5C7 20.5 11 25.5 16 27.5" stroke="url(#shieldGrad)" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="15" r="1.5" fill="#3b82f6"/>
  </svg>
);

const NAV_CSS = `
  .sv-navbar {
    background: rgba(8, 8, 20, 0.97);
    border-bottom: 1px solid rgba(59,130,246,0.18);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    position: sticky; top: 0; z-index: 100;
    box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(59,130,246,0.1);
  }
  html:not(.dark) .sv-navbar {
    background: rgba(255,255,255,0.97);
    border-bottom: 1px solid rgba(100,140,220,0.15);
    box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  }

  .sv-navbar-inner {
    max-width: 1280px; margin: 0 auto;
    padding: 0 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    height: 64px;
  }

  /* Logo */
  .sv-logo-link {
    display: flex; align-items: center; gap: 10px;
    text-decoration: none; flex-shrink: 0;
  }
  .sv-logo-icon-wrap {
    width: 36px; height: 36px; border-radius: 10px;
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.25);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 12px rgba(59,130,246,0.2);
    transition: all 0.2s;
  }
  .sv-logo-link:hover .sv-logo-icon-wrap {
    background: rgba(59,130,246,0.2);
    box-shadow: 0 0 20px rgba(59,130,246,0.35);
  }
  .sv-logo-text {
    font-family: 'Sora', sans-serif;
    font-size: 1.18rem; font-weight: 800;
    background: linear-gradient(135deg, #e0f2fe 0%, #93c5fd 40%, #818cf8 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: -0.3px;
  }
  html:not(.dark) .sv-logo-text {
    background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #6366f1 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* Nav Links */
  .sv-nav-links {
    display: flex; align-items: center; gap: 2px;
  }
  .sv-nav-link {
    display: flex; align-items: center; gap: 6px;
    padding: 0.45rem 0.95rem; border-radius: 8px;
    text-decoration: none; font-size: 0.875rem; font-weight: 500;
    color: rgba(148,163,184,0.9);
    font-family: 'Sora', sans-serif;
    transition: all 0.18s;
    white-space: nowrap;
  }
  html:not(.dark) .sv-nav-link { color: #475569; }
  .sv-nav-link:hover {
    background: rgba(59,130,246,0.1);
    color: #93c5fd;
  }
  html:not(.dark) .sv-nav-link:hover { background: rgba(59,130,246,0.08); color: #1d4ed8; }
  .sv-nav-link.active {
    background: rgba(59,130,246,0.15);
    color: #60a5fa;
    border: 1px solid rgba(59,130,246,0.25);
  }
  html:not(.dark) .sv-nav-link.active {
    background: rgba(59,130,246,0.1);
    color: #2563eb;
    border-color: rgba(59,130,246,0.2);
  }

  /* Right Controls */
  .sv-nav-right { display: flex; align-items: center; gap: 0.75rem; }
  .sv-nav-divider { width: 1px; height: 24px; background: rgba(59,130,246,0.15); }
  html:not(.dark) .sv-nav-divider { background: rgba(100,140,220,0.2); }

  .sv-user-name {
    font-size: 0.875rem; font-weight: 600; font-family: 'Sora', sans-serif;
    color: #cbd5e1; padding: 0 0.25rem;
  }
  html:not(.dark) .sv-user-name { color: #334155; }

  .sv-theme-btn {
    width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer;
    background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15);
    color: #7ea8cc; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }
  html:not(.dark) .sv-theme-btn { background: #f1f5f9; border-color: #e2e8f0; color: #64748b; }
  .sv-theme-btn:hover { background: rgba(59,130,246,0.15); color: #60a5fa; border-color: rgba(59,130,246,0.3); }

  .sv-logout-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 0.4rem 0.9rem; border-radius: 8px; border: none; cursor: pointer;
    background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
    color: #f87171; font-size: 0.85rem; font-weight: 600; font-family: 'Sora', sans-serif;
    transition: all 0.2s;
  }
  html:not(.dark) .sv-logout-btn { background: rgba(239,68,68,0.06); border-color: rgba(239,68,68,0.15); color: #dc2626; }
  .sv-logout-btn:hover { background: rgba(239,68,68,0.15); border-color: rgba(239,68,68,0.35); }

  /* Mobile */
  .sv-mobile-btn {
    width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer;
    background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15);
    color: #7ea8cc; display: none; align-items: center; justify-content: center;
  }
  html:not(.dark) .sv-mobile-btn { background: #f1f5f9; border-color: #e2e8f0; color: #64748b; }
  .sv-mobile-menu {
    border-top: 1px solid rgba(59,130,246,0.12);
    padding: 0.75rem 1rem 1rem;
  }
  html:not(.dark) .sv-mobile-menu { border-color: #e2e8f0; }
  @media(max-width:768px){
    .sv-nav-links { display: none; }
    .sv-mobile-btn { display: flex; }
    .sv-user-name { display: none; }
  }
`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { name: 'Profile',   path: '/profile',   icon: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2','M12 3 a4 4 0 1 0 0 8 4 4 0 0 0 0-8'] },
    { name: 'Contacts',  path: '/contacts',  icon: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M9 7 a4 4 0 1 0 0-8 4 4 0 0 0 0 8','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75'] },
    { name: 'Documents', path: '/documents', icon: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M14 2v6h6','M16 13H8','M16 17H8'] },
    { name: 'Medical',   path: '/medical',   icon: ['M22 12h-4l-3 9L9 3l-3 9H2'] },
  ];

  return (
    <>
      <style>{NAV_CSS}</style>
      <nav className="sv-navbar">
        <div className="sv-navbar-inner">

          {/* ── Logo ── */}
          <Link to="/" className="sv-logo-link">
            <div className="sv-logo-icon-wrap"><ShieldLogo /></div>
            <span className="sv-logo-text">SafeVault</span>
          </Link>

          {/* ── Desktop Nav Links ── */}
          {isAuthenticated && (
            <div className="sv-nav-links">
              {navLinks.map(link => (
                <Link key={link.name} to={link.path}
                  className={`sv-nav-link ${isActive(link.path) ? 'active' : ''}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {Array.isArray(link.icon)
                      ? link.icon.map((p,i) => <path key={i} d={p}/>)
                      : <path d={link.icon}/>}
                  </svg>
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {/* ── Right Controls ── */}
          <div className="sv-nav-right">
            {isAuthenticated && <SmartAlerts />}
            <button className="sv-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              }
            </button>

            {isAuthenticated && (
              <>
                <div className="sv-nav-divider" />
                <span className="sv-user-name">{user?.name?.split(' ')[0]}</span>
                <button className="sv-logout-btn" onClick={handleLogout}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Logout
                </button>
              </>
            )}

            {/* Mobile menu button */}
            <button className="sv-mobile-btn" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && isAuthenticated && (
          <div className="sv-mobile-menu">
            {navLinks.map(link => (
              <Link key={link.name} to={link.path}
                className={`sv-nav-link ${isActive(link.path) ? 'active' : ''}`}
                style={{ display: 'flex', marginBottom: '4px' }}
                onClick={() => setMenuOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {Array.isArray(link.icon) ? link.icon.map((p,i)=><path key={i} d={p}/>) : <path d={link.icon}/>}
                </svg>
                {link.name}
              </Link>
            ))}
            <button className="sv-logout-btn" style={{ marginTop: '0.5rem', width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
