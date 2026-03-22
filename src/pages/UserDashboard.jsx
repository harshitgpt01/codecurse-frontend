import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #03020a; --surface: #0a0914; --card: #0e0d1a; --card2: #110f1f;
    --border: rgba(255,255,255,.07); --red: #ff2d2d; --orange: #ff6a1a;
    --purple: #7c3aed; --text: #ede8ff; --muted: #5a5472; --dim: #2a2840;
    --mono: 'JetBrains Mono', monospace; --display: 'Syne', sans-serif;
  }

  .db-root { min-height:100vh; background:var(--bg); color:var(--text); font-family:var(--mono); cursor:auto; position:relative; }
  .db-root::before { content:''; position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.025; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size:180px; }

  /* NAV */
  .db-nav { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 36px; height:64px; background:rgba(3,2,10,.92); border-bottom:1px solid var(--border); backdrop-filter:blur(24px); animation:db-slideDown .6s cubic-bezier(.16,1,.3,1) both; }
  @keyframes db-slideDown { from{transform:translateY(-100%);opacity:0} to{transform:none;opacity:1} }
  .db-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
  .db-logo-skull { width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg,var(--red),var(--orange)); display:flex; align-items:center; justify-content:center; font-size:17px; position:relative; overflow:hidden; box-shadow:0 0 18px rgba(255,45,45,.35); }
  .db-logo-skull::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.2)); animation:db-shimmer 3s linear infinite; }
  @keyframes db-shimmer { 0%{transform:translateX(-130%) rotate(45deg)} 100%{transform:translateX(230%) rotate(45deg)} }
  .db-logo-text { font-family:var(--display); font-weight:800; font-size:1.15rem; letter-spacing:-.5px; }
  .db-logo-text em { color:var(--red); font-style:normal; }
  .db-nav-links { display:flex; align-items:center; gap:4px; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:10px; padding:4px; }
  .db-nav-link { padding:6px 16px; border-radius:7px; font-size:.72rem; color:var(--muted); text-decoration:none; transition:all .2s; }
  .db-nav-link:hover { color:var(--text); background:rgba(255,255,255,.05); }
  .db-nav-link.active { background:rgba(255,45,45,.12); color:var(--orange); }
  .db-nav-right { display:flex; align-items:center; gap:10px; }
  .db-logout-btn { padding:7px 16px; border-radius:8px; font-size:.75rem; background:rgba(255,45,45,.08); border:1px solid rgba(255,45,45,.2); color:var(--red); cursor:pointer; font-family:var(--mono); transition:all .2s; }
  .db-logout-btn:hover { background:rgba(255,45,45,.15); }

  /* HERO */
  .db-hero { position:relative; overflow:hidden; padding:40px 36px 36px; border-bottom:1px solid var(--border); }
  .db-hero::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(255,45,45,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,45,45,.04) 1px,transparent 1px); background-size:36px 36px; animation:db-grid 24s linear infinite; mask-image:radial-gradient(ellipse 80% 100% at 20% 50%,black,transparent); }
  @keyframes db-grid { from{background-position:0 0} to{background-position:36px 36px} }
  .db-hero-orb1 { position:absolute; width:300px; height:300px; border-radius:50%; filter:blur(80px); background:radial-gradient(circle,rgba(255,45,45,.15),transparent 70%); top:-80px; left:-60px; pointer-events:none; animation:db-orb 8s ease-in-out infinite; }
  .db-hero-orb2 { position:absolute; width:200px; height:200px; border-radius:50%; filter:blur(70px); background:radial-gradient(circle,rgba(124,58,237,.12),transparent 70%); bottom:-40px; right:80px; pointer-events:none; animation:db-orb 10s ease-in-out -3s infinite; }
  @keyframes db-orb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
  .db-hero-inner { position:relative; z-index:1; max-width:960px; margin:0 auto; display:flex; align-items:center; gap:28px; }
  .db-avatar-big { width:80px; height:80px; border-radius:18px; flex-shrink:0; background:linear-gradient(135deg,var(--red),var(--orange)); display:flex; align-items:center; justify-content:center; font-family:var(--display); font-size:2rem; font-weight:800; color:#fff; box-shadow:0 0 32px rgba(255,45,45,.3); animation:db-avatarIn .7s cubic-bezier(.16,1,.3,1) both; }
  @keyframes db-avatarIn { from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }
  .db-hero-info { animation:db-heroIn .7s .1s cubic-bezier(.16,1,.3,1) both; }
  @keyframes db-heroIn { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:none} }
  .db-hero-eyebrow { font-size:.62rem; color:var(--red); letter-spacing:3px; text-transform:uppercase; margin-bottom:6px; }
  .db-hero-name { font-family:var(--display); font-size:clamp(1.6rem,4vw,2.2rem); font-weight:800; letter-spacing:-1px; line-height:1.1; }
  .db-hero-name span { background:linear-gradient(90deg,var(--red),var(--orange)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .db-hero-email { font-size:.75rem; color:var(--muted); margin-top:6px; }
  .db-hero-meta { font-size:.68rem; color:var(--dim); margin-top:4px; }

  /* MAIN */
  .db-main { max-width:960px; margin:0 auto; padding:32px 36px 80px; position:relative; z-index:1; }
  .db-sec-title { font-family:var(--display); font-size:.95rem; font-weight:800; letter-spacing:-.3px; margin-bottom:16px; display:flex; align-items:center; gap:8px; }
  .db-sec-title-accent { color:var(--red); }

  /* STAT CARDS */
  .db-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:32px; }
  .db-stat-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:20px 18px; position:relative; overflow:hidden; transition:all .25s cubic-bezier(.16,1,.3,1); animation:db-fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
  .db-stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; opacity:0; transition:opacity .25s; }
  .db-stat-card:hover { transform:translateY(-3px); border-color:rgba(255,45,45,.2); background:var(--card2); }
  .db-stat-card:hover::before { opacity:1; }
  .db-stat-card-red::before   { background:linear-gradient(90deg,#ff2d2d,#ff6a1a); }
  .db-stat-card-green::before { background:linear-gradient(90deg,#4ade80,#22c55e); }
  .db-stat-card-yellow::before{ background:linear-gradient(90deg,#fbbf24,#f97316); }
  .db-stat-card-blue::before  { background:linear-gradient(90deg,#60a5fa,#3b82f6); }
  @keyframes db-fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  .db-stat-icon { font-size:1.2rem; margin-bottom:12px; }
  .db-stat-val { font-family:var(--display); font-size:1.8rem; font-weight:800; line-height:1; }
  .db-stat-val-red    { background:linear-gradient(90deg,#ff2d2d,#ff6a1a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .db-stat-val-green  { background:linear-gradient(90deg,#4ade80,#22c55e); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .db-stat-val-yellow { background:linear-gradient(90deg,#fbbf24,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .db-stat-val-blue   { background:linear-gradient(90deg,#60a5fa,#3b82f6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .db-stat-lbl { font-size:.62rem; color:var(--muted); margin-top:6px; }
  .db-progress { height:3px; background:rgba(255,255,255,.06); border-radius:2px; overflow:hidden; margin-top:10px; }
  .db-progress-fill { height:100%; border-radius:2px; background:linear-gradient(90deg,var(--red),var(--orange)); transition:width .9s cubic-bezier(.16,1,.3,1); }

  /* TWO COL */
  .db-two-col { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:32px; }

  /* ACTIVITY CALENDAR */
  .db-calendar-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:22px; }
  .db-cal-cell { border-radius:3px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.04); transition:transform .15s; cursor:default; }
  .db-cal-cell:hover { transform:scale(1.4); }
  .db-cal-cell.level-0 { background:rgba(255,255,255,.04); border-color:rgba(255,255,255,.06); }
  .db-cal-cell.level-1 { background:rgba(255,45,45,.2);  border-color:rgba(255,45,45,.3); }
  .db-cal-cell.level-2 { background:rgba(255,45,45,.4);  border-color:rgba(255,45,45,.5); }
  .db-cal-cell.level-3 { background:rgba(255,45,45,.65); border-color:rgba(255,45,45,.7); }
  .db-cal-cell.level-4 { background:#ff2d2d; border-color:#ff6a1a; box-shadow:0 0 6px rgba(255,45,45,.4); }
  .db-cal-legend { display:flex; align-items:center; gap:6px; margin-top:10px; font-size:.62rem; color:var(--muted); }

  /* DIFF BREAKDOWN */
  .db-diff-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:22px; }
  .db-diff-row { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
  .db-diff-label { font-size:.72rem; min-width:55px; }
  .db-diff-bar-wrap { flex:1; height:8px; background:rgba(255,255,255,.06); border-radius:4px; overflow:hidden; }
  .db-diff-bar { height:100%; border-radius:4px; transition:width 1s cubic-bezier(.16,1,.3,1); }
  .db-diff-bar-easy   { background:linear-gradient(90deg,#4ade80,#22c55e); }
  .db-diff-bar-medium { background:linear-gradient(90deg,#fbbf24,#f97316); }
  .db-diff-bar-hard   { background:linear-gradient(90deg,#f87171,#ff2d2d); }
  .db-diff-count { font-size:.72rem; color:var(--muted); min-width:28px; text-align:right; }

  /* SUBMISSIONS */
  .db-submissions-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:22px; margin-bottom:32px; }
  .db-sub-row { display:grid; grid-template-columns:1fr 100px 80px 100px; align-items:center; padding:12px 16px; border-radius:9px; margin-bottom:6px; background:var(--card2); border:1px solid rgba(255,255,255,.04); transition:all .2s; text-decoration:none; color:var(--text); }
  .db-sub-row:hover { border-color:rgba(255,45,45,.15); background:#130f22; }
  .db-sub-title { font-size:.82rem; font-weight:600; }
  .db-sub-row:hover .db-sub-title { color:#ff8a50; }
  .db-sub-lang { font-size:.68rem; color:var(--muted); }
  .db-sub-status-accepted { font-size:.68rem; color:#4ade80; background:rgba(74,222,128,.08); border:1px solid rgba(74,222,128,.15); padding:3px 8px; border-radius:5px; text-align:center; }
  .db-sub-status-wrong    { font-size:.68rem; color:#f87171; background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.15); padding:3px 8px; border-radius:5px; text-align:center; }
  .db-sub-date { font-size:.65rem; color:var(--muted); text-align:right; }
  .db-sub-head { display:grid; grid-template-columns:1fr 100px 80px 100px; padding:6px 16px; font-size:.6rem; color:var(--muted); letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; }

  /* PROFILE */
  .db-profile-card { background:var(--card); border:1px solid var(--border); border-radius:14px; padding:22px; margin-bottom:32px; }
  .db-profile-row { display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--border); }
  .db-profile-row:last-child { border-bottom:none; }
  .db-profile-key { font-size:.7rem; color:var(--muted); letter-spacing:1px; text-transform:uppercase; }
  .db-profile-val { font-size:.82rem; color:var(--text); }

  /* EMPTY / LOADING */
  .db-empty { text-align:center; padding:40px; color:var(--muted); font-size:.8rem; }
  .db-empty span { display:block; font-size:2rem; opacity:.2; margin-bottom:10px; }
  .db-loading { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px; color:var(--muted); font-size:.78rem; }
  .db-spinner { width:20px; height:20px; border:2px solid rgba(255,45,45,.15); border-top-color:var(--red); border-radius:50%; animation:db-spin .7s linear infinite; }
  @keyframes db-spin { to{transform:rotate(360deg)} }

  @media (max-width:700px) {
    .db-stats-grid { grid-template-columns:repeat(2,1fr); }
    .db-two-col { grid-template-columns:1fr; }
    .db-sub-row,.db-sub-head { grid-template-columns:1fr auto; }
    .db-sub-lang,.db-sub-date { display:none; }
    .db-nav { padding:0 16px; }
    .db-hero,.db-main { padding-left:16px; padding-right:16px; }
    .db-hero-inner { flex-direction:column; align-items:flex-start; gap:16px; }
    .db-nav-links { display:none; }
  }
`;

// ── ACTIVITY CALENDAR DATA ─────────────────────────────────
function generateActivityData(submissions) {
  // Build map of date -> submission count
  const map = {};
  submissions.forEach(s => {
    if (!s.createdAt) return;
    const date = new Date(s.createdAt).toISOString().split('T')[0];
    map[date] = (map[date] || 0) + 1;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from ~26 weeks ago, aligned to Sunday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 181);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

  const weeks = [];
  const monthLabels = [];
  let current = new Date(startDate);
  let weekIdx = 0;

  while (current <= today) {
    const week = [];

    // Month label for this week column
    const firstDayOfWeek = new Date(current);
    const prevWeek = new Date(firstDayOfWeek);
    prevWeek.setDate(firstDayOfWeek.getDate() - 7);
    const showMonth = weekIdx === 0 || firstDayOfWeek.getMonth() !== prevWeek.getMonth();
    monthLabels.push(showMonth
      ? firstDayOfWeek.toLocaleString('default', { month: 'short' })
      : ''
    );

    for (let d = 0; d < 7; d++) {
      const key = current.toISOString().split('T')[0];
      const isFuture = current > today;
      const count = isFuture ? 0 : (map[key] || 0);
      let level = 0;
      if (!isFuture) {
        if (count === 1) level = 1;
        else if (count === 2) level = 2;
        else if (count <= 4) level = 3;
        else if (count >= 5) level = 4;
      }
      week.push({ date: key, count, level, isFuture });
      current.setDate(current.getDate() + 1);
    }

    weeks.push(week);
    weekIdx++;
  }

  return { weeks, monthLabels };
}

// ── FORMAT DATE ────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── STREAK CALCULATOR ──────────────────────────────────────
function calcStreak(submissions) {
  const map = {};
  submissions.forEach(s => {
    if (!s.createdAt) return;
    const d = new Date(s.createdAt).toISOString().split('T')[0];
    map[d] = true;
  });
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (map[d.toISOString().split('T')[0]]) streak++;
    else break;
  }
  return streak;
}

// ── MAIN COMPONENT ─────────────────────────────────────────
export default function UserDashboard() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(state => state.auth);

  const [problems,    setProblems]    = useState([]);
  const [solved,      setSolved]      = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    (async () => {
      setLoading(true);
      try {
        const [p, s, sub] = await Promise.all([
          axiosClient.get('/problem/getAllProblem'),
          axiosClient.get('/problem/problemSolvedByUser'),
          axiosClient.get('/submission/getAllSubmissions'),
        ]);
        setProblems(p.data || []);
        setSolved(s.data || []);
        setSubmissions(sub.data || []);
      } catch(e) { console.error(e); }
      setLoading(false);
    })();
  }, [user]);

  const handleLogout = () => { dispatch(logoutUser()); navigate('/'); };

  const totalProblems = problems.length;
  const solvedCount   = solved.length;
  const pct           = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;
  const easySolved    = solved.filter(p => p.difficulty === 'easy').length;
  const mediumSolved  = solved.filter(p => p.difficulty === 'medium').length;
  const hardSolved    = solved.filter(p => p.difficulty === 'hard').length;
  const easyTotal     = problems.filter(p => p.difficulty === 'easy').length;
  const mediumTotal   = problems.filter(p => p.difficulty === 'medium').length;
  const hardTotal     = problems.filter(p => p.difficulty === 'hard').length;

  const { weeks, monthLabels } = generateActivityData(submissions);
  const recentSubs  = [...submissions].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  const streakDays  = calcStreak(submissions);

  return (
    <>
      <style>{styles}</style>
      <div className="db-root">

        {/* NAV */}
        <nav className="db-nav">
          <NavLink to="/home" className="db-logo">
            <div className="db-logo-skull">☠</div>
            <span className="db-logo-text">Code<em>Curse</em></span>
          </NavLink>
          <div className="db-nav-links">
            <NavLink to="/home"      className="db-nav-link">// Problems</NavLink>
            <NavLink to="/dashboard" className="db-nav-link active">// Dashboard</NavLink>
          </div>
          <div className="db-nav-right">
            <button className="db-logout-btn" onClick={handleLogout}>↩ Logout</button>
          </div>
        </nav>

        {/* HERO */}
        <div className="db-hero">
          <div className="db-hero-orb1" /><div className="db-hero-orb2" />
          <div className="db-hero-inner">
            <div className="db-avatar-big">
              {user?.firstName?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="db-hero-info">
              <div className="db-hero-eyebrow">// Cursed Coder Profile</div>
              <div className="db-hero-name">Hey, <span>{user?.firstName}</span> ☠</div>
              <div className="db-hero-email">{user?.emailId}</div>
              <div className="db-hero-meta">
                Role: {user?.role || 'Member'} &nbsp;·&nbsp;
                {solvedCount} problems solved &nbsp;·&nbsp;
                🔥 {streakDays} day streak
              </div>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="db-main">
          {loading ? (
            <div className="db-loading"><div className="db-spinner" /> Loading your stats...</div>
          ) : (
            <>
              {/* STATS */}
              <div className="db-sec-title"><span className="db-sec-title-accent">//</span> Overview</div>
              <div className="db-stats-grid">
                {[
                  { icon:'☠', val:`${solvedCount}/${totalProblems}`, lbl:'Total Solved',   cls:'red',    pct },
                  { icon:'✓', val:easySolved,   lbl:'Easy Solved',   cls:'green',  pct: easyTotal>0   ? Math.round(easySolved/easyTotal*100)     : 0 },
                  { icon:'~', val:mediumSolved, lbl:'Medium Solved', cls:'yellow', pct: mediumTotal>0 ? Math.round(mediumSolved/mediumTotal*100) : 0 },
                  { icon:'☢', val:hardSolved,   lbl:'Hard Solved',   cls:'blue',   pct: hardTotal>0   ? Math.round(hardSolved/hardTotal*100)     : 0 },
                ].map((s, i) => (
                  <div key={i} className={`db-stat-card db-stat-card-${s.cls}`} style={{ animationDelay:`${i*.07}s` }}>
                    <div className="db-stat-icon">{s.icon}</div>
                    <div className={`db-stat-val db-stat-val-${s.cls}`}>{s.val}</div>
                    <div className="db-stat-lbl">{s.lbl}</div>
                    <div className="db-progress"><div className="db-progress-fill" style={{ width:s.pct+'%' }} /></div>
                  </div>
                ))}
              </div>

              {/* TWO COL */}
              <div className="db-two-col">

                {/* ── ACTIVITY CALENDAR (month-wise) ── */}
                <div className="db-calendar-card">
                  <div className="db-sec-title">
                    <span className="db-sec-title-accent">//</span> Activity
                    <span style={{ fontSize:'.7rem', color:'var(--muted)', fontWeight:400 }}>(last 6 months)</span>
                  </div>

                  <div style={{ overflowX:'auto' }}>
                    {/* Month labels row */}
                    <div style={{ display:'flex', gap:3, marginBottom:4, marginLeft:22 }}>
                      {monthLabels.map((label, i) => (
                        <div key={i} style={{ width:13, fontSize:'.55rem', color:'var(--muted)', flexShrink:0, overflow:'visible', whiteSpace:'nowrap' }}>
                          {label}
                        </div>
                      ))}
                    </div>

                    {/* Day labels + grid */}
                    <div style={{ display:'flex', gap:0 }}>
                      {/* Day labels */}
                      <div style={{ display:'flex', flexDirection:'column', gap:3, marginRight:6, paddingTop:1 }}>
                        {['S','M','T','W','T','F','S'].map((d, i) => (
                          <div key={i} style={{ width:14, height:13, fontSize:'.52rem', color: i===0||i===6 ? 'var(--dim)' : 'var(--muted)', lineHeight:'13px', textAlign:'center' }}>
                            {i%2===1 ? d : ''}
                          </div>
                        ))}
                      </div>

                      {/* Week columns */}
                      <div style={{ display:'flex', gap:3 }}>
                        {weeks.map((week, wi) => (
                          <div key={wi} style={{ display:'flex', flexDirection:'column', gap:3 }}>
                            {week.map((cell, di) => (
                              <div
                                key={di}
                                className={`db-cal-cell level-${cell.level}`}
                                style={{ width:13, height:13, opacity: cell.isFuture ? 0.1 : 1 }}
                                title={cell.isFuture ? '' : `${cell.date}: ${cell.count} submission${cell.count!==1?'s':''}`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="db-cal-legend" style={{ marginTop:10 }}>
                      <span>Less</span>
                      {[0,1,2,3,4].map(l => (
                        <div key={l} className={`db-cal-cell level-${l}`} style={{ width:11, height:11, flexShrink:0 }} />
                      ))}
                      <span>More</span>
                    </div>
                  </div>
                </div>

                {/* DIFFICULTY BREAKDOWN */}
                <div className="db-diff-card">
                  <div className="db-sec-title"><span className="db-sec-title-accent">//</span> Difficulty Breakdown</div>
                  <div style={{ marginTop:16 }}>
                    {[
                      { lbl:'Easy',   solved:easySolved,   total:easyTotal,   barCls:'db-diff-bar-easy',   color:'#4ade80' },
                      { lbl:'Medium', solved:mediumSolved, total:mediumTotal, barCls:'db-diff-bar-medium', color:'#fbbf24' },
                      { lbl:'Hard',   solved:hardSolved,   total:hardTotal,   barCls:'db-diff-bar-hard',   color:'#f87171' },
                    ].map(d => (
                      <div key={d.lbl} className="db-diff-row">
                        <span className="db-diff-label" style={{ color:d.color }}>{d.lbl}</span>
                        <div className="db-diff-bar-wrap">
                          <div className={`db-diff-bar ${d.barCls}`} style={{ width:d.total>0?(d.solved/d.total*100)+'%':'0%' }} />
                        </div>
                        <span className="db-diff-count">{d.solved}/{d.total}</span>
                      </div>
                    ))}

                    {/* Streak */}
                    <div style={{ marginTop:24, padding:'16px', background:'rgba(255,45,45,.05)', borderRadius:10, border:'1px solid rgba(255,45,45,.12)' }}>
                      <div style={{ fontSize:'.62rem', color:'var(--muted)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:8 }}>Current Streak</div>
                      <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                        <span style={{ fontFamily:'var(--display)', fontSize:'2.2rem', fontWeight:800, color:'#fbbf24' }}>{streakDays}</span>
                        <span style={{ fontSize:'.75rem', color:'var(--muted)' }}>days</span>
                        <span style={{ fontSize:'1.2rem', marginLeft:4 }}>🔥</span>
                      </div>
                      <div style={{ fontSize:'.68rem', color:'var(--muted)', marginTop:4 }}>
                        Total submissions: {submissions.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROFILE INFO */}
              <div className="db-sec-title" style={{ marginBottom:16 }}>
                <span className="db-sec-title-accent">//</span> Profile Info
              </div>
              <div className="db-profile-card">
                {[
                  { key:'First Name',         val: user?.firstName || '—' },
                  { key:'Email',              val: user?.emailId   || '—' },
                  { key:'Role',               val: user?.role      || 'Member' },
                  { key:'Problems Solved',    val: `${solvedCount} / ${totalProblems} (${pct}%)` },
                  { key:'Current Streak',     val: `${streakDays} days 🔥` },
                  { key:'Total Submissions',  val: submissions.length },
                ].map(row => (
                  <div key={row.key} className="db-profile-row">
                    <span className="db-profile-key">{row.key}</span>
                    <span className="db-profile-val">{row.val}</span>
                  </div>
                ))}
              </div>

              {/* SUBMISSION HISTORY */}
              <div className="db-sec-title" style={{ marginBottom:16 }}>
                <span className="db-sec-title-accent">//</span> Recent Submissions
                <span style={{ fontSize:'.7rem', color:'var(--muted)', fontWeight:400 }}>
                  (latest {Math.min(8, recentSubs.length)})
                </span>
              </div>
              <div className="db-submissions-card">
                {recentSubs.length === 0 ? (
                  <div className="db-empty">
                    <span>☠</span>No submissions yet. Start solving problems!
                  </div>
                ) : (
                  <>
                    <div className="db-sub-head">
                      <span>Problem</span><span>Language</span><span>Status</span><span style={{ textAlign:'right' }}>Date</span>
                    </div>
                    {recentSubs.map((s, i) => (
                      <NavLink key={i} to={`/problem/${s.problemId}`} className="db-sub-row">
                        <span className="db-sub-title">{s.problemName || 'Problem'}</span>
                        <span className="db-sub-lang">{s.language || '—'}</span>
                        <span className={s.status === 'Accepted' ? 'db-sub-status-accepted' : 'db-sub-status-wrong'}>
                          {s.status || 'Attempted'}
                        </span>
                        <span className="db-sub-date">{fmtDate(s.createdAt)}</span>
                      </NavLink>
                    ))}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
