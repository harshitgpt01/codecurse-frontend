import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router"; // ✅ Use Link for navigation

// ── GLOBAL STYLES ──────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; width: 100%; }
  body { background: #03020a; overflow-x: hidden; cursor: none; font-family: 'JetBrains Mono', monospace; }

  #cc-cursor {
    position: fixed; width: 11px; height: 11px;
    background: #ff2d2d; border-radius: 50%;
    pointer-events: none; z-index: 9999;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 18px #ff2d2d, 0 0 36px rgba(255,45,45,.4);
    transition: background .2s;
  }
  #cc-cursor-ring {
    position: fixed; border: 1px solid rgba(255,45,45,.5); border-radius: 50%;
    pointer-events: none; z-index: 9998;
    transform: translate(-50%, -50%);
    transition: width .18s, height .18s, border-color .18s;
  }
  #cc-canvas { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
  .cc-noise {
    position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: .04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
  }

  @keyframes cc-slideDown   { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes cc-heroIn      { from { opacity: 0; transform: translateY(36px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes cc-badgeIn     { from { opacity: 0; transform: scale(.9) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes cc-blink       { 0%,100% { opacity: 1; } 50% { opacity: .15; } }
  @keyframes cc-orbFloat    { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-28px) scale(1.08); } }
  @keyframes cc-gridDrift   { from { background-position: 0 0; } to { background-position: 44px 44px; } }
  @keyframes cc-shimmer     { 0% { transform: translateX(-120%) rotate(45deg); } 100% { transform: translateX(220%) rotate(45deg); } }
  @keyframes cc-gradSlide   { from { background-position: 0% center; } to { background-position: 200% center; } }
  @keyframes cc-glitchTop   { 0%,90%,100%{transform:translateX(0);opacity:0} 91%{transform:translateX(-4px);opacity:.85} 93%{transform:translateX(4px);opacity:.85} 95%{transform:translateX(-2px);opacity:.85} 97%{transform:translateX(0);opacity:0} }
  @keyframes cc-glitchBot   { 0%,88%,100%{transform:translateX(0);opacity:0} 89%{transform:translateX(4px);opacity:.7} 91%{transform:translateX(-4px);opacity:.7} 93%{transform:translateX(2px);opacity:.7} 95%{transform:translateX(0);opacity:0} }
  @keyframes cc-tBlink      { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes cc-ticker      { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes cc-fadeSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes cc-lineIn      { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }
`;

// ── CONSTANTS ──────────────────────────────────────────────
const CODES = {
  cpp: [
    { ln: "1", html: '<span style="color:#3d3856;font-style:italic">// O(n) hashmap — lift the curse</span>' },
    { ln: "2", html: '<span style="color:#60a5fa">vector</span>&lt;<span style="color:#60a5fa">int</span>&gt; <span style="color:#c084fc">twoSum</span>(<span style="color:#60a5fa">vector</span>&lt;<span style="color:#60a5fa">int</span>&gt;&amp; nums, <span style="color:#60a5fa">int</span> target) {' },
    { ln: "3", html: '&nbsp;&nbsp;<span style="color:#60a5fa">unordered_map</span>&lt;<span style="color:#60a5fa">int</span>,<span style="color:#60a5fa">int</span>&gt; seen;' },
    { ln: "4", html: '&nbsp;&nbsp;<span style="color:#ff6a1a">for</span> (<span style="color:#60a5fa">int</span> i=<span style="color:#f87171">0</span>; i&lt;nums.size(); i++) {' },
    { ln: "5", html: '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#60a5fa">int</span> comp = target - nums[i];' },
    { ln: "6", html: '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ff6a1a">if</span> (seen.count(comp)) <span style="color:#ff6a1a">return</span> {seen[comp], i};' },
    { ln: "7", html: "&nbsp;&nbsp;&nbsp;&nbsp;seen[nums[i]] = i;" },
    { ln: "8", html: '&nbsp;&nbsp;} <span style="color:#ff6a1a">return</span> {};' },
    { ln: "9", html: "}" },
  ],
  java: [
    { ln: "1", html: '<span style="color:#3d3856;font-style:italic">// HashMap solution</span>' },
    { ln: "2", html: '<span style="color:#ff6a1a">public</span> <span style="color:#60a5fa">int</span>[] <span style="color:#c084fc">twoSum</span>(<span style="color:#60a5fa">int</span>[] nums, <span style="color:#60a5fa">int</span> target) {' },
    { ln: "3", html: '&nbsp;&nbsp;<span style="color:#60a5fa">Map</span>&lt;<span style="color:#60a5fa">Integer</span>,<span style="color:#60a5fa">Integer</span>&gt; map = <span style="color:#ff6a1a">new</span> <span style="color:#c084fc">HashMap</span>&lt;&gt;();' },
    { ln: "4", html: '&nbsp;&nbsp;<span style="color:#ff6a1a">for</span> (<span style="color:#60a5fa">int</span> i=<span style="color:#f87171">0</span>; i&lt;nums.length; i++) {' },
    { ln: "5", html: '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#60a5fa">int</span> comp = target - nums[i];' },
    { ln: "6", html: '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ff6a1a">if</span> (map.containsKey(comp)) <span style="color:#ff6a1a">return new</span> <span style="color:#60a5fa">int</span>[]{map.get(comp),i};' },
    { ln: "7", html: "&nbsp;&nbsp;&nbsp;&nbsp;map.put(nums[i], i);" },
    { ln: "8", html: '&nbsp;&nbsp;} <span style="color:#ff6a1a">return new</span> <span style="color:#60a5fa">int</span>[]{};' },
    { ln: "9", html: "}" },
  ],
  py: [
    { ln: "1", html: '<span style="color:#3d3856;font-style:italic"># Dict solution — O(n)</span>' },
    { ln: "2", html: '<span style="color:#ff6a1a">def</span> <span style="color:#c084fc">twoSum</span>(nums: list[int], target: int) -> list[int]:' },
    { ln: "3", html: "&nbsp;&nbsp;&nbsp;&nbsp;seen = {}" },
    { ln: "4", html: '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ff6a1a">for</span> i, n <span style="color:#ff6a1a">in</span> <span style="color:#c084fc">enumerate</span>(nums):' },
    { ln: "5", html: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;comp = target - n" },
    { ln: "6", html: '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ff6a1a">if</span> comp <span style="color:#ff6a1a">in</span> seen: <span style="color:#ff6a1a">return</span> [seen[comp], i]' },
    { ln: "7", html: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;seen[n] = i" },
    { ln: "8", html: '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ff6a1a">return</span> []' },
  ],
  js: [
    { ln: "1", html: '<span style="color:#3d3856;font-style:italic">// Map approach</span>' },
    { ln: "2", html: '<span style="color:#ff6a1a">const</span> <span style="color:#c084fc">twoSum</span> = (nums, target) => {' },
    { ln: "3", html: '&nbsp;&nbsp;<span style="color:#ff6a1a">const</span> map = <span style="color:#ff6a1a">new</span> <span style="color:#60a5fa">Map</span>();' },
    { ln: "4", html: '&nbsp;&nbsp;<span style="color:#ff6a1a">for</span> (<span style="color:#ff6a1a">let</span> i=<span style="color:#f87171">0</span>; i&lt;nums.length; i++) {' },
    { ln: "5", html: '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ff6a1a">const</span> comp = target - nums[i];' },
    { ln: "6", html: '&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#ff6a1a">if</span> (map.has(comp)) <span style="color:#ff6a1a">return</span> [map.get(comp), i];' },
    { ln: "7", html: "&nbsp;&nbsp;&nbsp;&nbsp;map.set(nums[i], i);" },
    { ln: "8", html: '&nbsp;&nbsp;} <span style="color:#ff6a1a">return</span> [];' },
    { ln: "9", html: "};" },
  ],
};

const FEATURES = [
  { icon: "🤖", name: "AI-Powered Guidance", desc: "Instant feedback with intelligent suggestions for optimization, alternative approaches, and complexity analysis.", tag: "Smart Hints" },
  { icon: "⚡", name: "Multi-Language Support", desc: "Practice in,JavaScript, Java, and C++ with full syntax highlighting and language-specific optimizations.", tag: "4 Languages" },
  { icon: "📊", name: "Complexity Analyzer", desc: "Visualize time & space complexity instantly. Understand Big-O intuitively with animated breakdowns.", tag: "Big-O Visual" },
  { icon: "🗺️", name: "Adaptive Learning Path", desc: "A personalized problem roadmap that adapts to your strengths — so you level up faster and stay motivated.", tag: "Personalized" },
];

const TICKER_ITEMS = [
  "Arrays", "Linked Lists", "Binary Trees", "Graph BFS", "Dynamic Programming",
  "Recursion", "Sorting", "Hashmaps", "Stack & Queue", "Sliding Window",
  "Two Pointers", "Trie", "Heap", "Backtracking", "Greedy",
];

const LANG_TABS = [
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "py", label: "Python" },
  { id: "js", label: "JS" },
];

// ── HOOKS ──────────────────────────────────────────────────
function useParticles() {
  useEffect(() => {
    const canvas = document.getElementById("cc-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, particles = [], raf;
    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    function init() {
      resize();
      particles = Array.from({ length: Math.floor(W / 16) }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.2 + 0.2,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
        alpha: Math.random() * 0.35 + 0.05,
        color: Math.random() > 0.6 ? "#ff2d2d" : Math.random() > 0.5 ? "#ff6a1a" : "#7c3aed",
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.globalAlpha = p.alpha; ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 85) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = "#ff2d2d";
            ctx.globalAlpha = (1 - d / 85) * 0.09;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    }
    init(); draw();
    window.addEventListener("resize", init);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
      // ✅ Clean up cursor/canvas on unmount so they don't bleed into Login/Signup
      document.body.style.cursor = "auto";
    };
  }, []);
}

function useCursor() {
  useEffect(() => {
    const cur = document.getElementById("cc-cursor");
    const ring = document.getElementById("cc-cursor-ring");
    if (!cur || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0, raf;
    ring.style.width = "36px"; ring.style.height = "36px";
    const onMove = (e) => { mx = e.clientX; my = e.clientY; cur.style.left = mx + "px"; cur.style.top = my + "px"; };
    const animRing = () => { rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12; ring.style.left = rx + "px"; ring.style.top = ry + "px"; raf = requestAnimationFrame(animRing); };
    document.addEventListener("mousemove", onMove);
    animRing();
    const expand = () => { ring.style.width = "52px"; ring.style.height = "52px"; ring.style.borderColor = "rgba(255,45,45,.9)"; };
    const shrink = () => { ring.style.width = "36px"; ring.style.height = "36px"; ring.style.borderColor = "rgba(255,45,45,.5)"; };
    document.querySelectorAll("a, button, [data-hover]").forEach((el) => {
      el.addEventListener("mouseenter", expand);
      el.addEventListener("mouseleave", shrink);
    });
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      // ✅ Remove cursor elements on unmount
      if (cur) cur.style.display = "none";
      if (ring) ring.style.display = "none";
      document.body.style.cursor = "auto";
    };
  }, []);
}

function useScrollReveal(ref) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return visible;
}

// ── SUB-COMPONENTS ─────────────────────────────────────────
function AnimCounter({ target, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef();
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const dur = 1600, start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 4);
        setVal(Math.round(ease * target));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target]);
  return (
    <span ref={ref} style={{ fontFamily: "Syne, sans-serif", fontSize: "1.9rem", fontWeight: 800, background: "linear-gradient(90deg,#ff2d2d,#ff6a1a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block" }}>
      {prefix}{target >= 100 ? val + (val >= target ? "+" : "") : val}{suffix}
    </span>
  );
}

function GlitchText({ text, style }) {
  return (
    <span style={{ position: "relative", display: "inline-block", ...style }}>
      <span aria-hidden style={{ position: "absolute", inset: 0, color: "#ff2d2d", clipPath: "polygon(0 0,100% 0,100% 40%,0 40%)", animation: "cc-glitchTop 4s infinite", transform: "translateX(-2px)" }}>{text}</span>
      {text}
      <span aria-hidden style={{ position: "absolute", inset: 0, color: "#00e5ff", clipPath: "polygon(0 60%,100% 60%,100% 100%,0 100%)", animation: "cc-glitchBot 4s infinite", transform: "translateX(2px)" }}>{text}</span>
    </span>
  );
}

function Terminal() {
  const [lang, setLang] = useState("cpp");
  const [lines, setLines] = useState([]);
  useEffect(() => {
    setLines([]);
    const codeLines = CODES[lang];
    let i = 0;
    const timers = [];
    const addLine = () => {
      if (i < codeLines.length) {
        const idx = i;
        timers.push(setTimeout(() => {
          setLines((prev) => [...prev, { ...codeLines[idx], key: Date.now() + idx }]);
          i++; addLine();
        }, i * 85));
      }
    };
    addLine();
    return () => timers.forEach(clearTimeout);
  }, [lang]);

  return (
    <div style={{ background: "#07060f", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,45,45,.08),inset 0 1px 0 rgba(255,255,255,.04)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "rgba(255,255,255,.025)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[["#ff5f57", "0 0 6px #ff5f57"], ["#febc2e", "0 0 6px #febc2e"], ["#28c840", "0 0 6px #28c840"]].map(([c, s], i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, boxShadow: s }} />
          ))}
        </div>
        <span style={{ flex: 1, fontSize: ".7rem", color: "#5a5472", textAlign: "center", fontFamily: "'JetBrains Mono', monospace" }}>// Two Sum — #1 • Easy</span>
        <div style={{ display: "flex", gap: 5 }}>
          {LANG_TABS.map((l) => (
            <button key={l.id} data-hover onClick={() => setLang(l.id)}
              style={{ padding: "2px 9px", borderRadius: 4, fontSize: ".65rem", fontFamily: "'JetBrains Mono', monospace", cursor: "pointer", border: lang === l.id ? "none" : "1px solid transparent", background: lang === l.id ? "linear-gradient(135deg,#ff2d2d,#ff6a1a)" : "rgba(255,255,255,.05)", color: lang === l.id ? "#fff" : "#5a5472", transition: "all .2s" }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "18px 16px", fontFamily: "'JetBrains Mono', monospace", fontSize: ".78rem", lineHeight: 1.9, minHeight: 160, color: "#c9c4e8" }}>
        {lines.map((line) => (
          <div key={line.key} style={{ display: "flex", gap: 12, animation: "cc-lineIn .25s ease both" }}>
            <span style={{ color: "rgba(255,255,255,.15)", userSelect: "none", minWidth: 18, textAlign: "right" }}>{line.ln}</span>
            <span dangerouslySetInnerHTML={{ __html: line.html }} />
          </div>
        ))}
        {lines.length > 0 && (
          <div style={{ display: "flex", gap: 12 }}>
            <span style={{ color: "rgba(255,255,255,.15)", minWidth: 18, textAlign: "right" }}> </span>
            <span style={{ display: "inline-block", width: 8, height: 14, background: "#ff2d2d", borderRadius: 1, animation: "cc-tBlink .9s step-end infinite", verticalAlign: "middle" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureCard({ feat, delay }) {
  const ref = useRef();
  const visible = useScrollReveal(ref);
  const [hover, setHover] = useState(false);
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });
  const onMouseMove = useCallback((e) => {
    const r = ref.current.getBoundingClientRect();
    setMousePos({ x: ((e.clientX - r.left) / r.width * 100) + "%", y: ((e.clientY - r.top) / r.height * 100) + "%" });
  }, []);
  return (
    <div ref={ref} data-hover onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onMouseMove={onMouseMove}
      style={{ background: "#0e0d1a", border: `1px solid ${hover ? "rgba(255,45,45,.18)" : "rgba(255,255,255,.06)"}`, borderRadius: 14, padding: "26px 22px", position: "relative", overflow: "hidden", transform: hover ? "translateY(-4px) scale(1.01)" : "none", boxShadow: hover ? "0 16px 48px rgba(0,0,0,.4),0 0 0 1px rgba(255,45,45,.1)" : "none", transition: "transform .3s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .3s", opacity: visible ? 1 : 0, animation: visible ? `cc-fadeSlideUp .7s ${delay}s cubic-bezier(.16,1,.3,1) both` : "none", cursor: "default" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${mousePos.x} ${mousePos.y}, rgba(255,45,45,.06), transparent 60%)`, opacity: hover ? 1 : 0, transition: "opacity .3s", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ff2d2d,#ff6a1a)", transform: hover ? "scaleX(1)" : "scaleX(0)", transformOrigin: "left", transition: "transform .4s cubic-bezier(.16,1,.3,1)" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, border: "1px solid rgba(255,45,45,.2)", background: "linear-gradient(135deg,rgba(255,45,45,.1),rgba(255,106,26,.07))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0, transform: hover ? "rotate(-6deg) scale(1.1)" : "none", transition: "transform .3s" }}>
          {feat.icon}
        </div>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", lineHeight: 1.3, paddingTop: 4, color: "#ede8ff" }}>{feat.name}</div>
      </div>
      <div style={{ fontSize: ".77rem", color: "#5a5472", lineHeight: 1.8, fontFamily: "'JetBrains Mono', monospace" }}>{feat.desc}</div>
      <span style={{ display: "inline-block", marginTop: 14, padding: "3px 10px", borderRadius: 4, fontSize: ".63rem", background: "rgba(255,45,45,.08)", color: "#ff2d2d", border: "1px solid rgba(255,45,45,.15)", fontFamily: "'JetBrains Mono', monospace" }}>{feat.tag}</span>
    </div>
  );
}

// ── NAV BUTTON STYLES (shared) ─────────────────────────────
const navBtnGhost = { padding: "9px 20px", borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: ".78rem", background: "transparent", border: "1px solid rgba(255,255,255,.06)", color: "#ede8ff", textDecoration: "none", transition: "all .2s" };
const navBtnFire  = { padding: "9px 20px", borderRadius: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: ".78rem", fontWeight: 700, background: "linear-gradient(135deg,#ff2d2d,#ff6a1a)", border: "none", color: "#fff", textDecoration: "none", boxShadow: "0 4px 24px rgba(255,45,45,.3)", transition: "all .2s" };
const heroBtnFire = { padding: "14px 30px", background: "linear-gradient(135deg,#ff2d2d,#ff6a1a)", border: "none", borderRadius: 10, color: "#fff", fontFamily: "'JetBrains Mono', monospace", fontSize: ".85rem", fontWeight: 700, cursor: "pointer", textDecoration: "none", boxShadow: "0 6px 30px rgba(255,45,45,.35)", transition: "all .25s" };
const heroBtnGhost = { padding: "14px 30px", background: "transparent", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10, color: "#ede8ff", fontFamily: "'JetBrains Mono', monospace", fontSize: ".85rem", cursor: "pointer", textDecoration: "none", transition: "all .25s" };

// ── ROOT COMPONENT ─────────────────────────────────────────
export default function CodeCurse() {
  useParticles();
  useCursor();

  const [navScrolled, setNavScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const featRef = useRef(); const featVisible = useScrollReveal(featRef);
  const footRef = useRef(); const footVisible = useScrollReveal(footRef);

  const headlineBase = {
    fontFamily: "Syne, sans-serif", fontWeight: 800,
    fontSize: "clamp(2.6rem,9vw,4.8rem)", lineHeight: 1.0,
    letterSpacing: "-3px", display: "block", color: "#ede8ff",
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div id="cc-cursor" />
      <div id="cc-cursor-ring" />
      <canvas id="cc-canvas" />
      <div className="cc-noise" />

      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#ede8ff", background: "#03020a", minHeight: "100vh", position: "relative", zIndex: 2 }}>

        {/* ── NAV ── */}
        <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: "1px solid rgba(255,255,255,.06)", background: navScrolled ? "rgba(3,2,10,.95)" : "rgba(3,2,10,.8)", backdropFilter: "blur(24px)", animation: "cc-slideDown .7s cubic-bezier(.16,1,.3,1) both", transition: "background .3s" }}>

          {/* Logo — links back to "/" (landing) */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#ff2d2d,#ff6a1a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, position: "relative", overflow: "hidden", boxShadow: "0 0 18px rgba(255,45,45,.35)" }}>
              ☠
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,transparent 40%,rgba(255,255,255,.18))", animation: "cc-shimmer 3s linear infinite" }} />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", letterSpacing: "-.5px", color: "#ede8ff" }}>
              Code<span style={{ color: "#ff2d2d" }}>Curse</span>
            </span>
          </Link>

          {/* ✅ Nav buttons use Link — no more <Signup>/<Login> components here */}
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/login"  data-hover style={navBtnGhost}>Sign In</Link>
            <Link to="/signup" data-hover style={navBtnFire}>Sign Up</Link>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section style={{ position: "relative", zIndex: 10, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "110px 28px 60px", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,45,45,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,45,45,.05) 1px,transparent 1px)", backgroundSize: "44px 44px", animation: "cc-gridDrift 20s linear infinite", maskImage: "radial-gradient(ellipse 90% 70% at 30% 50%,black,transparent)" }} />
          {[{ w: 300, h: 300, c: "rgba(255,45,45,.22)", t: "5%", l: -80, d: "0s" }, { w: 200, h: 200, c: "rgba(124,58,237,.2)", t: "40%", r: -40, d: "-4s" }, { w: 150, h: 150, c: "rgba(255,106,26,.18)", b: "20%", l: "30%", d: "-2s" }].map((o, i) => (
            <div key={i} style={{ position: "absolute", width: o.w, height: o.h, borderRadius: "50%", filter: "blur(80px)", background: `radial-gradient(circle,${o.c},transparent 70%)`, top: o.t, left: o.l, right: o.r, bottom: o.b, animation: `cc-orbFloat 8s ease-in-out ${o.d} infinite` }} />
          ))}

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px 5px 8px", border: "1px solid rgba(255,45,45,.3)", borderRadius: 100, fontSize: ".7rem", color: "#ff2d2d", background: "rgba(255,45,45,.07)", marginBottom: 22, width: "fit-content", animation: "cc-badgeIn .8s .2s cubic-bezier(.16,1,.3,1) both" }}>
            <span style={{ width: 7, height: 7, background: "#ff2d2d", borderRadius: "50%", animation: "cc-blink 1.5s ease infinite" }} />
            Break The Curse. Master The Code.
          </div>

          <div style={{ animation: "cc-heroIn .9s .35s cubic-bezier(.16,1,.3,1) both" }}>
            <GlitchText text="Conquer DSA" style={headlineBase} />
            <span style={headlineBase}>
              with{" "}
              <span style={{ background: "linear-gradient(90deg,#ff2d2d 0%,#ff6a1a 50%,#ffb347 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "cc-gradSlide 3s linear infinite" }}>Cursed</span>
            </span>
            <GlitchText text="Precision." style={headlineBase} />
          </div>

          <p style={{ fontSize: ".85rem", color: "#5a5472", lineHeight: 1.85, maxWidth: 400, margin: "18px 0 32px", animation: "cc-heroIn .9s .5s cubic-bezier(.16,1,.3,1) both" }}>
            CodeCurse empowers you to master Data Structures & Algorithms through dark-mode problem solving, real-time execution, and AI-powered mentorship.
          </p>

          {/* ✅ CTA buttons also use Link */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", animation: "cc-heroIn .9s .65s cubic-bezier(.16,1,.3,1) both" }}>
            <Link to="/signup" data-hover style={heroBtnFire}>Begin Your Curse →</Link>
            <Link to="/login"  data-hover style={heroBtnGhost}>Sign In</Link>
          </div>

          <div style={{ marginTop: 44, animation: "cc-heroIn .9s .8s cubic-bezier(.16,1,.3,1) both" }}>
            <Terminal />
          </div>
        </section>

        {/* ── COUNTER STRIP ── */}
        <div style={{ position: "relative", zIndex: 10, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(255,255,255,.06)", borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
          {[{ target: 10,  suffix: "x", label: "Faster\nLearning" }, { target: 3, suffix: "", label: "Languages\nSupported" }, { target: 98, suffix: "%", label: "AI Hint\nAccuracy" }].map((c, i) => (
            <div key={i} data-hover style={{ background: "#03020a", padding: "28px 16px", textAlign: "center", position: "relative", overflow: "hidden", cursor: "default" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg,#ff2d2d,#ff6a1a)" }} />
              <AnimCounter target={c.target} suffix={c.suffix} />
              <span style={{ fontSize: ".62rem", color: "#5a5472", marginTop: 4, lineHeight: 1.4, display: "block", whiteSpace: "pre-line" }}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* ── TICKER ── */}
        <div style={{ position: "relative", zIndex: 10, padding: "18px 0", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(255,45,45,.02)" }}>
          <div style={{ display: "flex", animation: "cc-ticker 18s linear infinite", whiteSpace: "nowrap" }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "0 28px", fontSize: ".7rem", color: "#5a5472", letterSpacing: "1px", textTransform: "uppercase" }}>
                <span style={{ width: 4, height: 4, background: "#ff2d2d", borderRadius: "50%", flexShrink: 0 }} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section style={{ position: "relative", zIndex: 10, padding: "72px 28px" }}>
          <div ref={featRef}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: ".65rem", letterSpacing: "3px", color: "#ff2d2d", textTransform: "uppercase", marginBottom: 14, opacity: featVisible ? 1 : 0, animation: featVisible ? "cc-fadeSlideUp .7s cubic-bezier(.16,1,.3,1) both" : "none" }}>
              <span style={{ display: "inline-block", width: 28, height: 1, background: "#ff2d2d" }} />
              // Core Powers
            </div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.7rem,5vw,2.6rem)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 48, opacity: featVisible ? 1 : 0, animation: featVisible ? "cc-fadeSlideUp .7s .07s cubic-bezier(.16,1,.3,1) both" : "none" }}>
              Everything you need<br />to <span style={{ color: "#ff2d2d" }}>break the curse.</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
              {FEATURES.map((f, i) => <FeatureCard key={f.name} feat={f} delay={i * 0.08} />)}
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer ref={footRef} style={{ position: "relative", zIndex: 10, padding: "60px 28px 36px", borderTop: "1px solid rgba(255,255,255,.06)", opacity: footVisible ? 1 : 0, animation: footVisible ? "cc-fadeSlideUp .7s cubic-bezier(.16,1,.3,1) both" : "none" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#ff2d2d,#ff6a1a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, position: "relative", overflow: "hidden" }}>
              ☠
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,transparent 40%,rgba(255,255,255,.18))", animation: "cc-shimmer 3s linear infinite" }} />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#ede8ff" }}>Code<span style={{ color: "#ff2d2d" }}>Curse</span></span>
          </Link>
          <p style={{ fontSize: ".75rem", color: "#5a5472", lineHeight: 1.8, maxWidth: 280, marginBottom: 36 }}>
            Master data structures and algorithms through hands-on practice, real-time feedback, and AI-powered guidance.
          </p>

          {[
            { title: "Quick Links", links: [{ label: "Sign In", to: "/login" }, { label: "Get Started", to: "/signup" }, { label: "Problem Set", to: "/home" }] },
            { title: "Resources",   links: [{ label: 'GitHub',    href: 'https://github.com/harshitgpt01' },
    { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/harshit-gupta-687ba1325/?trk=public-profile-join-page' },
    { label: 'Portfolio', href: 'https://yourportfolio.com' }] },
          ].map((group) => (
            <div key={group.title} style={{ marginBottom: 28 }}>
              <p style={{ fontSize: ".6rem", letterSpacing: "2.5px", color: "#ff2d2d", textTransform: "uppercase", marginBottom: 14 }}>{group.title}</p>
              <ul style={{ listStyle: "none" }}>
                {group.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: 10 }}>
                    <Link to={link.to} data-hover style={{ fontSize: ".78rem", color: "#5a5472", textDecoration: "none", transition: "color .2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#ede8ff")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#5a5472")}>
                      → {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 10 }}>
              {["GH", "in", "@"].map((s) => (
                <a key={s} href="#" data-hover style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".85rem", color: "#5a5472", textDecoration: "none", transition: "all .2s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff2d2d"; e.currentTarget.style.color = "#ff2d2d"; e.currentTarget.style.background = "rgba(255,45,45,.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"; e.currentTarget.style.color = "#5a5472"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "none"; }}>
                  {s}
                </a>
              ))}
            </div>
            <span style={{ fontSize: ".7rem", color: "#5a5472" }}>© 2026 CodeCurse. Built with ❤️ by Harshit.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
