import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as THREE from 'three';
import '../styles/PremiumLogin.css';

const Login = () => {
  const [activePanel, setActivePanel] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPwd, setRegPwd] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  
  const [otpVals, setOtpVals] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  
  const [showPwd, setShowPwd] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'green' });
  const [error, setError] = useState({ target: '', msg: '' });

  const { login } = useAuth();
  const navigate = useNavigate();
  const canvasContainerRef = useRef(null);

  // Initialize Three.js Background exactly as in PremiumLogin.html
  useEffect(() => {
    if (!canvasContainerRef.current) return;
    
    let animationFrameId;
    const container = canvasContainerRef.current;
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.z = 40;
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear existing children
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    
    const particleCount = 420;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];
    const maxDist = 35;
    
    for (let i=0; i<particleCount; i++) {
      positions[i*3] = (Math.random() - 0.5) * maxDist * 2;
      positions[i*3+1] = (Math.random() - 0.5) * maxDist * 2;
      positions[i*3+2] = (Math.random() - 0.5) * maxDist * 1.5;
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.05
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const pMaterial = new THREE.PointsMaterial({
      color: 0x2a7fff,
      size: 0.22,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(geometry, pMaterial);
    scene.add(particles);
    
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x2a7fff,
      transparent: true,
      opacity: 0.12
    });
    
    const linesMesh = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
    scene.add(linesMesh);
    
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let windowHalfX = window.innerWidth / 2;
    let windowHalfY = window.innerHeight / 2;
    
    const onMouseMove = (event) => {
      mouseX = (event.clientX - windowHalfX) * 0.01;
      mouseY = (event.clientY - windowHalfY) * 0.01;
    };
    
    const onResize = () => {
      if (!container) return;
      windowHalfX = window.innerWidth / 2;
      windowHalfY = window.innerHeight / 2;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;
      
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (-targetY - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      const posAttr = particles.geometry.attributes.position;
      const posArray = posAttr.array;
      
      for (let i=0; i<particleCount; i++) {
        posArray[i*3] += velocities[i].x;
        posArray[i*3+1] += velocities[i].y;
        posArray[i*3+2] += velocities[i].z;
        
        if(Math.abs(posArray[i*3]) > maxDist) velocities[i].x *= -1;
        if(Math.abs(posArray[i*3+1]) > maxDist) velocities[i].y *= -1;
        if(Math.abs(posArray[i*3+2]) > maxDist * 0.75) velocities[i].z *= -1;
      }
      posAttr.needsUpdate = true;
      
      let maxConnections = 9;
      const linePositions = [];
      
      for (let i=0; i<particleCount; i++) {
        for (let j=i+1; j<particleCount; j++) {
          const dx = posArray[i*3] - posArray[j*3];
          const dy = posArray[i*3+1] - posArray[j*3+1];
          const dz = posArray[i*3+2] - posArray[j*3+2];
          const distSq = dx*dx + dy*dy + dz*dz;
          
          if (distSq < maxConnections) {
            linePositions.push(
              posArray[i*3], posArray[i*3+1], posArray[i*3+2],
              posArray[j*3], posArray[j*3+1], posArray[j*3+2]
            );
          }
        }
      }
      
      linesMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      renderer.render(scene, camera);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer) renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // UI Helpers
  const showToast = (msg, type = 'green') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type }), 3500);
  };

  const simulateLoad = (callback, delayMs = 1500) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (callback) callback();
    }, delayMs);
  };

  const handlePanelSwitch = (panel) => {
    setError({ target: '', msg: '' });
    setActivePanel(panel);
  };

  // True Authentication Flow
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError({ target: '', msg: '' });
    
    if (!email || !email.includes('@')) {
      setError({ target: 'login-email', msg: 'Valid email required' });
      return;
    }
    if (!password || password.length < 5) {
      setError({ target: 'login-pwd', msg: 'Invalid credentials' });
      return;
    }
    
    setIsLoading(true);
    // Call the AuthContext login
    const result = await login(email, password);
    setIsLoading(false);
    
    if (result.success) {
      navigate('/');
    } else {
      showToast(result.error || 'Authentication failed', 'red');
    }
  };

  // Demo Login flows directly to dashboard bypass
  const handleDemoLogin = async (provider = 'Demo') => {
    setIsLoading(true);
    console.log(`[DemoLogin] Starting flow for provider: ${provider}`);
    try {
      showToast(`Initiating ${provider} authentication...`, 'yellow');
      
      console.log(`[DemoLogin] Fetching /api/auth/demo...`);
      const res = await fetch('http://localhost:5000/api/auth/demo', { method: 'POST' });
      
      if (res.ok) {
        console.log(`[DemoLogin] Response status:`, res.status);
        const data = await res.json();
        console.log(`[DemoLogin] Response data:`, data);
        
        sessionStorage.setItem('user', JSON.stringify(data));
        sessionStorage.setItem('token', data.token);
      } else {
        throw new Error(`Demo login failed with status ${res.status}`);
      }
    } catch (e) {
      console.warn(`[DemoLogin] Backend unreachable or error, falling back to offline demo mode:`, e);
      showToast(`Backend offline. Using Offline Demo Mode...`, 'yellow');
      
      // Offline fallback data
      const offlineData = {
        _id: 'demo123',
        name: 'Demo Admin',
        email: 'demo@safevault.app',
        token: 'offline-demo-token-12345'
      };
      sessionStorage.setItem('user', JSON.stringify(offlineData));
      sessionStorage.setItem('token', offlineData.token);
    } finally {
      // Force an event so AuthContext (if listening) or other components update
      window.dispatchEvent(new Event('storage'));
      
      // Show demo dashboard briefly before truly redirecting
      setIsLoading(false);
      setActivePanel('dashboard');
      
      console.log(`[DemoLogin] Validation successful. Redirecting in 1.5s...`);
      setTimeout(() => {
        navigate('/');
        // Fallback just in case navigate doesn't trigger a full re-render of ProtectedRoute
        setTimeout(() => {
          if (window.location.pathname === '/login') window.location.href = '/';
        }, 100);
      }, 1500);
    }
  };

  const submitOtp = (e) => {
    e.preventDefault();
    if (otpVals.includes('')) {
      showToast('Complete the 6-digit code', 'yellow');
      return;
    }
    simulateLoad(() => setActivePanel('dashboard'), 1200);
  };

  const handleOtpInput = (val, idx) => {
    if (!/^[0-9]*$/.test(val)) return;
    const newVals = [...otpVals];
    newVals[idx] = val;
    setOtpVals(newVals);
    if (val && idx < 5) {
      otpRefs[idx + 1].current.focus();
    }
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otpVals[idx] && idx > 0) {
      otpRefs[idx - 1].current.focus();
    }
  };

  // PW Strength Logic
  const getPwdStrength = () => {
    let score = 0;
    if (regPwd.length >= 8) score++;
    if (/[A-Z]/.test(regPwd)) score++;
    if (/[0-9]/.test(regPwd)) score++;
    if (/[^A-Za-z0-9]/.test(regPwd)) score++;
    return score;
  };
  const secLvl = getPwdStrength();

  return (
    <div className="premium-login-page">
      {/* Toast */}
      <div className={`toast-container ${toast.show ? 'show' : ''}`}>
        <div className={`toast-dot ${toast.type}`}></div>
        <div className="toast-msg">{toast.msg}</div>
      </div>

      <div className="split-layout">
        
        {/* Left Branding Panel */}
        <div className="left-panel">
          <div className="glow-overlay"></div>
          
          <div className="left-content">
            <div className="logo-container">
              <div className="logo-box">
                <svg viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M12 8v4M12 16h.01" strokeWidth="2.5" />
                </svg>
              </div>
              <span className="tag-mono">🔐 Emergency Security Locker</span>
            </div>
            
            <h1>Your <span>Emergency Info,</span> Always Safe</h1>
            <p className="subtitle">SafeVault securely stores your critical life information — medical records, emergency contacts, identity documents, and more — accessible when it matters most.</p>
            
            <div className="features">
              <div className="feature-row">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                </div>
                <div className="feature-text">
                  <h3>Medical &amp; Health Records</h3>
                  <p>Store blood type, allergies, medications, and emergency health data securely.</p>
                </div>
              </div>
              
              <div className="feature-row">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div className="feature-text">
                  <h3>Emergency Contacts</h3>
                  <p>Keep your trusted contacts, family members, and doctors always reachable.</p>
                </div>
              </div>
              
              <div className="feature-row">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div className="feature-text">
                  <h3>Identity &amp; Insurance Docs</h3>
                  <p>Safeguard your ID records, insurance policies, and vital personal notes.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="left-footer">
            &copy; 2025 SafeVault &mdash; Your Emergency Security Locker
          </div>
        </div>
        
        {/* Right Logic Panel */}
        <div className="right-panel">
          <div id="canvas-container" ref={canvasContainerRef}></div>
          
          <div className="form-container">
            
            {/* 1. Login Panel */}
            <div className={`panel ${activePanel === 'login' ? 'active' : ''}`}>
              <div className="panel-header">
                <h2>Welcome Back</h2>
                <p>Enter your credentials to access your vault</p>
              </div>
              
              <form onSubmit={handleLoginSubmit}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <input 
                      type="email" 
                      className={`input-field ${error.target === 'login-email' ? 'error' : ''}`}
                      placeholder="admin@acme.corp"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                  {error.target === 'login-email' && <div className="error-msg show">{error.msg}</div>}
                </div>
                
                <div className="input-group">
                  <label className="input-label">Master Password</label>
                  <div className="input-wrapper">
                    <div className="input-icon">
                      <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </div>
                    <input 
                      type={showPwd ? 'text' : 'password'}
                      className={`input-field ${error.target === 'login-pwd' ? 'error' : ''}`}
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                    <button type="button" className="eye-btn" onClick={() => setShowPwd(!showPwd)}>
                      {showPwd ? 
                        <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> :
                        <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      }
                    </button>
                  </div>
                  {error.target === 'login-pwd' && <div className="error-msg show">{error.msg}</div>}
                </div>
                
                <div className="options-row">
                  <label className="checkbox-group">
                    <input type="checkbox" />
                    <span>Remember this device</span>
                  </label>
                  <button type="button" className="text-link bg-transparent border-0" onClick={() => handlePanelSwitch('forgot')}>Forgot password?</button>
                </div>
                
                <button type="submit" className={`btn-primary ${isLoading ? 'loading' : ''}`}>
                  <span className="btn-text">Sign In &rarr;</span>
                  <div className="spinner"></div>
                </button>
              </form>
              
              <div className="divider">Or continue with</div>
              
              <div className="alt-buttons">
                {/* Google Demo */}
                <button type="button" className="btn-alt google" onClick={() => handleDemoLogin('Google')}>
                  <svg viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
                {/* Passkey Demo */}
                <button type="button" className="btn-alt" onClick={() => handlePanelSwitch('passkey')}>
                  <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="11" r="3"></circle></svg>
                </button>
                {/* Magic Demo */}
                <button type="button" className="btn-alt" onClick={() => handlePanelSwitch('magic')}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                </button>
              </div>
              
              <div className="bottom-link">
                Don't have an account? <button className="text-link bg-transparent border-0" onClick={() => handlePanelSwitch('signup')}>Create one free</button>
              </div>
            </div>
            
            {/* 2. Forgot Panel */}
            <div className={`panel ${activePanel === 'forgot' ? 'active' : ''}`}>
              <button className="back-link bg-transparent border-0" onClick={() => handlePanelSwitch('login')}>
                <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Back to login
              </button>
              <div className="panel-header">
                <h2>Reset Password</h2>
                <p>Enter your email to receive recovery instructions</p>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); simulateLoad(() => handlePanelSwitch('forgot-success'), 1400); }}>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <div className="input-wrapper">
                    <div className="input-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                    <input type="email" className="input-field" placeholder="admin@acme.corp" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                  </div>
                </div>
                <button type="submit" className={`btn-primary ${isLoading ? 'loading' : ''}`} style={{ marginTop: '2rem' }}>
                  <span className="btn-text">Send Instructions</span>
                  <div className="spinner"></div>
                </button>
              </form>
            </div>

            {/* 2.1 Forgot Success Panel */}
            <div className={`panel ${activePanel === 'forgot-success' ? 'active' : ''}`}>
               <div className="success-icon-lg" style={{ width: '60px', height: '60px' }}>
                  <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
               </div>
               <div className="panel-header" style={{ textAlign: 'center' }}>
                <h2>Check your email</h2>
                <p style={{ marginTop: '1rem' }}>We've sent password reset instructions to your address. Please check your spam folder if you don't see it.</p>
              </div>
              <button className="btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => handlePanelSwitch('login')}>
                Return to Login
              </button>
            </div>
            
            {/* 3. Sign Up Panel */}
            <div className={`panel ${activePanel === 'signup' ? 'active' : ''}`}>
              <button className="back-link bg-transparent border-0" onClick={() => handlePanelSwitch('login')}>
                <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Back
              </button>
              <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
                <h2>Create Account</h2>
                <p>Setup your digital fortress</p>
              </div>
              <form onSubmit={(e) => { 
                e.preventDefault(); 
                if (regPwd.length < 8) { showToast('Password must be at least 8 chars', 'red'); return; }
                simulateLoad(() => { showToast('Account created successfully (simulation)', 'green'); setTimeout(() => handlePanelSwitch('login'), 1000); }, 1600);
              }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div className="input-wrapper">
                    <div className="input-icon"><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
                    <input type="text" className="input-field" placeholder="John Doe" required value={regName} onChange={e => setRegName(e.target.value)} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <div className="input-wrapper">
                    <div className="input-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                    <input type="email" className="input-field" placeholder="john@acme.corp" required value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: '2rem' }}>
                  <label className="input-label">Master Password</label>
                  <div className="input-wrapper">
                    <div className="input-icon"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg></div>
                    <input type={showRegPwd ? 'text' : 'password'} className="input-field" placeholder="••••••••" required value={regPwd} onChange={e => setRegPwd(e.target.value)} />
                    <button type="button" className="eye-btn" onClick={() => setShowRegPwd(!showRegPwd)}>
                      {showRegPwd ? 
                        <svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> :
                        <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      }
                    </button>
                  </div>
                  {/* Pwd Strength Demo */}
                  <div className="pwd-strength">
                    <div className="pwd-segment" style={{ background: secLvl >= 1 ? '#ef4444' : 'rgba(255,255,255,0.1)' }}></div>
                    <div className="pwd-segment" style={{ background: secLvl >= 2 ? '#f97316' : 'rgba(255,255,255,0.1)' }}></div>
                    <div className="pwd-segment" style={{ background: secLvl >= 3 ? '#eab308' : 'rgba(255,255,255,0.1)' }}></div>
                    <div className="pwd-segment" style={{ background: secLvl >= 4 ? '#10b981' : 'rgba(255,255,255,0.1)' }}></div>
                  </div>
                </div>
                <button type="submit" className={`btn-primary ${isLoading ? 'loading' : ''}`}>
                  <span className="btn-text">Create Free Account</span>
                  <div className="spinner"></div>
                </button>
              </form>
            </div>
            
            {/* 4. Magic Link Panel */}
            <div className={`panel ${activePanel === 'magic' ? 'active' : ''}`}>
              <button className="back-link bg-transparent border-0" onClick={() => handlePanelSwitch('login')}>
                 <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Back
              </button>
              <div className="panel-header"><h2>Magic Link</h2><p>Passwordless login via email link</p></div>
              <form onSubmit={e => { e.preventDefault(); simulateLoad(() => { setMagicEmail(''); showToast('Magic link sent.', 'green'); }, 1400); }}>
                <div className="input-group mb-6">
                  <label className="input-label">Email Address</label>
                  <div className="input-wrapper">
                    <div className="input-icon"><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                    <input type="email" className="input-field" placeholder="admin@acme.corp" required value={magicEmail} onChange={e => setMagicEmail(e.target.value)}/>
                  </div>
                </div>
                 <button type="submit" className={`btn-primary ${isLoading ? 'loading' : ''}`} style={{ marginTop: '2rem' }}>
                  <span className="btn-text">Send Magic Link</span>
                  <div className="spinner"></div>
                </button>
              </form>
            </div>
            
            {/* 5. Passkey Panel */}
            <div className={`panel ${activePanel === 'passkey' ? 'active' : ''}`}>
              <button className="back-link bg-transparent border-0" onClick={() => handlePanelSwitch('login')}>
                 <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg> Back
              </button>
              <div className="passkey-icon-lg">
                <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="11" r="3"></circle></svg>
              </div>
              <div className="panel-header" style={{ textAlign: 'center' }}>
                <h2>Passkey Auth</h2>
                <p>Use your device biometrics (Touch ID / Face ID) or hardware key to securely log in.</p>
              </div>
              <button className={`btn-primary ${isLoading ? 'loading' : ''}`} onClick={() => handleDemoLogin('Passkey')} style={{ marginTop: '1.5rem' }}>
                <span className="btn-text">Authenticate with Passkey</span>
                <div className="spinner"></div>
              </button>
            </div>
            
            {/* 6. Dashboard / Success Form */}
            <div className={`panel ${activePanel === 'dashboard' ? 'active' : ''}`}>
              <div className="success-icon-lg">
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div className="panel-header" style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#10b981' }}>Access Granted</h2>
                <p>Welcome to SafeVault Admin Console</p>
              </div>
              <div className="status-card">
                <div className="status-row"><span>SESSION:</span><span className="status-val green">ACTIVE</span></div>
                <div className="status-row"><span>ENCRYPTION:</span><span className="status-val blue">AES-256</span></div>
                <div className="status-row"><span>LOCATION:</span><span className="status-val">TRUSTED_LOC_1</span></div>
              </div>
              <button className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', marginTop: '1rem' }} onClick={() => handlePanelSwitch('login')}>
                 Sign Out Dummy
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
