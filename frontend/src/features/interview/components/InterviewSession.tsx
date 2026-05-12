import { useState } from "react";
import { Send, CheckCircle, BrainCircuit, Star, BarChart3, AlertCircle, Sparkles, Loader2, Mic } from "lucide-react";
import { useInterviewStore } from "../../../store/interview-store";
import type { InterviewSession as IInterviewSession, InterviewQuestion } from "@studybuddy/shared";

type Props = {
  session: IInterviewSession;
};

export function InterviewSession({ session }: Props) {
  const { submitAnswer, submitting } = useInterviewStore();
  const [answerInput, setAnswerInput] = useState("");

  const activeQuestionIndex = session.questions.findIndex(q => !q.userAnswer);
  const isCompleted = session.status === "completed" || activeQuestionIndex === -1;
  const activeQuestion = !isCompleted ? session.questions[activeQuestionIndex] : null;

  const handleSubmit = async () => {
    if (!answerInput.trim() || !activeQuestion) return;
    await submitAnswer(session.id, activeQuestion.id, answerInput);
    setAnswerInput("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1017] p-8 shadow-[0_0_50px_-10px_rgba(124,92,255,0.1)]">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BrainCircuit size={120} className="text-brand" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Live Simulator</span>
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Interview: {session.targetRole}</h2>
            <p className="text-slate-400 mt-2 flex items-center gap-2">
              {isCompleted ? (
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md text-xs font-bold uppercase">
                  <CheckCircle size={12} />
                  Session Complete
                </span>
              ) : (
                <span className="text-sm">Progress: <span className="text-white font-mono">{activeQuestionIndex + 1}</span> of <span className="text-white font-mono">{session.questions.length}</span> questions</span>
              )}
            </p>
          </div>
          
          {isCompleted && session.overallScore !== undefined && (
            <div className="flex items-center gap-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 pr-6">
              <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center text-cyan">
                <BarChart3 size={24} />
              </div>
              <div>
                <div className="text-3xl font-black text-cyan leading-none">{session.overallScore}<span className="text-sm text-slate-500 font-normal ml-0.5">/10</span></div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Final Performance</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isCompleted && session.overallFeedback && (
        <div className="group relative rounded-2xl border border-cyan/20 bg-cyan/5 p-6 transition-all hover:bg-cyan/[0.07]">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-transparent pointer-events-none" />
          <h3 className="relative z-10 flex items-center gap-3 font-bold text-cyan mb-3 text-lg">
            <Sparkles className="w-5 h-5" />
            Veda AI Performance Analysis
          </h3>
          <p className="relative z-10 text-slate-300 leading-relaxed text-sm lg:text-base">{session.overallFeedback}</p>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-4">
        {session.questions.map((q, i) => {
          const isActive = !isCompleted && i === activeQuestionIndex;
          const isAnswered = !!q.userAnswer;
          
          return (
            <div 
              key={q.id} 
              className={`group/item relative rounded-3xl border transition-all duration-500 ${
                isActive 
                  ? "border-brand bg-brand/5 shadow-[0_0_80px_-20px_rgba(124,92,255,0.15)] p-8" 
                  : isAnswered 
                    ? "border-white/[0.06] bg-white/[0.01] p-6 hover:bg-white/[0.03]" 
                    : "border-white/5 bg-transparent opacity-40 p-6 grayscale"
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg font-mono text-xs font-bold ${
                      isActive ? "bg-brand text-white shadow-lg shadow-brand/20" : "bg-white/5 text-slate-500"
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      q.category === "behavioral" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                      q.category === "technical" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                      "bg-white/5 text-slate-400 border border-white/10"
                    }`}>
                      {q.category}
                    </span>
                    {isAnswered && (
                      <div className="ml-auto flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-tighter">
                        <CheckCircle className="w-4 h-4" />
                        Evaluated
                      </div>
                    )}
                  </div>

                  <p className={`leading-relaxed ${
                    isActive 
                      ? "text-xl font-medium text-white" 
                      : "text-base text-slate-400"
                  }`}>
                    {q.question}
                  </p>
                  
                  {isAnswered && (
                    <div className="mt-6 space-y-6 animate-in fade-in duration-700">
                      <div className="relative pl-6 border-l-2 border-white/10">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">User Response</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{q.userAnswer}</p>
                      </div>
                      
                      {q.score && (
                        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                              <Sparkles size={20} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-white uppercase tracking-wider">Veda Insight</p>
                              <p className="text-sm text-slate-400 leading-relaxed">{q.score.feedback}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/[0.06]">
                            {[
                              { label: "Overall", score: q.score.overall, color: "text-cyan" },
                              { label: "Clarity", score: q.score.clarity, color: "text-white" },
                              { label: "Relevance", score: q.score.relevance, color: "text-white" },
                              { label: "STAR Accuracy", score: q.score.starMethod, color: "text-brand" }
                            ].map(s => (
                              <div key={s.label} className="bg-black/20 rounded-xl p-3 text-center border border-white/[0.03]">
                                <div className={`text-2xl font-black ${s.color} leading-none`}>{s.score}</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{s.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-8 pt-8 border-t border-white/[0.08] space-y-4 animate-in slide-in-from-top-2 duration-500">
                      <div className="group/input relative rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-all focus-within:border-brand focus-within:bg-white/[0.04] p-1">
                        <textarea
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          placeholder="Craft your answer here... Veda will analyze your structure and delivery."
                          className="w-full bg-transparent border-0 text-lg text-white placeholder-slate-600 focus:ring-0 p-5 min-h-[160px] resize-none"
                        />
                        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-600">
                          {answerInput.length} characters
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                           <Mic size={14} className="animate-pulse text-brand" />
                           Voice mode coming soon
                         </div>
                        <button
                          onClick={handleSubmit}
                          disabled={submitting || !answerInput.trim()}
                          className="group/btn relative flex items-center gap-3 bg-brand text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale shadow-[0_15px_30px_rgba(124,92,255,0.2)]"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              Submit Response
                              <Send className="w-4 h-4 transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
