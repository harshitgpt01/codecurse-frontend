import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axiosClient";
import SubmissionHistory from "../components/SubmissionHistory";
import ChatAi from '../components/ChatAi';
import Editorial from '../components/Editorial';

const langMap = {
  cpp: 'C++',
  java: 'Java',
  javascript: 'JavaScript'
};

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const editorRef = useRef(null);
  let { problemId } = useParams();

  const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        const initialCode = response.data.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
        setProblem(response.data);
        setCode(initialCode);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => sc.language === langMap[selectedLanguage]).initialCode;
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => setCode(value || '');
  const handleEditorDidMount = (editor) => { editorRef.current = editor; };
  const handleLanguageChange = (language) => setSelectedLanguage(language);

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, { code, language: selectedLanguage });
      setRunResult(response.data);
      setActiveRightTab('testcase');
    } catch (error) {
      setRunResult({ success: false, error: 'Internal server error' });
      setActiveRightTab('testcase');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, { code, language: selectedLanguage });
      setSubmitResult(response.data);
      setActiveRightTab('result');
    } catch (error) {
      setSubmitResult(null);
      setActiveRightTab('result');
    } finally {
      setLoading(false);
    }
  };

  const getLanguageForMonaco = (lang) => {
    const map = { javascript: 'javascript', java: 'java', cpp: 'cpp' };
    return map[lang] || 'javascript';
  };

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
      case 'easy':   return { cls: 'text-success border-success bg-success/10', label: 'Easy' };
      case 'medium': return { cls: 'text-warning border-warning bg-warning/10', label: 'Medium' };
      case 'hard':   return { cls: 'text-error border-error bg-error/10', label: 'Hard' };
      default:       return { cls: 'text-base-content/50 border-base-content/20', label: difficulty };
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-100">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/50 text-sm font-mono tracking-widest uppercase">Loading problem...</p>
        </div>
      </div>
    );
  }

  const LEFT_TABS = [
    { key: 'description', label: 'Description', icon: '📄' },
    { key: 'editorial',   label: 'Editorial',   icon: '📝' },
    { key: 'solutions',   label: 'Solutions',   icon: '💡' },
    { key: 'submissions', label: 'Submissions', icon: '🕓' },
    { key: 'chatAI',      label: 'AI Chat',     icon: '🤖' },
  ];

  const RIGHT_TABS = [
    { key: 'code',     label: 'Code',     icon: '⌨️' },
    { key: 'testcase', label: 'Testcase', icon: '🧪' },
    { key: 'result',   label: 'Result',   icon: '📊' },
  ];

  return (
    <div className="h-screen flex flex-col bg-base-100 overflow-hidden">

      {/* ── Top Bar ── */}
      <header className="h-11 flex items-center justify-between px-4 bg-base-200 border-b border-base-300 shrink-0">
        <div className="flex items-center gap-3">
          {problem && (
            <span className="text-sm font-semibold text-base-content/80 font-mono tracking-tight">
              {problem.title}
            </span>
          )}
        </div>

        {problem && (
          <div className="flex items-center gap-2">
            {(() => {
              const d = getDifficultyConfig(problem.difficulty);
              return (
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${d.cls} font-mono uppercase tracking-widest`}>
                  {d.label}
                </span>
              );
            })()}
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">
              {problem.tags}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            className={`btn btn-sm btn-ghost gap-1.5 font-mono text-xs ${loading ? 'loading' : ''}`}
            onClick={handleRun}
            disabled={loading}
          >
            {!loading && <span className="text-success">▶</span>}
            Run
          </button>
          <button
            className={`btn btn-sm btn-primary gap-1.5 font-mono text-xs ${loading ? 'loading' : ''}`}
            onClick={handleSubmitCode}
            disabled={loading}
          >
            {!loading && <span>↑</span>}
            Submit
          </button>
        </div>
      </header>

      {/* ── Main Split ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ──────────── LEFT PANEL ──────────── */}
        <div className="w-1/2 flex flex-col border-r border-base-300 overflow-hidden">

          {/* Left Tab Bar */}
          <div className="flex shrink-0 bg-base-200 border-b border-base-300 overflow-x-auto">
            {LEFT_TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveLeftTab(key)}
                className={`
                  relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-semibold
                  whitespace-nowrap transition-all duration-150 shrink-0
                  ${activeLeftTab === key
                    ? 'text-primary bg-base-100 border-b-2 border-primary'
                    : 'text-base-content/50 hover:text-base-content hover:bg-base-300/50'
                  }
                `}
              >
                <span className="text-sm leading-none">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Left Content */}
          <div className="flex-1 overflow-y-auto">
            {problem && (
              <div className="p-6">

                {/* ── Description ── */}
                {activeLeftTab === 'description' && (
                  <div className="space-y-6">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-base-content/90">
                        {problem.description}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-base-content/40 mb-3">
                        Examples
                      </h3>
                      <div className="space-y-3">
                        {problem.visibleTestCases.map((example, index) => (
                          <div
                            key={index}
                            className="rounded-lg border border-base-300 overflow-hidden bg-base-200/50"
                          >
                            <div className="px-3 py-1.5 bg-base-300/50 border-b border-base-300">
                              <span className="text-xs font-mono font-bold text-base-content/50 uppercase tracking-widest">
                                Example {index + 1}
                              </span>
                            </div>
                            <div className="p-4 space-y-2">
                              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-xs font-mono">
                                <span className="text-base-content/40 font-bold uppercase">Input</span>
                                <span className="bg-base-300 px-2 py-1 rounded text-base-content/90">{example.input}</span>
                                <span className="text-base-content/40 font-bold uppercase">Output</span>
                                <span className="bg-base-300 px-2 py-1 rounded text-base-content/90">{example.output}</span>
                                {example.explanation && (
                                  <>
                                    <span className="text-base-content/40 font-bold uppercase pt-1">Note</span>
                                    <span className="text-base-content/70 pt-1">{example.explanation}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Editorial ── */}
                {activeLeftTab === 'editorial' && (
                  <div>
                    <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-base-content/40 mb-4">Editorial</h2>
                    <Editorial secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration} />
                  </div>
                )}

                {/* ── Solutions ── */}
                {activeLeftTab === 'solutions' && (
                  <div>
                    <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-base-content/40 mb-4">Reference Solutions</h2>
                    <div className="space-y-4">
                      {problem.referenceSolution?.map((solution, index) => (
                        <div key={index} className="rounded-lg border border-base-300 overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2 bg-base-200 border-b border-base-300">
                            <span className="text-xs font-mono font-bold text-base-content/60">{solution?.language}</span>
                            <span className="text-xs font-mono text-primary/60">{problem?.title}</span>
                          </div>
                          <pre className="bg-base-300/30 p-4 text-xs overflow-x-auto leading-relaxed">
                            <code className="font-mono text-base-content/90">{solution?.completeCode}</code>
                          </pre>
                        </div>
                      )) || (
                        <div className="text-center py-12">
                          <span className="text-4xl">🔒</span>
                          <p className="mt-3 text-sm text-base-content/40 font-mono">Solve the problem to unlock solutions</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Submissions ── */}
                {activeLeftTab === 'submissions' && (
                  <div>
                    <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-base-content/40 mb-4">My Submissions</h2>
                    <SubmissionHistory problemId={problemId} />
                  </div>
                )}

                {/* ── AI Chat ── */}
                {activeLeftTab === 'chatAI' && (
                  <div>
                    <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-base-content/40 mb-4">AI Assistant</h2>
                    <ChatAi problem={problem} />
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

        {/* ──────────── RIGHT PANEL ──────────── */}
        <div className="w-1/2 flex flex-col overflow-hidden">

          {/* Right Tab Bar */}
          <div className="flex shrink-0 bg-base-200 border-b border-base-300">
            {RIGHT_TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setActiveRightTab(key)}
                className={`
                  flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono font-semibold
                  whitespace-nowrap transition-all duration-150 shrink-0
                  ${activeRightTab === key
                    ? 'text-primary bg-base-100 border-b-2 border-primary'
                    : 'text-base-content/50 hover:text-base-content hover:bg-base-300/50'
                  }
                `}
              >
                <span className="text-sm leading-none">{icon}</span>
                {label}
              </button>
            ))}

            {/* Language selector — shown only in Code tab, pushed right */}
            {activeRightTab === 'code' && (
              <div className="ml-auto flex items-center gap-1 px-3">
                {['javascript', 'java', 'cpp'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`
                      px-2.5 py-1 text-xs font-mono rounded transition-all duration-150
                      ${selectedLanguage === lang
                        ? 'bg-primary text-primary-content font-bold'
                        : 'text-base-content/50 hover:text-base-content hover:bg-base-300'
                      }
                    `}
                  >
                    {lang === 'cpp' ? 'C++' : lang === 'javascript' ? 'JS' : 'Java'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Code Tab ── */}
          {activeRightTab === 'code' && (
            <div className="flex-1 overflow-hidden">
              <Editor
                height="100%"
                language={getLanguageForMonaco(selectedLanguage)}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme="vs-dark"
                options={{
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                  fontLigatures: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  glyphMargin: false,
                  folding: true,
                  lineDecorationsWidth: 8,
                  lineNumbersMinChars: 3,
                  renderLineHighlight: 'line',
                  selectOnLineNumbers: true,
                  roundedSelection: false,
                  readOnly: false,
                  cursorStyle: 'line',
                  mouseWheelZoom: true,
                  padding: { top: 12, bottom: 12 },
                  scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                }}
              />
            </div>
          )}

          {/* ── Testcase Tab ── */}
          {activeRightTab === 'testcase' && (
            <div className="flex-1 overflow-y-auto p-5">
              {runResult ? (
                <div className="space-y-4">
                  {/* Status banner */}
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border font-mono text-sm font-bold
                    ${runResult.success
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'bg-error/10 border-error/30 text-error'
                    }`}
                  >
                    <span className="text-lg">{runResult.success ? '✓' : '✗'}</span>
                    <span>{runResult.success ? 'All test cases passed' : 'Some test cases failed'}</span>
                    {runResult.success && (
                      <span className="ml-auto flex gap-4 text-xs text-base-content/50 font-normal">
                        <span>⏱ {runResult.runtime} sec</span>
                        <span>💾 {runResult.memory} KB</span>
                      </span>
                    )}
                  </div>

                  {/* Test case cards */}
                  {/* Test case cards */}
<div className="space-y-2">
  {runResult.testCases?.map((tc, i) => {
    const passed = tc.status_id === 3;
    const visibleCase = problem?.visibleTestCases?.[i]; // ✅ get input/output from problem
    return (
      <div
        key={i}
        className={`rounded-lg border overflow-hidden
          ${passed ? 'border-success/20 bg-success/5' : 'border-error/20 bg-error/5'}`}
      >
        <div className={`flex items-center gap-2 px-3 py-1.5 border-b text-xs font-mono font-bold
          ${passed ? 'border-success/20 text-success' : 'border-error/20 text-error'}`}
        >
          <span>{passed ? '✓' : '✗'}</span>
          <span>Case {i + 1}</span>
          <span className="ml-auto font-normal opacity-60">
            {passed ? 'Accepted' : tc.status_id === 4 ? 'Wrong Answer' : tc.status?.description || 'Failed'}
          </span>
        </div>
        <div className="p-3 grid grid-cols-3 gap-3 text-xs font-mono">
          {[
            { label: 'Input',    val: visibleCase?.input },
            { label: 'Expected', val: visibleCase?.output },
            { label: 'Got',      val: tc.stdout?.trim() || tc.stderr?.trim() || '—' },
          ].map(({ label, val }) => (
            <div key={label}>
              <div className="text-base-content/40 uppercase tracking-widest mb-1">{label}</div>
              <div className="bg-base-300/50 px-2 py-1.5 rounded text-base-content/80 break-all">
                {val || '—'}
              </div>
            </div>
          ))}
        </div>
        {/* Show error if any */}
        {tc.stderr && (
          <div className="px-3 pb-3">
            <div className="text-xs text-error/70 font-mono bg-error/5 border border-error/20 rounded p-2">
              {tc.stderr}
            </div>
          </div>
        )}
      </div>
    );
  })}
</div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <span className="text-5xl opacity-20">🧪</span>
                  <p className="text-sm font-mono text-base-content/40">Press <kbd className="kbd kbd-sm">Run</kbd> to test your code</p>
                </div>
              )}
            </div>
          )}

          {/* ── Result Tab ── */}
          {activeRightTab === 'result' && (
            <div className="flex-1 overflow-y-auto p-5">
              {submitResult ? (
                <div className="space-y-4">
                  {/* Big status */}
                  <div className={`rounded-xl border p-6 text-center
                    ${submitResult.accepted
                      ? 'bg-success/10 border-success/30'
                      : 'bg-error/10 border-error/30'
                    }`}
                  >
                    <div className="text-4xl mb-2">{submitResult.accepted ? '🎉' : '❌'}</div>
                    <div className={`text-xl font-bold font-mono mb-1
                      ${submitResult.accepted ? 'text-success' : 'text-error'}`}
                    >
                      {submitResult.accepted ? 'Accepted' : submitResult.error || 'Wrong Answer'}
                    </div>
                    <div className="text-xs font-mono text-base-content/50 mt-1">
                      {submitResult.passedTestCases}/{submitResult.totalTestCases} test cases passed
                    </div>
                  </div>

                  {/* Stats */}
                  {submitResult.accepted && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Runtime', value: `${submitResult.runtime} sec`, icon: '⏱' },
                        { label: 'Memory',  value: `${submitResult.memory} KB`,  icon: '💾' },
                      ].map(({ label, value, icon }) => (
                        <div key={label} className="rounded-lg border border-base-300 bg-base-200/50 p-4 text-center">
                          <div className="text-2xl mb-1">{icon}</div>
                          <div className="text-lg font-bold font-mono text-base-content">{value}</div>
                          <div className="text-xs font-mono text-base-content/40 uppercase tracking-widest">{label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <span className="text-5xl opacity-20">📊</span>
                  <p className="text-sm font-mono text-base-content/40">Press <kbd className="kbd kbd-sm">Submit</kbd> to evaluate your solution</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
