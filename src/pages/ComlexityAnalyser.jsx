import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../authSlice';
import axiosClient from '../utils/axiosClient';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #03020a; --surface: #0a0914; --card: #0e0d1a; --card2: #110f1f;
    --border: rgba(255,255,255,.07); --red: #ff2d2d; --orange: #ff6a1a;
    --purple: #7c3aed; --text: #ede8ff; --muted: #5a5472; --dim: #2a2840;
    --mono: 'JetBrains Mono', monospace; --display: 'Syne', sans-serif;
  }

  .ca-root { min-height:100vh; background:var(--bg); color:var(--text); font-family:var(--mono); position:relative; }
  .ca-root::before { content:''; position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.025; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size:180px; }

  /* NAV */
  .ca-nav { position:sticky; top:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:0 36px; height:64px; background:rgba(3,2,10,.92); border-bottom:1px solid var(--border); backdrop-filter:blur(24px); animation:ca-slideDown .6s cubic-bezier(.16,1,.3,1) both; }
  @keyframes ca-slideDown { from{transform:translateY(-100%);opacity:0} to{transform:none;opacity:1} }
  .ca-logo { display:flex; align-items:center; gap:10px; text-decoration:none; }
  .ca-logo-skull { width:36px; height:36px; border-radius:9px; background:linear-gradient(135deg,var(--red),var(--orange)); display:flex; align-items:center; justify-content:center; font-size:17px; position:relative; overflow:hidden; box-shadow:0 0 18px rgba(255,45,45,.35); }
  .ca-logo-skull::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,transparent 40%,rgba(255,255,255,.22)); animation:ca-shimmer 3s linear infinite; }
  @keyframes ca-shimmer { 0%{transform:translateX(-130%) rotate(45deg)} 100%{transform:translateX(230%) rotate(45deg)} }
  .ca-logo-text { font-family:var(--display); font-weight:800; font-size:1.15rem; letter-spacing:-.5px; }
  .ca-logo-text em { color:var(--red); font-style:normal; }
  .ca-nav-center { display:flex; align-items:center; gap:4px; background:rgba(255,255,255,.03); border:1px solid var(--border); border-radius:10px; padding:4px; }
  .ca-nav-tab { padding:6px 16px; border-radius:7px; font-size:.72rem; color:var(--muted); text-decoration:none; transition:all .2s; font-family:var(--mono); }
  .ca-nav-tab:hover { color:var(--text); background:rgba(255,255,255,.05); }
  .ca-nav-tab.active { background:rgba(255,45,45,.12); color:var(--orange); border:1px solid rgba(255,45,45,.15); }
  .ca-nav-right { display:flex; align-items:center; gap:10px; }
  .ca-user-btn { display:flex; align-items:center; gap:8px; padding:5px 12px 5px 5px; border-radius:10px; background:rgba(255,255,255,.04); border:1px solid var(--border); cursor:pointer; font-family:var(--mono); font-size:.78rem; color:var(--text); transition:all .2s; }
  .ca-user-btn:hover { border-color:rgba(255,45,45,.3); }
  .ca-avatar { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,var(--red),var(--orange)); display:flex; align-items:center; justify-content:center; font-size:.72rem; font-weight:700; color:#fff; }

  /* HERO */
  .ca-hero { position:relative; overflow:hidden; padding:40px 36px 36px; border-bottom:1px solid var(--border); }
  .ca-hero::before { content:''; position:absolute; inset:0; background-image:linear-gradient(rgba(255,45,45,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,45,45,.04) 1px,transparent 1px); background-size:36px 36px; animation:ca-grid 24s linear infinite; mask-image:radial-gradient(ellipse 80% 100% at 20% 50%,black,transparent); }
  @keyframes ca-grid { from{background-position:0 0} to{background-position:36px 36px} }
  .ca-hero-orb1 { position:absolute; width:300px; height:300px; border-radius:50%; filter:blur(80px); background:radial-gradient(circle,rgba(255,45,45,.15),transparent 70%); top:-80px; left:-60px; pointer-events:none; animation:ca-orb 8s ease-in-out infinite; }
  .ca-hero-orb2 { position:absolute; width:200px; height:200px; border-radius:50%; filter:blur(70px); background:radial-gradient(circle,rgba(124,58,237,.12),transparent 70%); bottom:-40px; right:120px; pointer-events:none; animation:ca-orb 10s ease-in-out -3s infinite; }
  @keyframes ca-orb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
  .ca-hero-inner { position:relative; z-index:1; max-width:960px; margin:0 auto; }
  .ca-hero-eyebrow { font-size:.65rem; color:var(--red); letter-spacing:3px; text-transform:uppercase; margin-bottom:8px; display:flex; align-items:center; gap:8px; }
  .ca-hero-eyebrow::before { content:''; display:inline-block; width:20px; height:1px; background:var(--red); }
  .ca-hero-title { font-family:var(--display); font-size:clamp(1.6rem,4vw,2.4rem); font-weight:800; letter-spacing:-1px; line-height:1.1; margin-bottom:10px; }
  .ca-hero-title em { background:linear-gradient(90deg,var(--red),var(--orange)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; font-style:normal; }
  .ca-hero-sub { font-size:.78rem; color:var(--muted); }

  /* MAIN */
  .ca-main { max-width:960px; margin:0 auto; padding:32px 36px 80px; position:relative; z-index:1; }

  /* EXAMPLES */
  .ca-examples-row { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:20px; }
  .ca-example-chip { padding:5px 14px; border-radius:8px; font-size:.68rem; background:var(--card); border:1px solid var(--border); color:var(--muted); cursor:pointer; font-family:var(--mono); transition:all .2s; }
  .ca-example-chip:hover { color:var(--text); border-color:rgba(255,45,45,.3); background:rgba(255,45,45,.06); }

  /* EDITOR AREA */
  .ca-editor-wrap { position:relative; margin-bottom:16px; }
  .ca-editor-header { display:flex; align-items:center; justify-content:space-between; background:#070614; border:1px solid var(--border); border-bottom:none; border-radius:12px 12px 0 0; padding:10px 16px; }
  .ca-editor-lang-label { font-size:.68rem; color:var(--muted); letter-spacing:2px; text-transform:uppercase; }
  .ca-editor-dots { display:flex; gap:6px; }
  .ca-editor-dot { width:10px; height:10px; border-radius:50%; }
  .ca-textarea { width:100%; min-height:220px; padding:16px 18px; font-family:var(--mono); font-size:.82rem; background:#070614; border:1px solid var(--border); border-top:none; border-radius:0 0 12px 12px; color:var(--text); resize:vertical; outline:none; line-height:1.7; caret-color:var(--red); transition:border-color .2s; }
  .ca-textarea:focus { border-color:rgba(255,45,45,.3); }
  .ca-textarea::placeholder { color:var(--dim); }

  /* CONTROLS */
  .ca-controls { display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:28px; }
  .ca-select { padding:10px 36px 10px 14px; background:var(--card); border:1px solid var(--border); border-radius:9px; color:var(--text); font-family:var(--mono); font-size:.75rem; outline:none; cursor:pointer; appearance:none; transition:all .2s; }
  .ca-select:focus { border-color:rgba(255,45,45,.3); }
  .ca-select-wrap { position:relative; }
  .ca-select-arrow { position:absolute; right:10px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; }
  .ca-btn-analyse { flex:1; padding:11px 24px; background:linear-gradient(135deg,var(--red),var(--orange)); border:none; border-radius:9px; color:#fff; font-family:var(--mono); font-size:.85rem; font-weight:700; cursor:pointer; position:relative; overflow:hidden; box-shadow:0 6px 28px rgba(255,45,45,.3); transition:transform .2s,box-shadow .2s; }
  .ca-btn-analyse::before { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent); transition:left .5s; }
  .ca-btn-analyse:hover::before { left:100%; }
  .ca-btn-analyse:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 36px rgba(255,45,45,.45); }
  .ca-btn-analyse:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .ca-btn-clear { padding:11px 20px; background:rgba(255,255,255,.04); border:1px solid var(--border); border-radius:9px; color:var(--muted); font-family:var(--mono); font-size:.78rem; cursor:pointer; transition:all .2s; }
  .ca-btn-clear:hover { color:var(--text); border-color:rgba(255,255,255,.15); }

  /* RESULT */
  .ca-result { background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; animation:ca-resultIn .5s cubic-bezier(.16,1,.3,1) both; }
  @keyframes ca-resultIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }

  /* COMPLEXITY BADGES */
  .ca-badges-row { display:flex; gap:10px; flex-wrap:wrap; padding:20px 22px; border-bottom:1px solid var(--border); background:rgba(255,255,255,.01); }
  .ca-badge { display:inline-flex; align-items:center; gap:8px; padding:8px 16px; border-radius:10px; font-size:.78rem; font-weight:700; border:1px solid; font-family:var(--mono); }
  .ca-badge-time   { background:rgba(96,165,250,.08);  color:#60a5fa; border-color:rgba(96,165,250,.25); }
  .ca-badge-space  { background:rgba(74,222,128,.08);  color:#4ade80; border-color:rgba(74,222,128,.25); }
  .ca-badge-best   { background:rgba(251,191,36,.08);  color:#fbbf24; border-color:rgba(251,191,36,.25); }
  .ca-badge-worst  { background:rgba(248,113,113,.08); color:#f87171; border-color:rgba(248,113,113,.25); }

  .ca-result-body { padding:24px 22px; display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .ca-result-section { }
  .ca-result-section.full { grid-column:1/-1; }
  .ca-sec-title { font-size:.6rem; color:var(--muted); letter-spacing:2.5px; text-transform:uppercase; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  .ca-sec-title::before { content:'//'; color:var(--red); }

  .ca-explanation { font-size:.82rem; color:var(--text); line-height:1.8; font-family:var(--mono); }

  /* LOOP LIST */
  .ca-loop-list { list-style:none; display:flex; flex-direction:column; gap:8px; }
  .ca-loop-item { display:flex; align-items:flex-start; gap:10px; padding:10px 14px; background:var(--card2); border:1px solid var(--border); border-radius:9px; font-size:.78rem; transition:border-color .2s; }
  .ca-loop-item:hover { border-color:rgba(255,45,45,.2); }
  .ca-loop-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:4px; }
  .ca-dot-constant { background:#888780; }
  .ca-dot-log      { background:#4ade80; }
  .ca-dot-linear   { background:#60a5fa; }
  .ca-dot-nlogn    { background:#fbbf24; }
  .ca-dot-quad     { background:#f87171; }
  .ca-dot-exp      { background:#ff2d2d; box-shadow:0 0 6px rgba(255,45,45,.5); }
  .ca-loop-desc { flex:1; color:var(--text); }
  .ca-loop-cplx { color:var(--muted); font-size:.72rem; white-space:nowrap; }

  /* OPTIMIZATION TIP */
  .ca-tip { padding:14px 16px; background:rgba(124,58,237,.06); border:1px solid rgba(124,58,237,.2); border-radius:10px; font-size:.8rem; color:var(--text); line-height:1.8; border-left:3px solid var(--purple); }

  /* BIG O CHART */
  .ca-chart-wrap { margin-top:4px; }
  .ca-chart-bar-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .ca-chart-label { font-size:.68rem; color:var(--muted); width:60px; text-align:right; flex-shrink:0; }
  .ca-chart-bar-bg { flex:1; height:8px; background:rgba(255,255,255,.05); border-radius:4px; overflow:hidden; }
  .ca-chart-bar-fill { height:100%; border-radius:4px; transition:width 1s cubic-bezier(.16,1,.3,1); }
  .ca-chart-current { border-right:2px solid var(--red); }

  /* LOADING */
  .ca-loading { display:flex; align-items:center; justify-content:center; gap:14px; padding:50px; color:var(--muted); font-size:.78rem; flex-direction:column; }
  .ca-loading-spinner { width:32px; height:32px; border:2px solid rgba(255,45,45,.15); border-top-color:var(--red); border-radius:50%; animation:ca-spin .7s linear infinite; }
  @keyframes ca-spin { to{transform:rotate(360deg)} }
  .ca-loading-text { color:var(--muted); font-size:.75rem; animation:ca-blink2 1.5s ease-in-out infinite; }
  @keyframes ca-blink2 { 0%,100%{opacity:.5} 50%{opacity:1} }

  /* ERROR */
  .ca-error { padding:20px 22px; background:rgba(255,45,45,.06); border-radius:14px; border:1px solid rgba(255,45,45,.2); font-size:.8rem; color:#ff8a8a; }

  /* EMPTY STATE */
  .ca-empty { text-align:center; padding:60px 20px; color:var(--muted); }
  .ca-empty-icon { font-size:3rem; opacity:.15; margin-bottom:16px; }
  .ca-empty-text { font-size:.8rem; }

  @media (max-width:700px) {
    .ca-nav { padding:0 16px; }
    .ca-hero,.ca-main { padding-left:16px; padding-right:16px; }
    .ca-result-body { grid-template-columns:1fr; }
    .ca-nav-center { display:none; }
  }
`;

const EXAMPLES = {
  'Bubble Sort': `function bubbleSort(arr) {\n  const n = arr.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}`,
  'Binary Search': `function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}`,
  'Fibonacci': `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}`,
  'Two Sum': `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
  'Merge Sort': `function mergeSort(arr) {\n  if (arr.length <= 1) return arr;\n  const mid = Math.floor(arr.length / 2);\n  const left = mergeSort(arr.slice(0, mid));\n  const right = mergeSort(arr.slice(mid));\n  return merge(left, right);\n}\n\nfunction merge(left, right) {\n  const result = [];\n  let i = 0, j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] <= right[j]) result.push(left[i++]);\n    else result.push(right[j++]);\n  }\n  return [...result, ...left.slice(i), ...right.slice(j)];\n}`,
};

const BIG_O_LEVELS = [
  { label: 'O(1)',      pct: 5,   color: '#4ade80', cls: 'ca-dot-constant' },
  { label: 'O(log n)',  pct: 15,  color: '#4ade80', cls: 'ca-dot-log'      },
  { label: 'O(n)',      pct: 35,  color: '#60a5fa', cls: 'ca-dot-linear'   },
  { label: 'O(n log n)',pct: 55,  color: '#fbbf24', cls: 'ca-dot-nlogn'    },
  { label: 'O(n²)',     pct: 75,  color: '#f87171', cls: 'ca-dot-quad'     },
  { label: 'O(2ⁿ)',     pct: 92,  color: '#ff2d2d', cls: 'ca-dot-exp'      },
  { label: 'O(n!)',     pct: 100, color: '#ff2d2d', cls: 'ca-dot-exp'      },
];

function getDotClass(complexity = '') {
  const c = complexity.toLowerCase();
  if (c.includes('1)'))        return 'ca-dot-constant';
  if (c.includes('log'))       return 'ca-dot-log';
  if (c.includes('n log') || c.includes('n²') === false && c.includes('n)')) return 'ca-dot-linear';
  if (c.includes('n²') || c.includes('n^2')) return 'ca-dot-quad';
  if (c.includes('2^') || c.includes('2ⁿ')) return 'ca-dot-exp';
  if (c.includes('n!'))        return 'ca-dot-exp';
  return 'ca-dot-linear';
}

function getBarPct(complexity = '') {
  const c = complexity.toLowerCase();
  if (c.includes('n!'))   return 100;
  if (c.includes('2^') || c.includes('2ⁿ')) return 92;
  if (c.includes('n²') || c.includes('n^2')) return 75;
  if (c.includes('n log')) return 55;
  if (c.includes('n)'))   return 35;
  if (c.includes('log'))  return 15;
  if (c.includes('1)'))   return 5;
  return 35;
}

export default function ComplexityAnalyser() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const [code,     setCode]     = useState('');
  const [lang,     setLang]     = useState('javascript');
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState('');

  const handleLogout = () => { dispatch(logoutUser()); navigate('/'); };

  const analyseCode = async () => {
    if (!code.trim()) return;
    setLoading(true); setError(''); setResult(null);

    const prompt = `Analyse the time and space complexity of this ${lang} code.
Respond ONLY with a valid JSON object — no markdown, no backticks, nothing outside the JSON.

{
  "timeComplexity": "O(n²)",
  "spaceComplexity": "O(n)",
  "bestCase": "O(n)",
  "worstCase": "O(n²)",
  "explanation": "2-3 sentences explaining WHY these complexities",
  "loops": [
    { "description": "Outer loop iterates n times", "complexity": "O(n)" },
    { "description": "Inner loop iterates n-i times", "complexity": "O(n)" }
  ],
  "optimizationTip": "One concrete suggestion to reduce complexity"
}

Code:
\`\`\`${lang}
${code}
\`\`\``;

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      const raw = (data.content || []).map(b => b.text || '').join('');
      const clean = raw.replace(/```json|```/g, '').trim();
      setResult(JSON.parse(clean));
    } catch (e) {
      setError('Analysis failed. Please check your code and try again.');
    }
    setLoading(false);
  };

  const timePct   = result ? getBarPct(result.timeComplexity)  : 0;
  const spacePct  = result ? getBarPct(result.spaceComplexity) : 0;

  return (
    <>
      <style>{styles}</style>
      <div className="ca-root">

        {/* NAV */}
        <nav className="ca-nav">
          <NavLink to="/home" className="ca-logo">
            <div className="ca-logo-skull">☠</div>
            <span className="ca-logo-text">Code<em>Curse</em></span>
          </NavLink>

          <div className="ca-nav-center">
            <NavLink to="/home"       className="ca-nav-tab">// Problems</NavLink>
            <NavLink to="/analyser"   className="ca-nav-tab active">// Analyser</NavLink>
            <NavLink to="/dashboard"  className="ca-nav-tab">// Dashboard</NavLink>
          </div>

          <div className="ca-nav-right">
            <button className="ca-user-btn" onClick={handleLogout}>
              <div className="ca-avatar">{user?.firstName?.[0]?.toUpperCase() || '?'}</div>
              {user?.firstName}
            </button>
          </div>
        </nav>

        {/* HERO */}
        <div className="ca-hero">
          <div className="ca-hero-orb1" /><div className="ca-hero-orb2" />
          <div className="ca-hero-inner">
            <div className="ca-hero-eyebrow">// AI-Powered Tool</div>
            <div className="ca-hero-title">
              Complexity <em>Analyser</em>
            </div>
            <div className="ca-hero-sub">
              Paste your code — get instant time & space complexity with AI explanation
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="ca-main">

          {/* Example chips */}
          <div className="ca-examples-row">
            {Object.keys(EXAMPLES).map(name => (
              <button key={name} className="ca-example-chip"
                onClick={() => { setCode(EXAMPLES[name]); setLang('javascript'); setResult(null); }}>
                {name}
              </button>
            ))}
          </div>

          {/* Code editor */}
          <div className="ca-editor-wrap">
            <div className="ca-editor-header">
              <span className="ca-editor-lang-label">{lang}</span>
              <div className="ca-editor-dots">
                <div className="ca-editor-dot" style={{ background:'#ff5f57' }} />
                <div className="ca-editor-dot" style={{ background:'#febc2e' }} />
                <div className="ca-editor-dot" style={{ background:'#28c840' }} />
              </div>
            </div>
            <textarea
              className="ca-textarea"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder={`// Paste your ${lang} code here...\nfunction example(arr) {\n  // ...\n}`}
              spellCheck={false}
            />
          </div>

          {/* Controls */}
          <div className="ca-controls">
            <div className="ca-select-wrap">
              <select className="ca-select" value={lang} onChange={e => setLang(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="typescript">TypeScript</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </select>
              <svg className="ca-select-arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <button className="ca-btn-analyse" onClick={analyseCode} disabled={loading || !code.trim()}>
              {loading ? 'Analysing...' : '⚡ Analyse Complexity'}
            </button>
            <button className="ca-btn-clear" onClick={() => { setCode(''); setResult(null); setError(''); }}>
              Clear
            </button>
          </div>

          {/* Result area */}
          {loading && (
            <div className="ca-result">
              <div className="ca-loading">
                <div className="ca-loading-spinner" />
                <span className="ca-loading-text">☠ Cursed AI is thinking...</span>
              </div>
            </div>
          )}

          {error && <div className="ca-error">⚠ {error}</div>}

          {result && !loading && (
            <div className="ca-result">

              {/* Badges */}
              <div className="ca-badges-row">
                <span className="ca-badge ca-badge-time">⏱ Time: {result.timeComplexity}</span>
                <span className="ca-badge ca-badge-space">▣ Space: {result.spaceComplexity}</span>
                {result.bestCase  && <span className="ca-badge ca-badge-best">↓ Best: {result.bestCase}</span>}
                {result.worstCase && <span className="ca-badge ca-badge-worst">↑ Worst: {result.worstCase}</span>}
              </div>

              <div className="ca-result-body">

                {/* Explanation */}
                <div className="ca-result-section full">
                  <div className="ca-sec-title">Explanation</div>
                  <div className="ca-explanation">{result.explanation}</div>
                </div>

                {/* Loop breakdown */}
                {result.loops?.length > 0 && (
                  <div className="ca-result-section">
                    <div className="ca-sec-title">Loop Breakdown</div>
                    <ul className="ca-loop-list">
                      {result.loops.map((loop, i) => (
                        <li key={i} className="ca-loop-item">
                          <span className={`ca-loop-dot ${getDotClass(loop.complexity)}`} />
                          <span className="ca-loop-desc">{loop.description}</span>
                          <span className="ca-loop-cplx">{loop.complexity}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Big O scale */}
                <div className="ca-result-section">
                  <div className="ca-sec-title">Big O Scale</div>
                  <div className="ca-chart-wrap">
                    {BIG_O_LEVELS.map((level, i) => {
                      const isTimeCurrent = result.timeComplexity?.includes(level.label.replace('O(','').replace(')','')) || result.timeComplexity === level.label;
                      return (
                        <div key={i} className="ca-chart-bar-row">
                          <span className="ca-chart-label" style={{ color: isTimeCurrent ? '#ede8ff' : '' }}>
                            {level.label}
                          </span>
                          <div className="ca-chart-bar-bg">
                            <div
                              className="ca-chart-bar-fill"
                              style={{
                                width: level.pct + '%',
                                background: isTimeCurrent
                                  ? `linear-gradient(90deg,${level.color},${level.color}88)`
                                  : 'rgba(255,255,255,.08)',
                                boxShadow: isTimeCurrent ? `0 0 8px ${level.color}44` : 'none',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Optimization tip */}
                {result.optimizationTip && (
                  <div className="ca-result-section full">
                    <div className="ca-sec-title">Optimization Tip</div>
                    <div className="ca-tip">💡 {result.optimizationTip}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !result && !error && (
            <div className="ca-empty">
              <div className="ca-empty-icon">⚡</div>
              <div className="ca-empty-text">Paste code above and click Analyse to get started</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
