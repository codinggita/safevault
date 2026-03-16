import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import '../styles/PremiumProfile.css';

/* ── Tiny SVG Library ── */
const Ic = ({ d, size = 18, c = 'currentColor', fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);
const I = {
  cam: ['M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z','M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  edit: ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7','M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2','M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  mail: ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z','M22 6l-10 7L2 6'],
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z'],
  map: ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z','M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  globe: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z','M2 12h20','M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'],
  quote: ['M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z','M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z'],
  share: ['M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8','M16 6l-4-4-4 4','M12 2v13'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  bell: ['M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9','M13.73 21a2 2 0 0 1-3.46 0'],
  eye: ['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z','M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  check: 'M20 6L9 17l-5-5',
  x: ['M18 6L6 18','M6 6l12 12'],
  save: ['M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z','M17 21v-8H7v8','M7 3v5h8']
};

/* ── Custom Components ── */
const TagInput = ({ tags, setTags, placeholder }) => {
  const [inp, setInp] = useState('');
  const add = (e) => {
    if (e.key==='Enter' || e.key===',') {
      e.preventDefault();
      const v = inp.trim().replace(/^,|,$/g, '');
      if (v && !tags.includes(v) && tags.length < 10) setTags([...tags, v]);
      setInp('');
    }
  };
  const remove = t => setTags(tags.filter(x => x !== t));
  return (
    <div className="pp-tags-container">
      {tags.map(t => (
        <span key={t} className="pp-tag">{t} 
          <button type="button" onClick={() => remove(t)}><Ic d={I.x} size={12}/></button>
        </span>
      ))}
      <input className="pp-tag-input" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={add} placeholder={tags.length<10?placeholder:'Limit reached'}/>
    </div>
  );
};

const Toggle = ({ label, on, setOn }) => (
  <div className="pp-toggle-row">
    <span className="pp-toggle-label">{label}</span>
    <div className={`pp-toggle ${on ? 'active' : ''}`} onClick={() => setOn(!on)}>
      <div className="pp-toggle-thumb"/>
    </div>
  </div>
);

const Profile = () => {
  const { user } = useAuth();
  
  // Base State
  const [photo, setPhoto] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const fileInputRef = useRef(null);
  
  // Data State
  const [d, setD] = useState({
    name: user?.name || 'Demo User',
    username: '@user01',
    email: user?.email || 'user@example.com',
    phone: '', dob: '', gender: 'Prefer not to say',
    city: '', country: '', timezone: 'UTC', jobTitle: 'Product Designer', company: '', website: '',
    bio: '',
    twitter: '', linkedin: '', github: '', instagram: '', portfolio: '',
    currentPwd: '', newPwd: '', confPwd: '',
    twoFa: false, visibility: 'Public', deleteConfirm: '',
    notifEmail: true, notifPush: true, notifDigest: false, notifFollows: true, notifComments: true, notifUpdates: false
  });
  
  const [skills, setSkills] = useState(['React', 'Node.js', 'UI Design']);
  const [languages, setLanguages] = useState(['English']);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', ok: true });
  
  // Helper
  const u = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const handleChange = e => setD(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const showToast = (msg, ok = true) => {
    setToast({ show: true, msg, ok });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  // Avatar Upload
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showToast('Image too large (max 2MB)', false);
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Save Flow
  const handleSave = async () => {
    setLoading(true);
    // Simulate API call for saving interactive profile
    setTimeout(() => {
      setLoading(false);
      showToast('Profile saved successfully ✓', true);
    }, 1200);
  };
  
  const handleDiscard = () => {
    // Reset basically
    setD(prev => ({ ...prev, bio: '', phone: '' }));
    showToast('Changes discarded', true);
  };

  // Pwd Strength dummy calc
  const strScore = (d.newPwd.length >= 8 ? 1 : 0) + (/[A-Z]/.test(d.newPwd) ? 1 : 0) + (/[0-9]/.test(d.newPwd) ? 1 : 0) + (/[^a-zA-Z0-9]/.test(d.newPwd) ? 1 : 0);
  
  const initials = d.name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase();

  return (
    <div className="premium-profile-page">
      
      {/* Toast */}
      {toast.show && (
        <div className={`sv-toast ${toast.ok ? 'sv-toast-success' : 'sv-toast-error'}`} style={{ position:'fixed', top:20, right:20, zIndex:999, padding:'1rem', borderRadius:'10px', background:'var(--pp-card)', border:`1px solid ${toast.ok?'var(--pp-success)':'var(--pp-danger)'}`, display:'flex', alignItems:'center', gap:'10px', boxShadow:'0 10px 40px rgba(0,0,0,0.5)' }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background: toast.ok?'var(--pp-success)':'var(--pp-danger)' }}/>
          <span style={{ fontWeight:600 }}>{toast.msg}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="pp-header-hero">
        <input type="file" hidden ref={fileInputRef} accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        
        <div className="pp-avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
          {photo ? <img src={photo} alt="Avatar" className="pp-avatar-img"/> : initials}
          <div className="pp-avatar-overlay">
            <Ic d={I.cam} size={24}/>
            <span style={{marginTop:4}}>Change Photo</span>
          </div>
        </div>
        
        <div className="pp-name-edit-wrapper">
          {isEditingName ? (
            <input autoFocus className="pp-input" style={{ width: 200, textAlign:'center', fontSize:'1.5rem', height: 40 }} value={d.name} onChange={handleChange} name="name" onBlur={() => setIsEditingName(false)} onKeyDown={e => e.key==='Enter' && setIsEditingName(false)} />
          ) : (
            <>{d.name} <button className="pp-input-action" style={{ position:'relative', right:0 }} onClick={() => setIsEditingName(true)}><Ic d={I.edit}/></button></>
          )}
        </div>
        
        <div className="pp-username">{d.username}</div>
        

      </div>

      {/* Grid Content */}
      <div className="pp-grid">
        
        {/* 1. Personal Info */}
        <div className="pp-card">
          <div className="pp-card-header">
            <div className="pp-card-icon"><Ic d={I.user}/></div>
            <h2 className="pp-card-title">Personal Information</h2>
          </div>
          <div className="pp-form-grid">
            <div className="pp-form-group">
              <label className="pp-label">Full Name</label>
              <input className="pp-input" name="name" value={d.name} onChange={handleChange}/>
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Username</label>
              <input className="pp-input" name="username" value={d.username} onChange={handleChange}/>
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Email Address</label>
              <div className="pp-input-wrapper">
                <span className="pp-input-icon"><Ic d={I.mail}/></span>
                <input className="pp-input has-icon" type="email" name="email" value={d.email} onChange={handleChange}/>
              </div>
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Phone Number</label>
              <div className="pp-input-wrapper">
                <span className="pp-input-icon"><Ic d={I.phone}/></span>
                <input className="pp-input has-icon" type="tel" name="phone" value={d.phone} onChange={handleChange}/>
              </div>
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Date of Birth</label>
              <input className="pp-input" type="date" name="dob" value={d.dob} onChange={handleChange}/>
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Gender</label>
              <select className="pp-input" name="gender" value={d.gender} onChange={handleChange}>
                <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Location & Work */}
        <div className="pp-card">
          <div className="pp-card-header">
            <div className="pp-card-icon"><Ic d={I.map}/></div>
            <h2 className="pp-card-title">Location & Work</h2>
          </div>
          <div className="pp-form-grid">
            <div className="pp-form-group">
              <label className="pp-label">City</label>
              <input className="pp-input" name="city" value={d.city} onChange={handleChange}/>
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Country</label>
              <input className="pp-input" name="country" value={d.country} onChange={handleChange}/>
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Job Title</label>
              <input className="pp-input" name="jobTitle" value={d.jobTitle} onChange={handleChange}/>
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Company / Org</label>
              <input className="pp-input" name="company" value={d.company} onChange={handleChange}/>
            </div>
            <div className="pp-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="pp-label">Website URL</label>
              <div className="pp-input-wrapper">
                <span className="pp-input-icon"><Ic d={I.globe}/></span>
                <input className="pp-input has-icon" type="url" name="website" value={d.website} onChange={handleChange}/>
              </div>
            </div>
          </div>
        </div>

        {/* 3. About Me */}
        <div className="pp-card full-width">
          <div className="pp-card-header">
            <div className="pp-card-icon"><Ic d={I.quote}/></div>
            <h2 className="pp-card-title">About Me</h2>
          </div>
          <div className="pp-form-group" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <label className="pp-label">Bio</label>
              <span className="pp-muted-txt">{d.bio.length}/280</span>
            </div>
            <textarea className="pp-input pp-textarea" name="bio" value={d.bio} onChange={e => e.target.value.length<=280 && handleChange(e)} rows={3} placeholder="Write a short bio..."/>
          </div>
          <div className="pp-form-grid">
            <div className="pp-form-group">
              <label className="pp-label">Skills</label>
              <TagInput tags={skills} setTags={setSkills} placeholder="Add a skill..." />
            </div>
            <div className="pp-form-group">
              <label className="pp-label">Languages</label>
              <TagInput tags={languages} setTags={setLanguages} placeholder="Add a language..." />
            </div>
          </div>
        </div>

        {/* 4. Social Links */}
        <div className="pp-card">
          <div className="pp-card-header">
            <div className="pp-card-icon"><Ic d={I.share}/></div>
            <h2 className="pp-card-title">Social Links</h2>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {['Twitter', 'LinkedIn', 'GitHub', 'Portfolio'].map(plat => (
              <div className="pp-input-wrapper" key={plat}>
                <span className="pp-input-icon" style={{ fontSize: '0.8rem', fontWeight: 700, fontStyle: 'italic' }}>{plat.substring(0,2)}</span>
                <input className="pp-input has-icon" placeholder={`${plat} URL`} name={plat.toLowerCase()} value={d[plat.toLowerCase()]} onChange={handleChange}/>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Notifications */}
        <div className="pp-card">
          <div className="pp-card-header">
            <div className="pp-card-icon"><Ic d={I.bell}/></div>
            <h2 className="pp-card-title">Notifications</h2>
          </div>
          <div>
            <Toggle label="Email notifications" on={d.notifEmail} setOn={v=>u('notifEmail',v)}/>
            <Toggle label="Push notifications" on={d.notifPush} setOn={v=>u('notifPush',v)}/>
            <Toggle label="Weekly digest" on={d.notifDigest} setOn={v=>u('notifDigest',v)}/>
            <Toggle label="New follower alerts" on={d.notifFollows} setOn={v=>u('notifFollows',v)}/>
            <Toggle label="Product updates" on={d.notifUpdates} setOn={v=>u('notifUpdates',v)}/>
          </div>
        </div>

        {/* 5. Security */}
        <div className="pp-card full-width">
          <div className="pp-card-header">
            <div className="pp-card-icon"><Ic d={I.shield}/></div>
            <h2 className="pp-card-title">Security & Privacy</h2>
          </div>
          <div className="pp-grid" style={{ marginBottom: 0 }}>
            <div>
              <h3 className="pp-label" style={{ marginBottom: '1rem', color: 'var(--pp-accent)' }}>Change Password</h3>
              <div className="pp-form-group" style={{ marginBottom: '1rem' }}>
                <input className="pp-input" type="password" placeholder="Current password" name="currentPwd" value={d.currentPwd} onChange={handleChange}/>
              </div>
              <div className="pp-form-group" style={{ marginBottom: '1rem' }}>
                <input className="pp-input" type="password" placeholder="New password" name="newPwd" value={d.newPwd} onChange={handleChange}/>
                {d.newPwd && <div className={`pp-strength-bar pp-strength-${strScore}`}><div className="pp-strength-seg"/><div className="pp-strength-seg"/><div className="pp-strength-seg"/><div className="pp-strength-seg"/></div>}
              </div>
              <div className="pp-form-group" style={{ marginBottom: '1rem' }}>
                <input className="pp-input" type="password" placeholder="Confirm new password" name="confPwd" value={d.confPwd} onChange={handleChange}/>
              </div>
              <button className="pp-btn pp-btn-ghost" style={{ width: '100%', justifyContent:'center' }}>Update Password</button>
            </div>
            
            <div>
              <h3 className="pp-label" style={{ marginBottom: '1rem', color: 'var(--pp-accent)' }}>Account Settings</h3>
              <Toggle label="Two-Factor Auth (2FA)" on={d.twoFa} setOn={v=>u('twoFa',v)}/>
              <div style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                <label className="pp-label">Profile Visibility</label>
                <div style={{ display:'flex', gap:'1rem', marginTop:'0.5rem' }}>
                  {['Public', 'Friends', 'Private'].map(vis => (
                    <label key={vis} style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.85rem' }}>
                      <input type="radio" name="visibility" checked={d.visibility===vis} onChange={()=>u('visibility',vis)}/> {vis}
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ marginTop: '2rem' }}>
                <button className="pp-btn pp-btn-danger" onClick={() => u('deleteConfirm', d.deleteConfirm === null ? '' : null)}>Delete Account</button>
                {d.deleteConfirm !== null && (
                  <div className="pp-delete-confirm">
                    <p className="pp-muted-txt" style={{ marginBottom:'0.5rem' }}>Type <strong>DELETE</strong> to confirm.</p>
                    <input className="pp-input" style={{ borderColor: 'var(--pp-danger)', height: 36, marginBottom: '0.5rem' }} value={d.deleteConfirm} onChange={handleChange} name="deleteConfirm" />
                    <button className="pp-btn" style={{ background: 'var(--pp-danger)', color:'white', height: 36, fontSize:'0.8rem' }} disabled={d.deleteConfirm !== 'DELETE'} onClick={() => showToast('Account deletion simulated', false)}>Confirm Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="pp-action-bar">
        <button className="pp-btn pp-btn-ghost" onClick={handleDiscard}>Discard</button>
        <button className="pp-btn pp-btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? <div className="pp-spinner"/> : <><Ic d={I.save}/> Save Profile</>}
        </button>
      </div>
    </div>
  );
};

export default Profile;
