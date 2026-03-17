import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CSS = `
  .sv-alerts-container {
    position: relative;
    display: inline-block;
  }
  
  .sv-alert-btn {
    width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer;
    background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15);
    color: #7ea8cc; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; position: relative;
  }
  html:not(.dark) .sv-alert-btn { background: #f1f5f9; border-color: #e2e8f0; color: #64748b; }
  .sv-alert-btn:hover { background: rgba(59,130,246,0.15); color: #60a5fa; border-color: rgba(59,130,246,0.3); }
  
  .sv-alert-badge {
    position: absolute; top: -4px; right: -4px;
    background: #ef4444; color: white;
    font-size: 0.65rem; font-weight: 700;
    min-width: 18px; height: 18px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    border: 2px solid #080814;
    padding: 0 4px; z-index: 2;
  }
  html:not(.dark) .sv-alert-badge { border-color: #ffffff; }

  .sv-alerts-dropdown {
    position: absolute; top: calc(100% + 12px); right: -10px;
    width: 320px; background: rgba(13,13,26,0.95);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.6);
    overflow: hidden; opacity: 0; visibility: hidden;
    transform: translateY(10px); transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1000;
  }
  html:not(.dark) .sv-alerts-dropdown {
    background: rgba(255,255,255,0.98); border-color: rgba(100,140,220,0.2);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  .sv-alerts-dropdown.open { opacity: 1; visibility: visible; transform: translateY(0); }

  .sv-alerts-header {
    padding: 1rem 1.25rem; border-bottom: 1px solid rgba(59,130,246,0.15);
    display: flex; justify-content: space-between; align-items: center;
  }
  html:not(.dark) .sv-alerts-header { border-bottom-color: rgba(100,140,220,0.15); }
  
  .sv-alerts-title { font-size: 0.95rem; font-weight: 700; color: #e2e8f0; margin: 0; font-family: 'Sora', sans-serif;}
  html:not(.dark) .sv-alerts-title { color: #1e293b; }
  
  .sv-alerts-list { max-height: 380px; overflow-y: auto; }
  .sv-alerts-list::-webkit-scrollbar { width: 5px; }
  .sv-alerts-list::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 5px; }
  
  .sv-alert-item {
    display: flex; gap: 1rem; padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(255,255,255,0.05); text-decoration: none;
    transition: background 0.15s; cursor: pointer;
  }
  html:not(.dark) .sv-alert-item { border-bottom-color: rgba(0,0,0,0.04); }
  .sv-alert-item:hover { background: rgba(59,130,246,0.06); }
  .sv-alert-item:last-child { border-bottom: none; }
  
  .sv-alert-item-icon {
    width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: rgba(59,130,246,0.1);
  }
  
  .sv-alert-content h4 {
    margin: 0 0 0.25rem 0; font-size: 0.85rem; font-weight: 600; color: #e2e8f0; font-family: 'Sora', sans-serif;
  }
  html:not(.dark) .sv-alert-content h4 { color: #334155; }
  
  .sv-alert-content p {
    margin: 0; font-size: 0.78rem; color: #94a3b8; line-height: 1.4;
  }
  html:not(.dark) .sv-alert-content p { color: #64748b; }
  
  .sv-alerts-empty {
    padding: 2rem; text-align: center; color: #94a3b8; font-size: 0.85rem;
  }
  html:not(.dark) .sv-alerts-empty { color: #64748b; }

  /* Icon Colors */
  .sv-icon-warning { background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); }
  .sv-icon-danger { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
  .sv-icon-info { background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); }
`;

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const UserAlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <line x1="18" y1="8" x2="23" y2="13" />
    <line x1="23" y1="8" x2="18" y2="13" />
  </svg>
);

const FileAlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" />
  </svg>
);

const MedAlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A4.5 4.5 0 0 0 15 8l-6 6z" />
    <path d="M15 8A4.5 4.5 0 0 0 8.5 14.5l6-6z" />
    <path d="M17.5 2.5a4.95 4.95 0 0 1 4 4l-11 11a4.95 4.95 0 0 1-4-4l11-11z" />
    <path d="M10.5 4.5l9 9" />
  </svg>
);

