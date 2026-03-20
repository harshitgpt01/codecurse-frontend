import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';

const signupSchema = z.object({
  firstName: z.string().min(3, "Minimum 3 characters required"),
  emailId: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;700&display=swap');

  .cc-signup-root { min-height:100vh; background:#03020a; display:flex; align-items:center; justify-content:center; padding:24px 16px; font-family:'JetBrains Mono',monospace; position:relative; overflow:hidden; cursor:auto; }
  #cc-signup-canvas { position:fixed; inset:0; z-index:0; pointer-events:none; }
  .cc-signup-noise { position:fixed; inset:0; z-index:1; pointer-events:none; opacity:.04; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size:180px; }
  .cc-signup-grid { position:fixed; inset:0; z-index:0; background-image:linear-gradient(rgba(255,45,45,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,45,45,.04) 1px,transparent 1px); background-size:44px 44px; mask-image:radial-gradient(ellipse 80% 80% at 50% 50%,black,transparent); animation:ccs-grid-drift 20s linear infinite; }
  @keyframes ccs-grid-drift { from{background-position:0 0} to{background-position:44px 44px} }
  .ccs-orb-1 { position:fixed; width:340px; height:340px; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; background:radial-gradient(circle,rgba(255,45,45,.16),transparent 70%); top:-80px; right:-100px; animation:ccs-orb 10s ease-in-out infinite; }
  .ccs-orb-2 { position:fixed; width:260px; height:260px; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; background:radial-gradient(circle,rgba(124,58,237,.14),transparent 70%); bottom:-60px; left:-80px; animation:ccs-orb 12s ease-in-out -5s infinite; }
  @keyframes ccs-orb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-22px) scale(1.06)} }
  .ccs-card { position:relative; z-index:10; width:100%; max-width:440px; background:#0e0d1a; border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:40px 36px; box-shadow:0 32px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,45,45,.06); animation:ccs-card-in .7s cubic-bezier(.16,1,.3,1) both; }
  @keyframes ccs-card-in { from{opacity:0;transform:translateY(32px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .ccs-top-bar { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#ff2d2d,#ff6a1a); border-radius:18px 18px 0 0; }
  .ccs-logo { display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:24px; text-decoration:none; }
  .ccs-logo-skull { width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#ff2d2d,#ff6a1a); display:flex; align-items:center; justify-content:center; font-size:20px; position:relative; overflow:hidden; box-shadow:0 0 20px rgba(255,45,45,.35); }
  .ccs-logo-skull::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.18)); animation:ccs-shimmer 3s linear infinite; }
  @keyframes ccs-shimmer { 0%{transform:translateX(-120%) rotate(45deg)} 100%{transform:translateX(220%) rotate(45deg)} }
  .ccs-logo-text { font-family:'Syne',sans-serif; font-weight:800; font-size:1.4rem; letter-spacing:-.5px; color:#ede8ff; }
  .ccs-logo-text em { color:#ff2d2d; font-style:normal; }
  .ccs-badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px 4px 7px; border:1px solid rgba(255,45,45,.25); border-radius:100px; font-size:.63rem; color:#ff2d2d; background:rgba(255,45,45,.06); }
  .ccs-badge-dot { width:5px; height:5px; background:#ff2d2d; border-radius:50%; animation:ccs-blink 1.5s ease infinite; }
  @keyframes ccs-blink { 0%,100%{opacity:1} 50%{opacity:.15} }
  .ccs-tagline { text-align:center; font-size:.72rem; color:#5a5472; margin-top:8px; margin-bottom:28px; line-height:1.6; }
  .ccs-steps { display:flex; align-items:center; justify-content:center; gap:6px; margin-bottom:28px; }
  .ccs-step { height:3px; border-radius:2px; transition:all .3s cubic-bezier(.16,1,.3,1); }
  .ccs-step.done   { background:linear-gradient(90deg,#ff2d2d,#ff6a1a); width:28px; }
  .ccs-step.active { background:linear-gradient(90deg,#ff2d2d,#ff6a1a); width:40px; box-shadow:0 0 8px rgba(255,45,45,.4); }
  .ccs-step.idle   { background:rgba(255,255,255,.08); width:20px; }
  .ccs-field { margin-bottom:16px; }
  .ccs-label { display:block; font-size:.68rem; color:#5a5472; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:7px; }
  .ccs-input { width:100%; padding:11px 14px; background:#07060f; border:1px solid rgba(255,255,255,.08); border-radius:9px; color:#ede8ff; font-family:'JetBrains Mono',monospace; font-size:.85rem; outline:none; transition:border-color .2s,box-shadow .2s; caret-color:#ff2d2d; }
  .ccs-input::placeholder { color:#3d3856; }
  .ccs-input:focus { border-color:rgba(255,45,45,.4); box-shadow:0 0 0 3px rgba(255,45,45,.08); }
  .ccs-input.error { border-color:rgba(255,45,45,.5); }
  .ccs-pw-wrap { position:relative; }
  .ccs-pw-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#5a5472; padding:2px; transition:color .2s; display:flex; }
  .ccs-pw-btn:hover { color:#ff2d2d; }
  .ccs-err { font-size:.7rem; color:#ff4444; margin-top:5px; display:flex; align-items:center; gap:4px; }
  .ccs-err::before { content:'!'; font-weight:700; }
  .ccs-global-err { background:rgba(255,45,45,.08); border:1px solid rgba(255,45,45,.2); border-radius:8px; padding:10px 14px; font-size:.75rem; color:#ff6b6b; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
  .ccs-strength-wrap { margin-top:8px; }
  .ccs-strength-bar { height:3px; border-radius:2px; background:rgba(255,255,255,.06); overflow:hidden; margin-bottom:4px; }
  .ccs-strength-fill { height:100%; border-radius:2px; transition:width .4s cubic-bezier(.16,1,.3,1),background .3s; }
  .ccs-strength-label { font-size:.62rem; color:#5a5472; }
  .ccs-btn { width:100%; padding:13px; background:linear-gradient(135deg,#ff2d2d,#ff6a1a); border:none; border-radius:9px; color:#fff; font-family:'JetBrains Mono',monospace; font-size:.85rem; font-weight:700; cursor:pointer; margin-top:8px; position:relative; overflow:hidden; box-shadow:0 6px 28px rgba(255,45,45,.3); transition:transform .2s,box-shadow .2s; }
  .ccs-btn::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent); transition:left .5s; }
  .ccs-btn:hover::before { left:100%; }
  .ccs-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 36px rgba(255,45,45,.45); }
  .ccs-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .ccs-btn-inner { display:flex; align-items:center; justify-content:center; gap:8px; }
  .ccs-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:ccs-spin .7s linear infinite; }
  @keyframes ccs-spin { to{transform:rotate(360deg)} }
  .ccs-divider { display:flex; align-items:center; gap:12px; margin:22px 0; color:#3d3856; font-size:.7rem; }
  .ccs-divider::before,.ccs-divider::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.06); }
  .ccs-footer { text-align:center; font-size:.75rem; color:#5a5472; margin-top:22px; }
  .ccs-footer a { color:#ff2d2d; text-decoration:none; font-weight:700; transition:color .2s; }
  .ccs-footer a:hover { color:#ff6a1a; }
  .ccs-perks { display:flex; flex-direction:column; gap:8px; margin-bottom:24px; }
  .ccs-perk { display:flex; align-items:center; gap:10px; font-size:.72rem; color:#5a5472; }
  .ccs-perk-icon { width:22px; height:22px; border-radius:6px; background:rgba(255,45,45,.08); border:1px solid rgba(255,45,45,.15); display:flex; align-items:center; justify-content:center; font-size:.75rem; flex-shrink:0; }
`;

function getStrength(pw) {
  if (!pw) return { pct: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { pct: 20,  label: 'Weak curse',    color: '#ef4444' };
  if (score <= 2) return { pct: 45,  label: 'Fair curse',    color: '#f97316' };
  if (score <= 3) return { pct: 70,  label: 'Good curse',    color: '#eab308' };
  return             { pct: 100, label: 'Cursed strong', color: '#22c55e' };
}

function useSignupParticles() {
  useEffect(() => {
    const canvas = document.getElementById('cc-signup-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function init() {
      resize();
      particles = Array.from({ length: Math.floor(W / 20) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1 + 0.2,
        vx: (Math.random() - .5) * .2, vy: (Math.random() - .5) * .2,
        alpha: Math.random() * .28 + .04,
        color: Math.random() > .6 ? '#ff2d2d' : Math.random() > .5 ? '#ff6a1a' : '#7c3aed',
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    init(); draw();
    window.addEventListener('resize', init);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', init); };
  }, []);
}

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [pwValue, setPwValue] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useSignupParticles();

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const watchedPw = watch('password', '');
  useEffect(() => { setPwValue(watchedPw || ''); }, [watchedPw]);

  // ✅ Redirect to /home (not "/") after successful registration
  useEffect(() => {
    if (isAuthenticated) navigate('/home');
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(registerUser(data));

  const strength = getStrength(pwValue);
  const firstName = watch('firstName', '');
  const emailId   = watch('emailId', '');
  const step = firstName.length >= 3 ? (emailId.includes('@') ? (pwValue.length >= 8 ? 3 : 2) : 1) : 0;

  return (
    <>
      <style>{styles}</style>
      <div className="cc-signup-root">
        <canvas id="cc-signup-canvas" />
        <div className="cc-signup-noise" />
        <div className="cc-signup-grid" />
        <div className="ccs-orb-1" />
        <div className="ccs-orb-2" />

        <div className="ccs-card">
          <div className="ccs-top-bar" />

          {/* ✅ Logo links to "/" (landing) */}
          <NavLink to="/" className="ccs-logo">
            <div className="ccs-logo-skull">☠</div>
            <span className="ccs-logo-text">Code<em>Curse</em></span>
          </NavLink>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div className="ccs-badge" style={{ margin: '0 auto 8px' }}>
              <span className="ccs-badge-dot" />
              Join the cursed coders
            </div>
            <p className="ccs-tagline">Create your account and start breaking curses</p>
          </div>

          {/* Progress steps */}
          <div className="ccs-steps">
            {[0, 1, 2].map(i => (
              <div key={i} className={`ccs-step ${i < step ? 'done' : i === step ? 'active' : 'idle'}`} />
            ))}
          </div>

          {error && (
            <div className="ccs-global-err">
              <span>⚠</span> {typeof error === 'string' ? error : 'Registration failed. Please try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="ccs-field">
              <label className="ccs-label">First Name</label>
              <input type="text" placeholder="John" className={`ccs-input ${errors.firstName ? 'error' : ''}`} {...register('firstName')} />
              {errors.firstName && <div className="ccs-err">{errors.firstName.message}</div>}
            </div>

            <div className="ccs-field">
              <label className="ccs-label">Email</label>
              <input type="email" placeholder="john@example.com" className={`ccs-input ${errors.emailId ? 'error' : ''}`} {...register('emailId')} />
              {errors.emailId && <div className="ccs-err">{errors.emailId.message}</div>}
            </div>

            <div className="ccs-field">
              <label className="ccs-label">Password</label>
              <div className="ccs-pw-wrap">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={`ccs-input ${errors.password ? 'error' : ''}`} style={{ paddingRight: 42 }} {...register('password')} />
                <button type="button" className="ccs-pw-btn" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <div className="ccs-err">{errors.password.message}</div>}
              {pwValue.length > 0 && (
                <div className="ccs-strength-wrap">
                  <div className="ccs-strength-bar">
                    <div className="ccs-strength-fill" style={{ width: strength.pct + '%', background: strength.color }} />
                  </div>
                  <span className="ccs-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="ccs-perks">
              {[{ icon: '🤖', text: 'AI-powered hints on every problem' }, { icon: '⚡', text: 'Real-time code execution' }, { icon: '🗺️', text: 'Personalized DSA roadmap' }].map(p => (
                <div key={p.text} className="ccs-perk">
                  <div className="ccs-perk-icon">{p.icon}</div>
                  {p.text}
                </div>
              ))}
            </div>

            <button type="submit" className="ccs-btn" disabled={loading}>
              <div className="ccs-btn-inner">
                {loading && <span className="ccs-spinner" />}
                {loading ? 'Creating account...' : 'Begin the Curse →'}
              </div>
            </button>
          </form>

          <div className="ccs-divider">or</div>

          <div className="ccs-footer">
            Already cursed?{' '}
            {/* ✅ Links to /login */}
            <NavLink to="/login">Login</NavLink>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
