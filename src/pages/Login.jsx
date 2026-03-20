import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';

const loginSchema = z.object({
  emailId: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;700&display=swap');

  .cc-login-root {
    min-height: 100vh; background: #03020a;
    display: flex; align-items: center; justify-content: center;
    font-family: 'JetBrains Mono', monospace;
    position: relative; overflow: hidden; cursor: auto;
  }
  #cc-login-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
  .cc-login-noise {
    position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: .04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }
  .cc-login-grid {
    position: fixed; inset: 0; z-index: 0;
    background-image: linear-gradient(rgba(255,45,45,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,45,45,.04) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
    animation: cc-grid-drift 20s linear infinite;
  }
  @keyframes cc-grid-drift { from{background-position:0 0} to{background-position:44px 44px} }
  .cc-orb-1 { position:fixed; width:380px; height:380px; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; background:radial-gradient(circle,rgba(255,45,45,.18),transparent 70%); top:-100px; left:-120px; animation:cc-orb 9s ease-in-out infinite; }
  .cc-orb-2 { position:fixed; width:260px; height:260px; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; background:radial-gradient(circle,rgba(124,58,237,.15),transparent 70%); bottom:-60px; right:-80px; animation:cc-orb 11s ease-in-out -4s infinite; }
  @keyframes cc-orb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-24px) scale(1.06)} }
  .cc-card { position:relative; z-index:10; width:100%; max-width:420px; background:#0e0d1a; border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:40px 36px; box-shadow:0 32px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,45,45,.06); animation:cc-card-in .7s cubic-bezier(.16,1,.3,1) both; }
  @keyframes cc-card-in { from{opacity:0;transform:translateY(32px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  .cc-card-top-bar { position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,#ff2d2d,#ff6a1a); border-radius:18px 18px 0 0; }
  .cc-logo { display:flex; align-items:center; gap:10px; justify-content:center; margin-bottom:28px; text-decoration:none; }
  .cc-logo-skull { width:40px; height:40px; border-radius:10px; background:linear-gradient(135deg,#ff2d2d,#ff6a1a); display:flex; align-items:center; justify-content:center; font-size:20px; position:relative; overflow:hidden; box-shadow:0 0 20px rgba(255,45,45,.35); }
  .cc-logo-skull::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.18)); animation:cc-shimmer 3s linear infinite; }
  @keyframes cc-shimmer { 0%{transform:translateX(-120%) rotate(45deg)} 100%{transform:translateX(220%) rotate(45deg)} }
  .cc-logo-text { font-family:'Syne',sans-serif; font-weight:800; font-size:1.4rem; letter-spacing:-.5px; color:#ede8ff; }
  .cc-logo-text em { color:#ff2d2d; font-style:normal; }
  .cc-tagline { text-align:center; font-size:.72rem; color:#5a5472; margin-bottom:32px; line-height:1.6; }
  .cc-field { margin-bottom:18px; }
  .cc-label { display:block; font-size:.68rem; color:#5a5472; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:8px; }
  .cc-input { width:100%; padding:11px 14px; background:#07060f; border:1px solid rgba(255,255,255,.08); border-radius:9px; color:#ede8ff; font-family:'JetBrains Mono',monospace; font-size:.85rem; outline:none; transition:border-color .2s,box-shadow .2s; caret-color:#ff2d2d; }
  .cc-input::placeholder { color:#3d3856; }
  .cc-input:focus { border-color:rgba(255,45,45,.4); box-shadow:0 0 0 3px rgba(255,45,45,.08); }
  .cc-input.error { border-color:rgba(255,45,45,.5); }
  .cc-pw-wrap { position:relative; }
  .cc-pw-toggle { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#5a5472; padding:2px; transition:color .2s; display:flex; }
  .cc-pw-toggle:hover { color:#ff2d2d; }
  .cc-error { font-size:.7rem; color:#ff4444; margin-top:5px; display:flex; align-items:center; gap:4px; }
  .cc-error::before { content:'!'; font-weight:700; }
  .cc-global-error { background:rgba(255,45,45,.08); border:1px solid rgba(255,45,45,.2); border-radius:8px; padding:10px 14px; font-size:.75rem; color:#ff6b6b; margin-bottom:18px; display:flex; align-items:center; gap:8px; }
  .cc-btn { width:100%; padding:13px; background:linear-gradient(135deg,#ff2d2d,#ff6a1a); border:none; border-radius:9px; color:#fff; font-family:'JetBrains Mono',monospace; font-size:.85rem; font-weight:700; cursor:pointer; margin-top:8px; position:relative; overflow:hidden; box-shadow:0 6px 28px rgba(255,45,45,.3); transition:transform .2s,box-shadow .2s; }
  .cc-btn::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent); transition:left .5s; }
  .cc-btn:hover::before { left:100%; }
  .cc-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 36px rgba(255,45,45,.45); }
  .cc-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .cc-btn-inner { display:flex; align-items:center; justify-content:center; gap:8px; }
  .cc-spinner { width:14px; height:14px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:cc-spin .7s linear infinite; }
  @keyframes cc-spin { to{transform:rotate(360deg)} }
  .cc-divider { display:flex; align-items:center; gap:12px; margin:22px 0; color:#3d3856; font-size:.7rem; }
  .cc-divider::before,.cc-divider::after { content:''; flex:1; height:1px; background:rgba(255,255,255,.06); }
  .cc-footer { text-align:center; font-size:.75rem; color:#5a5472; margin-top:22px; }
  .cc-footer a { color:#ff2d2d; text-decoration:none; font-weight:700; transition:color .2s; }
  .cc-footer a:hover { color:#ff6a1a; }
  .cc-badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px 4px 7px; border:1px solid rgba(255,45,45,.25); border-radius:100px; font-size:.63rem; color:#ff2d2d; background:rgba(255,45,45,.06); margin-bottom:10px; }
  .cc-badge-dot { width:5px; height:5px; background:#ff2d2d; border-radius:50%; animation:cc-blink 1.5s ease infinite; }
  @keyframes cc-blink { 0%,100%{opacity:1} 50%{opacity:.15} }
`;

function useLoginParticles() {
  useEffect(() => {
    const canvas = document.getElementById('cc-login-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function init() {
      resize();
      particles = Array.from({ length: Math.floor(W / 22) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1 + 0.2,
        vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
        alpha: Math.random() * .3 + .04,
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

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useLoginParticles();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // ✅ Redirect to /home (not "/") after successful login
  useEffect(() => {
    if (isAuthenticated) navigate('/home');
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => dispatch(loginUser(data));

  return (
    <>
      <style>{styles}</style>
      <div className="cc-login-root">
        <canvas id="cc-login-canvas" />
        <div className="cc-login-noise" />
        <div className="cc-login-grid" />
        <div className="cc-orb-1" />
        <div className="cc-orb-2" />

        <div className="cc-card">
          <div className="cc-card-top-bar" />

          {/* ✅ Logo links to "/" (landing) */}
          <NavLink to="/" className="cc-logo">
            <div className="cc-logo-skull">☠</div>
            <span className="cc-logo-text">Code<em>Curse</em></span>
          </NavLink>

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="cc-badge" style={{ margin: '0 auto 8px' }}>
              <span className="cc-badge-dot" />
              Welcome back, cursed coder
            </div>
            <p className="cc-tagline">Sign in to continue your DSA journey</p>
          </div>

          {error && (
            <div className="cc-global-error">
              <span>⚠</span> {typeof error === 'string' ? error : 'Invalid credentials. Try again.'}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="cc-field">
              <label className="cc-label">Email</label>
              <input type="email" placeholder="john@example.com" className={`cc-input ${errors.emailId ? 'error' : ''}`} {...register('emailId')} />
              {errors.emailId && <div className="cc-error">{errors.emailId.message}</div>}
            </div>

            <div className="cc-field">
              <label className="cc-label">Password</label>
              <div className="cc-pw-wrap">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={`cc-input ${errors.password ? 'error' : ''}`} style={{ paddingRight: 42 }} {...register('password')} />
                <button type="button" className="cc-pw-toggle" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <div className="cc-error">{errors.password.message}</div>}
            </div>

            <button type="submit" className="cc-btn" disabled={loading}>
              <div className="cc-btn-inner">
                {loading && <span className="cc-spinner" />}
                {loading ? 'Signing in...' : 'Login →'}
              </div>
            </button>
          </form>

          <div className="cc-divider">or</div>

          <div className="cc-footer">
            Don't have an account?{' '}
            {/* ✅ Links to /signup */}
            <NavLink to="/signup">Sign Up</NavLink>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
