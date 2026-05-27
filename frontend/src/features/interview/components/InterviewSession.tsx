import { useEffect, useState, useRef } from "react";
import { 
  Send, 
  CheckCircle, 
  BrainCircuit, 
  Star, 
  BarChart3, 
  AlertCircle, 
  Sparkles, 
  Loader2, 
  Mic,
  Clock,
  Flag,
  HelpCircle,
  ChevronRight,
  BookOpen,
  Cpu,
  ArrowRight,
  RefreshCw,
  Code,
  ShieldAlert,
  MessageSquare
} from "lucide-react";
import { useInterviewStore } from "../../../store/interview-store";
import type { InterviewSession as IInterviewSession, InterviewQuestion } from "@studybuddy/shared";

type Props = {
  session: IInterviewSession;
};

export function InterviewSession({ session }: Props) {
  const { submitAnswer, toggleFlag, getHint, saveDraft, skipQuestion, submitting, fetchSessions } = useInterviewStore();
  
  // Navigation & Selection states
  const defaultActiveIndex = session.questions.findIndex(q => !q.userAnswer);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const activeQuestionIndex = selectedQuestionIndex !== null ? selectedQuestionIndex : (defaultActiveIndex === -1 ? 0 : defaultActiveIndex);
  const activeQuestion = session.questions[activeQuestionIndex];
  
  const isCompleted = session.status === "completed" || session.questions.every(q => q.userAnswer);

  // Input & Status states
  const [answerInput, setAnswerInput] = useState("");
  const [autosaveStatus, setAutosaveStatus] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [dynamicHint, setDynamicHint] = useState<string | null>(null);
  const [fetchingHint, setFetchingHint] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"evaluation" | "ideal">("evaluation");

  // Timer states
  const [secondsLeft, setSecondsLeft] = useState(600);
  const timerRef = useRef<any>(null);

  // Sync Input when Active Question changes
  useEffect(() => {
    if (activeQuestion) {
      setAnswerInput(activeQuestion.userAnswer || activeQuestion.draftAnswer || "");
      setDynamicHint(activeQuestion.hint || null);
      setHintVisible(false);
      setAutosaveStatus("idle");
      setActiveTab("evaluation");
      // Reset timer to 10 minutes (600 seconds) for each active question in Pressure Mode
      setSecondsLeft(600);
    }
  }, [activeQuestion?.id]);

  // Spaced repetition pressure timer countdown
  useEffect(() => {
    if (!session.pressureMode || isCompleted || !activeQuestion || activeQuestion.userAnswer) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Timer Expired: Auto submit if there is text, else auto skip
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session.pressureMode, isCompleted, activeQuestion?.id, activeQuestion?.userAnswer]);

  const handleTimeExpired = async () => {
    if (!activeQuestion) return;
    if (answerInput.trim()) {
      await submitAnswer(session.id, activeQuestion.id, answerInput);
    } else {
      await skipQuestion(session.id, activeQuestion.id);
    }
  };

  // Debounced autosave drafting
  useEffect(() => {
    if (!activeQuestion || activeQuestion.userAnswer || !answerInput.trim()) return;
    
    // Don't trigger if it matches the current saved draft or answer
    if (answerInput === (activeQuestion.draftAnswer || activeQuestion.userAnswer || "")) return;

    setAutosaveStatus("saving");
    const delayDebounce = setTimeout(async () => {
      try {
        await saveDraft(session.id, activeQuestion.id, answerInput);
        setAutosaveStatus("saved");
      } catch (e) {
        setAutosaveStatus("failed");
      }
    }, 3000);

    return () => clearTimeout(delayDebounce);
  }, [answerInput, activeQuestion?.id]);

  const handleSubmit = async () => {
    if (!answerInput.trim() || !activeQuestion) return;
    await submitAnswer(session.id, activeQuestion.id, answerInput);
  };

  const handleSkip = async () => {
    if (!activeQuestion) return;
    await skipQuestion(session.id, activeQuestion.id);
  };

  const handleToggleFlag = async () => {
    if (!activeQuestion) return;
    await toggleFlag(session.id, activeQuestion.id);
  };

  const handleRequestHint = async () => {
    if (!activeQuestion) return;
    if (activeQuestion.hint) {
      setDynamicHint(activeQuestion.hint);
      setHintVisible(true);
      return;
    }
    setFetchingHint(true);
    try {
      const hint = await getHint(session.id, activeQuestion.id);
      setDynamicHint(hint);
      setHintVisible(true);
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingHint(false);
    }
  };

  const insertTemplate = (type: "star" | "tradeoff" | "algorithm") => {
    if (activeQuestion?.userAnswer) return;

    let template = "";
    if (type === "star") {
      template = `### 1. Situation (S)\n[Describe the context, system state, or team challenge]\n\n### 2. Task (T)\n[Define your core SDE objective and the metrics to optimize]\n\n### 3. Action (A)\n[Detail the architectural decisions, code changes, or leadership actions you took]\n\n### 4. Result (R)\n[State the concrete outcomes, CPU reductions, or latency saves backed by metrics]\n`;
    } else if (type === "tradeoff") {
      template = `### 1. Architectural Strategy\n- [Describe the caching layer, load balancer, or DBMS choice]\n\n### 2. Tradeoff Analysis\n- **Option A (In-Memory)**: Latency: O(1) | Reliability: Ephemeral\n- **Option B (Persistent DB)**: Latency: O(ms) | Reliability: ACID Compliant\n\n### 3. Edge Cases & Safety Margins\n- Cache penetration: [Detail mitigation strategy]\n- Failover: [Detail replication mechanism]\n`;
    } else if (type === "algorithm") {
      template = `### 1. Core Intuition & Design\n[Explain the data structures and algorithm selection]\n\n### 2. Implementation Draft\n\`\`\`javascript\nfunction solve(input) {\n  // Write your code formulation here\n  \n}\n\`\`\`\n\n### 3. Complexity & Boundary Analysis\n- **Time Complexity**: O() because...\n- **Space Complexity**: O() because...\n`;
    }

    setAnswerInput((prev) => (prev ? `${prev}\n\n${template}` : template));
  };

  // Helper: Format Time string MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Simple Markdown Parser
  const renderMarkdown = (text?: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```")) {
        const match = part.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : "";
        const code = match ? match[2] : part.slice(3, -3);
        return (
          <pre key={index} className="my-4 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/70 p-4 font-mono text-xs leading-relaxed text-cyan-300">
            {language && (
              <div className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-500 font-mono">
                {language}
              </div>
            )}
            <code>{code.trim()}</code>
          </pre>
        );
      }

      const lines = part.split("\n");
      return lines.map((line, lineIndex) => {
        if (line.startsWith("### ")) {
          return <h4 key={`${index}-${lineIndex}`} className="text-sm font-black text-white mt-5 mb-2.5 tracking-wide font-display">{line.replace("### ", "")}</h4>;
        }
        if (line.startsWith("## ")) {
          return <h3 key={`${index}-${lineIndex}`} className="text-base font-extrabold text-white mt-6 mb-3 tracking-tight font-display">{line.replace("## ", "")}</h3>;
        }
        if (line.startsWith("# ")) {
          return <h2 key={`${index}-${lineIndex}`} className="text-lg font-black text-white mt-7 mb-4 tracking-tight font-display">{line.replace("# ", "")}</h2>;
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={`${index}-${lineIndex}`} className="ml-4 list-disc text-sm text-slate-300 mb-1.5 leading-relaxed">
              {parseInline(line.slice(2))}
            </li>
          );
        }
        if (line.trim() === "") return <div key={`${index}-${lineIndex}`} className="h-2.5" />;
        return (
          <p key={`${index}-${lineIndex}`} className="text-sm text-slate-300 leading-relaxed mb-2.5">
            {parseInline(line)}
          </p>
        );
      });
    });
  };

  const parseInline = (text: string) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return <strong key={bIdx} className="font-extrabold text-white">{bPart.slice(2, -2)}</strong>;
      }
      const codeParts = bPart.split(/(\`.*?\`)/g);
      return codeParts.map((cPart, cIdx) => {
        if (cPart.startsWith("`") && cPart.endsWith("`")) {
          return <code key={cIdx} className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-xs text-brand-light font-mono">{cPart.slice(1, -1)}</code>;
        }
        return cPart;
      });
    });
  };

  // Score vector color styling helper
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]";
    if (score >= 50) return "bg-cyan shadow-[0_0_10px_rgba(6,182,212,0.4)]";
    return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]";
  };

  // Score vector text color styling helper
  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-cyan";
    return "text-rose-400";
  };

  // Render static AI Status bubble dialogue
  const getInterviewerStatus = () => {
    if (submitting) return "Veda: Analyzing architectural SDE tradeoffs...";
    if (autosaveStatus === "saving") return "Veda: Syncing draft to workspace...";
    if (answerInput.length > 50) return "Veda: Evaluating your system complexity...";
    
    // Personality based statuses
    switch (session.interviewerPersonality) {
      case "strict":
        return "Strict Veda: Code correctness is mandatory.";
      case "architect":
        return "Architect Veda: Scalability is everything.";
      case "founder":
        return "Founder Veda: Speed, business value, execution.";
      case "recruiter":
        return "Recruiter Veda: STAR structure and communication.";
      default:
        return "Veda Mentor: Share your thoughts freely.";
    }
  };

  return (
    <div className="space-y-6 relative z-10 animate-in fade-in duration-500">
      
      {/* Immersive Holistic Report Summary (Rendered at top only if session is completed) */}
      {isCompleted && (
        <div className="relative overflow-hidden rounded-2xl border border-brand/20 bg-brand/5 p-6 sm:p-8 backdrop-blur-xl shadow-premium">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <BrainCircuit size={100} className="text-brand animate-pulse" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-400 font-mono">Cognitive Assessment Review</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white font-display tracking-tight">Recruiter Panel Analysis Report</h2>
              <p className="text-sm text-slate-400 mt-2">
                Your placement assessment round for the <span className="text-white font-bold">{session.targetRole}</span> track is finalized.
              </p>
            </div>
            
            {session.overallScore !== undefined && (
              <div className="flex items-center gap-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 pr-6">
                <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center text-cyan">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <div className="text-3xl font-black text-cyan leading-none font-display">
                    {session.overallScore}
                    <span className="text-sm text-slate-500 font-normal ml-0.5">/10</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 font-mono">Final Performance</p>
                </div>
              </div>
            )}
          </div>

          {session.overallFeedback && (
            <div className="mt-6 space-y-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Holistic Recruiter Review</span>
              <p className="text-slate-300 leading-relaxed text-sm lg:text-base italic font-medium">
                "{session.overallFeedback}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3-Column Immersive Cockpit Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Column 1: Left Navigation Sidebar (span 3) */}
        <aside className="lg:col-span-3 space-y-6 flex flex-col justify-start">
          
          {/* Active Session Info Panel */}
          <div className="rounded-xl border border-white/[0.06] bg-[#07090d]/80 p-5 backdrop-blur-xl space-y-4">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.24em] text-brand-light font-mono">Cockpit Core</span>
              </div>
              <h3 className="text-lg font-bold text-white font-display truncate">{session.targetRole} Loop</h3>
            </div>

            <div className="space-y-2 border-t border-white/[0.04] pt-3 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono">Mode:</span>
                <span className="font-bold text-slate-200 capitalize">{session.mode}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono">Difficulty:</span>
                <span className="font-bold text-slate-200 capitalize">{session.difficulty}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono">Interviewer:</span>
                <span className="font-bold text-slate-200 capitalize">{session.interviewerPersonality}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-mono">Protocol:</span>
                <span className={`font-bold ${session.pressureMode ? 'text-red-400 font-black' : 'text-slate-400'}`}>
                  {session.pressureMode ? 'Pressure (10m Limit)' : 'Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* Question Navigator Tree */}
          <div className="rounded-xl border border-white/[0.06] bg-[#07090d]/80 p-5 backdrop-blur-xl flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">ROUND MATRIX</span>
                <span className="text-[10px] font-bold text-brand-light font-mono">{session.questions.filter(q => q.userAnswer).length}/3 Cleared</span>
              </div>

              <nav className="space-y-3">
                {session.questions.map((q, idx) => {
                  const isActive = idx === activeQuestionIndex;
                  const isAnswered = !!q.userAnswer;
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => setSelectedQuestionIndex(idx)}
                      className={`w-full relative flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-300 ${
                        isActive
                          ? "border-brand bg-brand/10 shadow-[0_0_12px_rgba(99,102,241,0.1)]"
                          : isAnswered
                            ? "border-emerald-500/10 bg-emerald-500/[0.02] hover:bg-emerald-500/[0.04]"
                            : "border-white/[0.04] bg-[#0c0e12]/40 hover:border-white/[0.08]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-lg text-[10px] font-bold font-mono ${
                          isActive 
                            ? "bg-brand text-white" 
                            : isAnswered 
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-white/5 text-slate-500"
                        }`}>
                          0{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 font-display">Round {idx + 1}</h4>
                          <p className="text-[9px] text-slate-500 font-mono font-bold uppercase mt-0.5 tracking-wider truncate max-w-[120px]">{q.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {q.isFlagged && (
                          <Flag size={12} className="text-amber-500 fill-amber-500 shrink-0" />
                        )}
                        {isAnswered ? (
                          <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                        ) : isActive ? (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                          </span>
                        ) : (
                          <ChevronRight size={12} className="text-slate-600 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Realism upcoming SDE round info */}
            <div className="border-t border-white/[0.04] pt-4 mt-auto">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Upcoming SDE Rounds</span>
              <div className="mt-2 space-y-2 text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <span>SDE System Design Deep Dive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  <span>LLD Design Patterns Vetting</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Column 2: Center Focus Workspace (span 5 or 9 depending on if evaluated) */}
        <section className={`transition-all duration-500 ${activeQuestion?.score ? "lg:col-span-5" : "lg:col-span-9"} flex flex-col justify-between space-y-6`}>
          
          {/* Answer Workspace Box */}
          <div className="rounded-xl border border-white/[0.06] bg-[#07090d]/80 p-6 sm:p-8 backdrop-blur-xl space-y-6 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-brand/5 blur-[80px] pointer-events-none" />

            <div className="space-y-5 flex-1 flex flex-col justify-start">
              
              {/* Header Context panel */}
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border font-mono ${
                      activeQuestion?.category === "behavioral" ? "bg-amber-500/10 border-amber-500/25 text-amber-400" :
                      activeQuestion?.category === "technical" ? "bg-cyan-500/10 border-cyan-500/25 text-cyan" :
                      activeQuestion?.category === "scenario" ? "bg-rose-500/10 border-rose-500/25 text-rose-400" :
                      "bg-white/5 border-white/10 text-slate-400"
                    }`}>
                      {activeQuestion?.category}
                    </span>

                    {/* Autosave status indicator */}
                    {autosaveStatus !== "idle" && (
                      <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1.5">
                        {autosaveStatus === "saving" && <RefreshCw size={10} className="animate-spin text-brand" />}
                        {autosaveStatus === "saved" && <span className="w-1 h-1 rounded-full bg-emerald-400" />}
                        {autosaveStatus === "saving" ? "Autosaving..." : autosaveStatus === "saved" ? "Draft synced" : "Draft sync failed"}
                      </span>
                    )}
                  </div>

                  {/* Veda active status bubble */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className={`relative flex h-2 w-2 ${submitting ? 'animate-pulse' : ''}`}>
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${submitting ? 'bg-purple-500' : 'bg-cyan'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${submitting ? 'bg-purple-500' : 'bg-cyan'}`}></span>
                    </span>
                    <span className="text-[10px] font-bold font-mono text-slate-400 truncate max-w-[280px]">
                      {getInterviewerStatus()}
                    </span>
                  </div>
                </div>

                {/* Pressure Mode countdown timer */}
                {session.pressureMode && !activeQuestion?.userAnswer && (
                  <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-lg backdrop-blur-md transition-colors ${
                    secondsLeft <= 120 
                      ? "border-red-500/20 bg-red-500/10 text-red-400 animate-pulse font-black shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
                      : "border-white/10 bg-white/5 text-cyan"
                  }`}>
                    <Clock size={14} className={secondsLeft <= 120 ? "animate-spin" : ""} />
                    <span className="font-mono text-xs font-bold leading-none tracking-wider">
                      {formatTime(secondsLeft)}
                    </span>
                  </div>
                )}
              </div>

              {/* Question Text Panel */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">ROUND {activeQuestionIndex + 1} QUESTION</span>
                <p className="text-base sm:text-lg font-medium text-white leading-relaxed font-display">
                  {activeQuestion?.question}
                </p>
              </div>

              {/* Focus Area: Form Response Editor or Answer Display */}
              <div className="flex-1 flex flex-col justify-start space-y-4">
                
                {/* Templates Insertion Toolbar (Only if active & unanswered) */}
                {!activeQuestion?.userAnswer && (
                  <div className="flex items-center gap-2 text-[10px] border-b border-white/[0.04] pb-2.5">
                    <span className="text-slate-500 font-mono font-bold uppercase shrink-0">Formulation Guides:</span>
                    <div className="flex gap-2 overflow-x-auto py-0.5 scrollbar-thin">
                      <button
                        onClick={() => insertTemplate("star")}
                        className="bg-white/5 border border-white/10 hover:border-brand/30 hover:bg-brand/5 text-slate-300 hover:text-white px-2.5 py-1 rounded-md transition-all whitespace-nowrap"
                      >
                        + Insert STAR Template
                      </button>
                      <button
                        onClick={() => insertTemplate("tradeoff")}
                        className="bg-white/5 border border-white/10 hover:border-brand/30 hover:bg-brand/5 text-slate-300 hover:text-white px-2.5 py-1 rounded-md transition-all whitespace-nowrap"
                      >
                        + System Tradeoffs Grid
                      </button>
                      <button
                        onClick={() => insertTemplate("algorithm")}
                        className="bg-white/5 border border-white/10 hover:border-brand/30 hover:bg-brand/5 text-slate-300 hover:text-white px-2.5 py-1 rounded-md transition-all whitespace-nowrap"
                      >
                        + Algorithmic Complexity Draft
                      </button>
                    </div>
                  </div>
                )}

                {/* Markdown writing console or Display panel */}
                {activeQuestion?.userAnswer ? (
                  <div className="space-y-4 flex-1">
                    <div className="relative rounded-xl border border-white/[0.06] bg-black/40 p-5 min-h-[160px] max-h-[400px] overflow-y-auto">
                      <span className="absolute top-3 right-4 text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">YOUR FORMULATION</span>
                      <div className="space-y-2 mt-4 text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                        {renderMarkdown(activeQuestion.userAnswer)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl border border-white/[0.08] bg-black/40 focus-within:border-brand transition-all duration-300 flex-1 flex flex-col">
                    <textarea
                      value={answerInput}
                      onChange={(e) => setAnswerInput(e.target.value)}
                      placeholder="Craft your system formulation, database schemas, complexity trade-offs, or STAR answers here..."
                      className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-600 focus:ring-0 p-5 min-h-[220px] max-h-[420px] resize-y leading-relaxed outline-none flex-1 font-mono"
                    />
                    <div className="absolute bottom-3 right-4 text-[9px] font-mono text-slate-500 font-bold">
                      {answerInput.length} chars
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls bottom actions */}
            <div className="pt-6 border-t border-white/[0.06] mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                
                {/* Flag toggle button */}
                <button
                  type="button"
                  onClick={handleToggleFlag}
                  className={`flex h-11 px-4 items-center justify-center gap-2 rounded-xl border transition-all duration-200 text-xs font-bold ${
                    activeQuestion?.isFlagged
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <Flag size={14} className={activeQuestion?.isFlagged ? "fill-amber-400" : ""} />
                  {activeQuestion?.isFlagged ? "Flagged" : "Flag Question"}
                </button>

                {/* Ask Veda for SDE Hint */}
                {!activeQuestion?.userAnswer && (
                  <button
                    type="button"
                    onClick={handleRequestHint}
                    disabled={fetchingHint}
                    className="flex h-11 px-4 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-all duration-200 text-xs font-bold disabled:opacity-50"
                  >
                    {fetchingHint ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <HelpCircle size={14} />
                    )}
                    Get SDE Hint
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                
                {/* Skip question */}
                {!activeQuestion?.userAnswer && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={submitting}
                    className="h-11 px-5 border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 text-slate-500 hover:text-red-400 rounded-xl transition-all duration-200 text-xs font-bold uppercase tracking-wider"
                  >
                    Skip
                  </button>
                )}

                {/* Save Draft manual */}
                {!activeQuestion?.userAnswer && (
                  <button
                    type="button"
                    onClick={() => saveDraft(session.id, activeQuestion.id, answerInput)}
                    className="h-11 px-5 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all duration-200 text-xs font-bold uppercase tracking-wider"
                  >
                    Save Draft
                  </button>
                )}

                {/* Submit button / next button */}
                {activeQuestion?.userAnswer ? (
                  <button
                    onClick={() => {
                      if (activeQuestionIndex < session.questions.length - 1) {
                        setSelectedQuestionIndex(activeQuestionIndex + 1);
                      } else {
                        // Complete / fetch sessions
                        fetchSessions();
                      }
                    }}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 h-11 bg-brand hover:bg-indigo-600 text-white px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  >
                    {activeQuestionIndex < session.questions.length - 1 ? (
                      <>
                        Next Round
                        <ArrowRight size={14} />
                      </>
                    ) : (
                      "Review Final Report"
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !answerInput.trim()}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 h-11 bg-gradient-to-r from-brand to-purple-600 hover:opacity-90 text-white px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-wait shadow-[0_0_20px_rgba(99,102,241,0.25)]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Submit & Analyze
                        <Send size={12} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Column 3: Right Sidebar AI Feedback Console (span 4) */}
        {activeQuestion?.score && (
          <aside className="lg:col-span-4 rounded-xl border border-white/[0.06] bg-[#07090d]/90 p-5 backdrop-blur-xl flex flex-col justify-start space-y-6 animate-in slide-in-from-right-4 duration-500 shadow-[0_0_50px_rgba(124,92,255,0.08)]">
            
            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-brand-light">
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">AI Evaluation Diagnostics</span>
              </div>

              {/* Mini score badge */}
              <div className="bg-cyan/15 border border-cyan/20 text-cyan rounded-lg px-2.5 py-1 text-center font-display font-black leading-none text-base">
                {activeQuestion.score.overall}<span className="text-[9px] text-slate-500 font-normal ml-0.5">/10</span>
              </div>
            </div>

            {/* Tabs Selector */}
            <div className="grid grid-cols-2 gap-2 bg-[#0c0e12] border border-white/[0.06] rounded-xl p-1">
              <button
                onClick={() => setActiveTab("evaluation")}
                className={`py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                  activeTab === "evaluation"
                    ? "bg-brand/20 border border-brand/25 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Critique
              </button>
              <button
                onClick={() => setActiveTab("ideal")}
                className={`py-2 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all ${
                  activeTab === "ideal"
                    ? "bg-brand/20 border border-brand/25 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Veda Ideal Mirror
              </button>
            </div>

            {/* Tab content 1: Critique & Scores */}
            {activeTab === "evaluation" && (
              <div className="space-y-6 flex-1 overflow-y-auto max-h-[500px] scrollbar-thin">
                
                {/* 7 Performance Vector meters */}
                <div className="space-y-3.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Performance Vectors</span>
                  
                  <div className="space-y-2.5">
                    {[
                      { label: "Technical Accuracy", score: activeQuestion.score.technicalAccuracy },
                      { label: "Clarity & Organization", score: activeQuestion.score.clarity },
                      { label: "Scalability Thinking", score: activeQuestion.score.scalabilityThinking },
                      { label: "Debugging Approach", score: activeQuestion.score.debuggingApproach },
                      { label: "Communication Flow", score: activeQuestion.score.communication },
                      { label: "Optimization Awareness", score: activeQuestion.score.optimizationAwareness },
                      { label: "Student Confidence", score: activeQuestion.score.confidence }
                    ].map((v) => (
                      <div key={v.label} className="space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-400 font-medium">{v.label}</span>
                          <span className={`font-mono font-black ${getScoreTextColor(v.score)}`}>{v.score}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/[0.04] border border-white/[0.02] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-700 ${getScoreColor(v.score)}`} 
                            style={{ width: `${v.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SDE Diagnostics critique text */}
                <div className="space-y-3.5 border-t border-white/[0.04] pt-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">SDE Diagnostic Notes</span>
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-slate-400 leading-relaxed font-sans">
                    {activeQuestion.score.feedback}
                  </div>
                </div>

                {/* Missing SDE Concepts / Gaps list */}
                {activeQuestion.missingConcepts && activeQuestion.missingConcepts.length > 0 && (
                  <div className="space-y-3 border-t border-white/[0.04] pt-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Recall Concept Gaps (Spaced Repetition Injected)</span>
                    <div className="flex flex-wrap gap-2">
                      {activeQuestion.missingConcepts.map((concept) => (
                        <div 
                          key={concept} 
                          className="group/tag relative cursor-help rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-[10px] text-red-400 font-mono font-bold hover:bg-red-500/10 hover:border-red-500/35 transition-all"
                        >
                          {concept}
                          {/* Hover tooltip explaining recall sync */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 scale-0 group-hover/tag:scale-100 transition-all rounded-lg bg-black border border-white/[0.08] p-2 text-[9px] text-slate-400 leading-normal pointer-events-none z-20 shadow-xl">
                            Spaced Repetition card generated and injected into Recall queue. Due for review at Day 1, 3, 7, and 14!
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Communication and scalability adjustments */}
                {((activeQuestion.communicationTips && activeQuestion.communicationTips.length > 0) || 
                  (activeQuestion.scalabilityGaps && activeQuestion.scalabilityGaps.length > 0)) && (
                  <div className="space-y-3 border-t border-white/[0.04] pt-4 text-[11px]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Mentorship Vector Warnings</span>
                    
                    {activeQuestion.scalabilityGaps?.map((gap, i) => (
                      <div key={i} className="flex items-start gap-2 text-amber-400 bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 leading-relaxed">
                        <ShieldAlert size={14} className="shrink-0 mt-0.5 text-amber-500" />
                        <span>{gap}</span>
                      </div>
                    ))}

                    {activeQuestion.communicationTips?.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-cyan bg-cyan/5 border border-cyan/10 rounded-lg p-2.5 leading-relaxed">
                        <MessageSquare size={14} className="shrink-0 mt-0.5 text-cyan-500" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab content 2: Ideal Answer Comparative Mirror */}
            {activeTab === "ideal" && (
              <div className="flex-1 flex flex-col justify-start overflow-y-auto max-h-[500px] scrollbar-thin space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono">Veda Ideal SDE Formulation Mirror</span>
                <div className="rounded-xl border border-white/[0.06] bg-black/60 p-4 font-sans text-xs leading-relaxed text-slate-300 overflow-y-auto">
                  {renderMarkdown(activeQuestion.idealAnswer || "The model answer has been logged in the diagnostics database. Revise system design and algorithmic scaling properties.")}
                </div>
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Floating Dynamic Hint Modal Dialogue overlay */}
      {hintVisible && dynamicHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative max-w-md w-full rounded-2xl border border-white/[0.08] bg-[#07090d]/90 p-6 backdrop-blur-xl space-y-4 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-amber-400">
                <HelpCircle size={20} />
                <h4 className="font-bold text-base text-white font-display">Veda Guidance Protocol</h4>
              </div>
              <button 
                onClick={() => setHintVisible(false)}
                className="text-slate-500 hover:text-white transition-colors leading-none text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 font-mono">INTERVIEWER PERSONA NUDGE</span>
              <p className="text-xs text-slate-300 leading-relaxed mt-2 italic font-mono">
                "{dynamicHint}"
              </p>
            </div>

            {session.pressureMode && (
              <div className="flex items-center gap-2 text-[10px] text-red-400 bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
                <AlertCircle size={14} className="shrink-0" />
                <span>Notice: Requesting hints under strict pressure mode degrades recruiter scoring metrics slightly!</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setHintVisible(false)}
                className="bg-brand text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase transition-all duration-200 hover:opacity-90 active:scale-95 shadow-[0_0_10px_rgba(99,102,241,0.15)]"
              >
                Resume Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