const SmartAlerts = () => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch logic for generating Smart Alerts
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    const fetchAlerts = async () => {
      try {
        const generatedAlerts = [];
        
        const [profileRes, docsRes, medRes] = await Promise.all([
          api.get('/profile').catch(() => ({ data: null })),
          api.get('/documents').catch(() => ({ data: [] })),
          api.get('/medical').catch(() => ({ data: [] }))
        ]);
        
        // 1. Profile Condition Check
        const profile = profileRes.data;
        if (!profile || !profile.bloodGroup) {
          generatedAlerts.push({
            id: 'alert_profile',
            title: 'Incomplete Emergency Profile',
            desc: 'Your blood group and critical details are missing. Add them now.',
            type: 'warning',
            icon: <UserAlertIcon />,
            link: '/profile'
          });
        }

        // 2. Document/Insurance Expiry Check
        const docs = docsRes.data || [];
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        const now = new Date();
        
        docs.forEach(doc => {
          if (doc.type === 'Insurance' && doc.expiryDate) {
            const expDate = new Date(doc.expiryDate);
            const timeDiff = expDate.getTime() - now.getTime();
            
            if (timeDiff < 0) { // Expired
              generatedAlerts.push({
                id: `alert_doc_${doc._id}`,
                title: 'Insurance Expired!',
                desc: `Your ${doc.documentNumber || 'Insurance Policy'} expired on ${expDate.toLocaleDateString()}.`,
                type: 'danger',
                icon: <FileAlertIcon />,
                link: '/documents'
              });
            } else if (timeDiff < thirtyDaysMs) { // Expiring soon (< 30 days)
              const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
              generatedAlerts.push({
                id: `alert_doc_${doc._id}`,
                title: 'Insurance Expiring Soon',
                desc: `Policy ${doc.documentNumber || ''} expires in ${daysLeft} days.`,
                type: 'warning',
                icon: <FileAlertIcon />,
                link: '/documents'
              });
            }
          }
        });

        // 3. Medicine Refill Reminder
        const meds = medRes.data || [];
        meds.forEach(med => {
          if (med.medication) {
            const lastUpdated = new Date(med.updatedAt || med.createdAt);
            const timeDiff = now.getTime() - lastUpdated.getTime();
            const daysOld = Math.floor(timeDiff / (1000 * 3600 * 24));

            // Heuristic: If prescription logic hasn't been updated in 30 days, assume refill reminder
            if (daysOld >= 30) {
              generatedAlerts.push({
                id: `alert_med_${med._id}`,
                title: 'Medicine Refill Reminder',
                desc: `Your prescription for ${med.medication} might need a refill soon.`,
                type: 'info',
                icon: <MedAlertIcon />,
                link: '/medical'
              });
            }
          }
        });

        if (isMounted) {
          setAlerts(generatedAlerts);
        }
      } catch (err) {
        console.error("Failed to load smart alerts", err);
      }
    };

    fetchAlerts();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  return (
    <div className="sv-alerts-container" ref={dropdownRef}>
      <style>{CSS}</style>
      
      <button 
        className="sv-alert-btn" 
        onClick={() => setOpen(!open)}
        aria-label="Smart Alerts"
      >
        <BellIcon />
        {alerts.length > 0 && (
          <span className="sv-alert-badge">{alerts.length}</span>
        )}
      </button>

      <div className={`sv-alerts-dropdown ${open ? 'open' : ''}`}>
        <div className="sv-alerts-header">
          <h3 className="sv-alerts-title">Smart Alerts</h3>
          {alerts.length > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {alerts.length} New
            </span>
          )}
        </div>
        
        <div className="sv-alerts-list">
          {alerts.length === 0 ? (
            <div className="sv-alerts-empty">
              You're all caught up! No urgent alerts.
            </div>
          ) : (
            alerts.map(alert => (
              <Link to={alert.link} className="sv-alert-item" key={alert.id} onClick={() => setOpen(false)}>
                <div className={`sv-alert-item-icon sv-icon-${alert.type}`}>
                  {alert.icon}
                </div>
                <div className="sv-alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.desc}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartAlerts;
