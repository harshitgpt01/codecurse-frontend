import { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import { logoutUser } from '../authSlice';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #03020a;
    --surface:  #0a0914;
    --card:     #0d0c1a;
    --card2:    #110f1f;
    --border:   rgba(255,255,255,.07);
    --red:      #ff2d2d;
    --orange:   #ff6a1a;
    --purple:   #7c3aed;
    --text:     #ede8ff;
    --muted:    #5a5472;
    --dim:      #2a2840;
    --glow:     rgba(255,45,45,.25);
    --mono:     'JetBrains Mono', monospace;
    --display:  'Syne', sans-serif;
  }

  .hp-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: var(--mono);
    cursor: auto;
    position: relative;
  }

  /* subtle global noise */
  .hp-root::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    opacity: .025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  /* ═══════ NAV ═══════ */
  .hp-nav {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 36px; height: 64px;
    background: rgba(3,2,10,.92);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(24px);
    animation: hp-nav-in .6s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes hp-nav-in { from { transform: translateY(-100%); opacity: 0; } to { transform: none; opacity: 1; } }

  .hp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .hp-logo-skull {
    width: 36px; height: 36px; border-radius: 9px;
    background: linear-gradient(135deg, var(--red), var(--orange));
    display: flex; align-items: center; justify-content: center;
    font-size: 17px; position: relative; overflow: hidden; flex-shrink: 0;
    box-shadow: 0 0 18px var(--glow);
    animation: hp-pulse 3s ease-in-out infinite;
  }
  @keyframes hp-pulse { 0%,100% { box-shadow: 0 0 18px var(--glow); } 50% { box-shadow: 0 0 32px rgba(255,45,45,.45); } }
  .hp-logo-skull::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,.22));
    animation: hp-shimmer 3s linear infinite;
  }
  @keyframes hp-shimmer { 0% { transform: translateX(-130%) rotate(45deg); } 100% { transform: translateX(230%) rotate(45deg); } }
  .hp-logo-text { font-family: var(--display); font-weight: 800; font-size: 1.15rem; letter-spacing: -.5px; color: var(--text); }
  .hp-logo-text em { color: var(--red); font-style: normal; }

  .hp-nav-center {
    display: flex; align-items: center; gap: 4px;
    background: rgba(255,255,255,.03);
    border: 1px solid var(--border);
    border-radius: 10px; padding: 4px;
  }
  .hp-nav-tab {
    padding: 6px 16px; border-radius: 7px;
    font-family: var(--mono); font-size: .72rem;
    color: var(--muted); background: none; border: none; cursor: pointer;
    transition: all .2s; text-decoration: none; display: flex; align-items: center; gap: 6px;
  }
  .hp-nav-tab:hover { color: var(--text); background: rgba(255,255,255,.05); }
  .hp-nav-tab.active {
    background: linear-gradient(135deg, rgba(255,45,45,.15), rgba(255,106,26,.1));
    color: var(--orange); border: 1px solid rgba(255,45,45,.15);
  }

  .hp-nav-right { display: flex; align-items: center; gap: 10px; position: relative; }

  .hp-streak {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 8px;
    background: rgba(251,191,36,.06); border: 1px solid rgba(251,191,36,.18);
    font-size: .7rem; color: #fbbf24;
    transition: all .2s;
  }
  .hp-streak:hover { background: rgba(251,191,36,.1); }

  .hp-user-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 5px 12px 5px 5px; border-radius: 10px;
    background: rgba(255,255,255,.04); border: 1px solid var(--border);
    cursor: pointer; font-family: var(--mono); font-size: .78rem; color: var(--text);
    transition: all .2s;
  }
  .hp-user-btn:hover { border-color: rgba(255,45,45,.3); background: rgba(255,45,45,.05); }

  .hp-avatar {
    width: 30px; height: 30px; border-radius: 8px;
    background: linear-gradient(135deg, var(--red), var(--orange));
    display: flex; align-items: center; justify-content: center;
    font-size: .72rem; font-weight: 700; color: #fff; flex-shrink: 0;
    box-shadow: 0 0 10px var(--glow);
  }

  .hp-dropdown {
    position: absolute; top: calc(100% + 10px); right: 0;
    background: #0e0d1c; border: 1px solid rgba(255,255,255,.1);
    border-radius: 14px; min-width: 210px;
    box-shadow: 0 24px 60px rgba(0,0,0,.8), 0 0 0 1px rgba(255,45,45,.08);
    overflow: hidden; z-index: 200;
    animation: hp-dropIn .2s cubic-bezier(.16,1,.3,1) both;
  }
  @keyframes hp-dropIn { from { opacity: 0; transform: translateY(-10px) scale(.96); } to { opacity: 1; transform: none scale(1); } }

  .hp-dropdown-header {
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--border);
    background: linear-gradient(135deg, rgba(255,45,45,.05), transparent);
  }
  .hp-dropdown-role { font-size: .58rem; color: var(--red); letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 4px; }
  .hp-dropdown-name { font-size: .92rem; color: var(--text); font-weight: 700; font-family: var(--display); }

  .hp-dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px; font-size: .78rem; color: var(--muted);
    text-decoration: none; cursor: pointer; transition: all .2s;
    background: none; border: none; width: 100%; text-align: left;
    font-family: var(--mono);
  }
  .hp-dropdown-item:hover { background: rgba(255,255,255,.04); color: var(--text); }
  .hp-dropdown-item.danger:hover { background: rgba(255,45,45,.08); color: var(--red); }
  .hp-dropdown-divider { height: 1px; background: var(--border); }

  /* ═══════ HERO ═══════ */
  .hp-hero {
    position: relative; overflow: hidden;
    padding: 36px 36px 32px;
    border-bottom: 1px solid var(--border);
  }
  /* animated grid */
  .hp-hero::before {
    content: ''; position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,45,45,.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,45,45,.04) 1px, transparent 1px);
    background-size: 36px 36px;
    animation: hp-grid 24s linear infinite;
    mask-image: radial-gradient(ellipse 80% 100% at 20% 50%, black, transparent);
  }
  @keyframes hp-grid { from { background-position: 0 0; } to { background-position: 36px 36px; } }

  /* glow orbs */
  .hp-hero-orb1 {
    position: absolute; width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,45,45,.14), transparent 70%);
    filter: blur(70px); top: -80px; left: -60px; pointer-events: none;
    animation: hp-orb 8s ease-in-out infinite;
  }
  .hp-hero-orb2 {
    position: absolute; width: 200px; height: 200px; border-radius: 50%;
    background: radial-gradient(circle, rgba(124,58,237,.12), transparent 70%);
    filter: blur(60px); bottom: -40px; right: 80px; pointer-events: none;
    animation: hp-orb 10s ease-in-out -3s infinite;
  }
  @keyframes hp-orb { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-16px); } }

  .hp-hero-inner { position: relative; z-index: 1; max-width: 960px; margin: 0 auto; }

  .hp-hero-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }

  .hp-hero-eyebrow {
    font-size: .65rem; color: var(--red); letter-spacing: 3px;
    text-transform: uppercase; margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .hp-hero-eyebrow::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--red); }

  .hp-hero-title {
    font-family: var(--display); font-size: clamp(1.4rem, 3vw, 2rem);
    font-weight: 800; letter-spacing: -1px; line-height: 1.1;
  }
  .hp-hero-title em { color: var(--red); font-style: normal;
    background: linear-gradient(90deg, var(--red), var(--orange));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  .hp-hero-meta { font-size: .72rem; color: var(--muted); margin-top: 8px; }

  /* ═══════ STAT CARDS ═══════ */
  .hp-stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }

  .hp-stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 18px 16px;
    display: flex; align-items: center; gap: 14px;
    transition: all .25s cubic-bezier(.16,1,.3,1);
    position: relative; overflow: hidden;
  }
  .hp-stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    opacity: 0; transition: opacity .25s;
  }
  .hp-stat-card:hover { transform: translateY(-2px); border-color: rgba(255,45,45,.18); background: var(--card2); }
  .hp-stat-card:hover::before { opacity: 1; }

  .hp-stat-card-red::before    { background: linear-gradient(90deg,#ff2d2d,#ff6a1a); }
  .hp-stat-card-green::before  { background: linear-gradient(90deg,#4ade80,#22c55e); }
  .hp-stat-card-yellow::before { background: linear-gradient(90deg,#fbbf24,#f97316); }
  .hp-stat-card-hard::before   { background: linear-gradient(90deg,#f87171,#ff2d2d); }

  .hp-stat-icon {
    width: 42px; height: 42px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; flex-shrink: 0;
  }
  .hp-stat-icon-red    { background: rgba(255,45,45,.1);  border: 1px solid rgba(255,45,45,.2); }
  .hp-stat-icon-green  { background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.2); }
  .hp-stat-icon-yellow { background: rgba(251,191,36,.1); border: 1px solid rgba(251,191,36,.2); }
  .hp-stat-icon-hard   { background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.2); }

  .hp-stat-val { font-family: var(--display); font-size: 1.4rem; font-weight: 800; line-height: 1; }
  .hp-stat-val-red    { background: linear-gradient(90deg,#ff2d2d,#ff6a1a); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .hp-stat-val-green  { background: linear-gradient(90deg,#4ade80,#22c55e); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .hp-stat-val-yellow { background: linear-gradient(90deg,#fbbf24,#f97316); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .hp-stat-val-hard   { background: linear-gradient(90deg,#f87171,#ff2d2d); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

  .hp-stat-lbl { font-size: .62rem; color: var(--muted); margin-top: 4px; }
  .hp-progress-bar { height: 3px; border-radius: 2px; background: rgba(255,255,255,.06); overflow: hidden; margin-top: 8px; }
  .hp-progress-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg,var(--red),var(--orange)); transition: width .9s cubic-bezier(.16,1,.3,1); }

  /* ═══════ MAIN ═══════ */
  .hp-main { max-width: 960px; margin: 0 auto; padding: 32px 36px 80px; position: relative; z-index: 1; }

  /* ═══════ SECTION HEAD ═══════ */
  .hp-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .hp-section-title {
    font-family: var(--display); font-size: 1.05rem; font-weight: 800; letter-spacing: -.3px;
    display: flex; align-items: center; gap: 8px;
  }
  .hp-section-title-accent { color: var(--red); }
  .hp-section-count { font-size: .7rem; color: var(--muted); font-family: var(--mono); font-weight: 400; }

  /* ═══════ DIFF TABS ═══════ */
  .hp-diff-tabs { display: flex; gap: 6px; }
  .hp-diff-tab {
    padding: 5px 14px; border-radius: 7px; font-size: .68rem;
    border: 1px solid var(--border); background: none;
    color: var(--muted); cursor: pointer; transition: all .2s;
    font-family: var(--mono);
  }
  .hp-diff-tab:hover { color: var(--text); border-color: rgba(255,255,255,.12); }
  .hp-diff-tab.d-all    { }
  .hp-diff-tab.d-all.active    { background: rgba(255,106,26,.12); color: #ff8a50; border-color: rgba(255,106,26,.25); }
  .hp-diff-tab.d-easy.active   { background: rgba(74,222,128,.1);  color: #4ade80; border-color: rgba(74,222,128,.25); }
  .hp-diff-tab.d-medium.active { background: rgba(251,191,36,.1);  color: #fbbf24; border-color: rgba(251,191,36,.25); }
  .hp-diff-tab.d-hard.active   { background: rgba(255,45,45,.1);   color: #ff6b6b; border-color: rgba(255,45,45,.25); }

  /* ═══════ FILTER BAR ═══════ */
  .hp-filter-bar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; align-items: center; }

  .hp-search-wrap { flex: 1; min-width: 220px; position: relative; }
  .hp-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
  .hp-search {
    width: 100%; padding: 10px 14px 10px 38px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text); font-family: var(--mono);
    font-size: .78rem; outline: none; transition: all .2s;
    caret-color: var(--red);
  }
  .hp-search::placeholder { color: var(--dim); }
  .hp-search:focus { border-color: rgba(255,45,45,.35); box-shadow: 0 0 0 3px rgba(255,45,45,.07); background: var(--card2); }

  .hp-select-wrap { position: relative; }
  .hp-select {
    padding: 10px 32px 10px 14px;
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; color: var(--text); font-family: var(--mono);
    font-size: .75rem; outline: none; cursor: pointer;
    transition: all .2s; appearance: none;
  }
  .hp-select:focus { border-color: rgba(255,45,45,.35); background: var(--card2); }
  .hp-select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }

  .hp-clear-btn {
    padding: 10px 14px; border-radius: 10px; font-size: .72rem;
    background: rgba(255,45,45,.07); border: 1px solid rgba(255,45,45,.18);
    color: #ff8a50; white-space: nowrap; cursor: pointer; transition: all .2s;
    font-family: var(--mono);
  }
  .hp-clear-btn:hover { background: rgba(255,45,45,.12); }

  /* ═══════ TABLE ═══════ */
  .hp-table-head {
    display: grid;
    grid-template-columns: 52px 1fr 120px 110px 90px;
    padding: 10px 20px; margin-bottom: 8px;
    font-size: .62rem; color: #8b87a8; letter-spacing: 2.5px; text-transform: uppercase;
    background: rgba(255,255,255,.025);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 10px;
  }

  /* ═══════ PROBLEM ROW ═══════ */
  .hp-problem-row {
    display: grid;
    grid-template-columns: 52px 1fr 120px 110px 90px;
    align-items: center;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 15px 20px; margin-bottom: 7px;
    text-decoration: none; color: var(--text);
    position: relative; overflow: hidden;
    transition: all .22s cubic-bezier(.16,1,.3,1);
  }
  /* shimmer on hover */
  .hp-problem-row::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,45,45,.03), transparent);
    transform: translateX(-100%);
    transition: transform .5s;
  }
  /* left accent bar */
  .hp-problem-row::after {
    content: ''; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px;
    background: linear-gradient(180deg, var(--red), var(--orange));
    border-radius: 0 3px 3px 0;
    transform: scaleY(0); transform-origin: center;
    transition: transform .22s cubic-bezier(.16,1,.3,1);
  }
  .hp-problem-row:hover {
    border-color: rgba(255,45,45,.2);
    background: var(--card2);
    transform: translateX(4px);
    box-shadow: 0 4px 28px rgba(0,0,0,.5), -4px 0 24px rgba(255,45,45,.08);
  }
  .hp-problem-row:hover::before { transform: translateX(200%); }
  .hp-problem-row:hover::after  { transform: scaleY(1); }

  /* solved rows get a faint green top border */
  .hp-row-solved { border-color: rgba(74,222,128,.1); }
  .hp-row-solved:hover { border-color: rgba(74,222,128,.2); }

  .hp-row-num { font-size: .7rem; color: var(--dim); font-weight: 600; }
  .hp-row-title {
    font-size: .86rem; font-weight: 600; color: var(--text);
    transition: color .2s; padding-right: 12px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hp-problem-row:hover .hp-row-title { color: #ff8a50; }

  /* ═══════ BADGES ═══════ */
  .hp-badge {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 4px 11px; border-radius: 6px; font-size: .63rem; font-weight: 700;
    letter-spacing: .5px; text-transform: capitalize;
  }
  .hp-badge-easy   { background: rgba(74,222,128,.1);  color: #4ade80; border: 1px solid rgba(74,222,128,.2); }
  .hp-badge-medium { background: rgba(251,191,36,.1);  color: #fbbf24; border: 1px solid rgba(251,191,36,.2); }
  .hp-badge-hard   { background: rgba(255,45,45,.1);   color: #ff6b6b; border: 1px solid rgba(255,45,45,.2); }
  .hp-badge-tag    { background: rgba(96,165,250,.08); color: #60a5fa; border: 1px solid rgba(96,165,250,.15); }

  .hp-solved-pill {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 6px; font-size: .63rem; font-weight: 600;
    background: rgba(74,222,128,.08); color: #4ade80;
    border: 1px solid rgba(74,222,128,.18);
  }
  .hp-unsolved-dash { font-size: .7rem; color: var(--dim); }

  /* ═══════ EMPTY / LOADING ═══════ */
  .hp-empty {
    text-align: center; padding: 70px 20px;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
  }
  .hp-empty-icon { font-size: 3rem; opacity: .2; display: block; }
  .hp-empty-text { font-size: .82rem; color: var(--muted); }
  .hp-empty-btn {
    padding: 9px 20px; background: rgba(255,45,45,.08);
    border: 1px solid rgba(255,45,45,.2); border-radius: 9px;
    color: #ff8a50; font-family: var(--mono); font-size: .75rem; cursor: pointer;
    transition: all .2s;
  }
  .hp-empty-btn:hover { background: rgba(255,45,45,.14); }

  .hp-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 70px; color: var(--muted); font-size: .78rem; }
  .hp-spinner { width: 20px; height: 20px; border: 2px solid rgba(255,45,45,.15); border-top-color: var(--red); border-radius: 50%; animation: hp-spin .7s linear infinite; }
  @keyframes hp-spin { to { transform: rotate(360deg); } }

  /* ═══════ RESPONSIVE ═══════ */
  @media (max-width: 700px) {
    .hp-stats-row { grid-template-columns: repeat(2,1fr); }
    .hp-table-head, .hp-nav-center { display: none; }
    .hp-problem-row { grid-template-columns: 1fr auto; gap: 8px; }
    .hp-row-num { display: none; }
    .hp-hero, .hp-main { padding-left: 16px; padding-right: 16px; }
    .hp-nav { padding: 0 16px; }
  }
`;

// ── DIFF BADGE ─────────────────────────────────────────────
function DiffBadge({ difficulty }) {
  const map = { easy: 'hp-badge-easy', medium: 'hp-badge-medium', hard: 'hp-badge-hard' };
  return <span className={`hp-badge ${map[difficulty?.toLowerCase()] || ''}`}>{difficulty}</span>;
}

// ── STAT CARD ──────────────────────────────────────────────
function StatCard({ icon, iconCls, cardCls, valCls, value, label, progress }) {
  return (
    <div className={`hp-stat-card ${cardCls}`}>
      <div className={`hp-stat-icon ${iconCls}`}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className={`hp-stat-val ${valCls}`}>{value}</div>
        <div className="hp-stat-lbl">{label}</div>
        {progress !== undefined && (
          <div className="hp-progress-bar">
            <div className="hp-progress-fill" style={{ width: progress + '%' }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT ───────────────────────────────────────────────────
export default function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [problems,       setProblems]       = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [search,         setSearch]         = useState('');
  const [filters,        setFilters]        = useState({ difficulty: 'all', tag: 'all', status: 'all' });
  const navRef = useRef();

  useEffect(() => {
    const h = (e) => { if (navRef.current && !navRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { const { data } = await axiosClient.get('/problem/getAllProblem'); setProblems(data); } catch (e) { console.error(e); }
      if (user) { try { const { data } = await axiosClient.get('/problem/problemSolvedByUser'); setSolvedProblems(data); } catch (e) { console.error(e); } }
      setLoading(false);
    })();
  }, [user]);

  const handleLogout = () => { dispatch(logoutUser()); setSolvedProblems([]); navigate('/'); };
  const isSolved = (id) => solvedProblems.some(sp => sp._id === id);
  const clearFilters = () => { setSearch(''); setFilters({ difficulty: 'all', tag: 'all', status: 'all' }); };
  const hasFilters = search || filters.status !== 'all' || filters.tag !== 'all' || filters.difficulty !== 'all';

  const filtered = problems.filter(p => {
    const diffOk   = filters.difficulty === 'all' || p.difficulty === filters.difficulty;
    const tagOk    = filters.tag === 'all' || p.tags === filters.tag;
    const statusOk = filters.status === 'all' || (filters.status === 'solved' && isSolved(p._id));
    const searchOk = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return diffOk && tagOk && statusOk && searchOk;
  });

  const total  = problems.length;
  const solved = solvedProblems.length;
  const easy   = problems.filter(p => p.difficulty === 'easy').length;
  const medium = problems.filter(p => p.difficulty === 'medium').length;
  const hard   = problems.filter(p => p.difficulty === 'hard').length;
  const pct    = total > 0 ? Math.round((solved / total) * 100) : 0;

  const DIFF_TABS = ['all', 'easy', 'medium', 'hard'];

  return (
    <>
      <style>{styles}</style>
      <div className="hp-root">

        {/* ── NAV ── */}
        <nav className="hp-nav">
          <NavLink to="/home" className="hp-logo">
            <div className="hp-logo-skull">☠</div>
            <span className="hp-logo-text">Code<em>Curse</em></span>
          </NavLink>

          <div className="hp-nav-center">
            <span className="hp-nav-tab active">// Problems</span>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className="hp-nav-tab">⚙ Admin</NavLink>
            )}
          </div>

          <div className="hp-nav-right" ref={navRef}>
            <div className="hp-streak">🔥 {pct}% complete</div>
            <button className="hp-user-btn" onClick={() => setDropdownOpen(v => !v)}>
              <div className="hp-avatar">{user?.firstName?.[0]?.toUpperCase() || '?'}</div>
              {user?.firstName}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>

            {dropdownOpen && (
              <div className="hp-dropdown">
                <div className="hp-dropdown-header">
                  <div className="hp-dropdown-role">{user?.role === 'admin' ? '⚙ Admin' : '// Member'}</div>
                  <div className="hp-dropdown-name">{user?.firstName}</div>
                </div>
                {user?.role === 'admin' && (
                  <NavLink to="/admin" className="hp-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <span>⚙</span> Admin Panel
                  </NavLink>
                )}
                <div className="hp-dropdown-divider" />
                <button className="hp-dropdown-item danger" onClick={handleLogout}>
                  <span>↩</span> Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* ── HERO ── */}
        <div className="hp-hero">
          <div className="hp-hero-orb1" />
          <div className="hp-hero-orb2" />
          <div className="hp-hero-inner">
            <div className="hp-hero-top">
              <div>
                <div className="hp-hero-eyebrow">// Dashboard</div>
                <div className="hp-hero-title">
                  Welcome back, <em>{user?.firstName}</em>.<br />Keep breaking curses.
                </div>
                <div className="hp-hero-meta">{solved} of {total} problems solved · {pct}% complete</div>
              </div>
            </div>

            <div className="hp-stats-row">
              <StatCard icon="☠" iconCls="hp-stat-icon-red" cardCls="hp-stat-card-red"
                valCls="hp-stat-val-red" value={`${solved}/${total}`} label="Total Solved" progress={pct} />
              <StatCard icon="✓" iconCls="hp-stat-icon-green" cardCls="hp-stat-card-green"
                valCls="hp-stat-val-green" value={easy} label="Easy Problems" />
              <StatCard icon="~" iconCls="hp-stat-icon-yellow" cardCls="hp-stat-card-yellow"
                valCls="hp-stat-val-yellow" value={medium} label="Medium Problems" />
              <StatCard icon="☢" iconCls="hp-stat-icon-hard" cardCls="hp-stat-card-hard"
                valCls="hp-stat-val-hard" value={hard} label="Hard Problems" />
            </div>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="hp-main">

          {/* Section head */}
          <div className="hp-section-head">
            <div className="hp-section-title">
              <span className="hp-section-title-accent">//</span>
              Problem Set
              <span className="hp-section-count">({filtered.length})</span>
            </div>
            <div className="hp-diff-tabs">
              {DIFF_TABS.map(d => (
                <button key={d}
                  className={`hp-diff-tab d-${d} ${filters.difficulty === d ? 'active' : ''}`}
                  onClick={() => setFilters(f => ({ ...f, difficulty: d }))}>
                  {d === 'all' ? 'All' : d[0].toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Filter bar */}
          <div className="hp-filter-bar">
            <div className="hp-search-wrap">
              <svg className="hp-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input className="hp-search" placeholder="Search problems..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="hp-select-wrap">
              <select className="hp-select" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                <option value="all">All Problems</option>
                <option value="solved">✓ Solved</option>
              </select>
              <svg className="hp-select-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div className="hp-select-wrap">
              <select className="hp-select" value={filters.tag} onChange={e => setFilters(f => ({ ...f, tag: e.target.value }))}>
                <option value="all">All Tags</option>
                <option value="array">Array</option>
                <option value="linkedList">Linked List</option>
                <option value="graph">Graph</option>
                <option value="dp">DP</option>
              </select>
              <svg className="hp-select-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            {hasFilters && (
              <button className="hp-clear-btn" onClick={clearFilters}>✕ Clear</button>
            )}
          </div>

          {/* Table head */}
          {!loading && filtered.length > 0 && (
            <div className="hp-table-head">
              <span>#</span>
              <span>Title</span>
              <span>Difficulty</span>
              <span>Tag</span>
              <span>Status</span>
            </div>
          )}

          {/* Rows */}
          {loading ? (
            <div className="hp-loading">
              <div className="hp-spinner" /> Loading your problem set...
            </div>
          ) : filtered.length === 0 ? (
            <div className="hp-empty">
              <span className="hp-empty-icon">☠</span>
              <div className="hp-empty-text">No problems match your filters.</div>
              <button className="hp-empty-btn" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            filtered.map((p, idx) => (
              <NavLink key={p._id} to={`/problem/${p._id}`}
                className={`hp-problem-row ${isSolved(p._id) ? 'hp-row-solved' : ''}`}>
                <span className="hp-row-num">{idx + 1}</span>
                <span className="hp-row-title">{p.title}</span>
                <DiffBadge difficulty={p.difficulty} />
                <span className="hp-badge hp-badge-tag">{p.tags}</span>
                {isSolved(p._id)
                  ? <span className="hp-solved-pill"><svg width="9" height="9" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Solved</span>
                  : <span className="hp-unsolved-dash">—</span>
                }
              </NavLink>
            ))
          )}
        </div>
      </div>
    </>
  );
}
