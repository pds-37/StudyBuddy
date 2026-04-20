import { useState } from "react";
import { Send, CheckCircle, BrainCircuit, Star, BarChart3, AlertCircle } from "lucide-react";
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
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Mock Interview: {session.targetRole}</h2>
            <p className="text-sm text-slate-400 mt-1">
              {isCompleted ? "Session completed. Review your feedback below." : `Question ${activeQuestionIndex + 1} of ${session.questions.length}`}
            </p>
          </div>
          {isCompleted && session.overallScore !== undefined && (
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-cyan">{session.overallScore}/10</div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Overall Score</p>
            </div>
          )}
        </div>
      </div>

      {isCompleted && session.overallFeedback && (
        <div className="rounded-xl border border-cyan/20 bg-cyan/10 p-5">
          <h3 className="flex items-center gap-2 font-medium text-cyan mb-2">
            <BrainCircuit className="w-5 h-5" />
            AI Summary
          </h3>
          <p className="text-sm text-cyan-50 leading-relaxed">{session.overallFeedback}</p>
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
              className={`rounded-xl border p-5 transition-all ${
                isActive ? "border-brand bg-brand/5 shadow-[0_0_15px_rgba(124,92,255,0.1)]" : 
                isAnswered ? "border-white/10 bg-white/[0.02]" : "border-white/5 bg-transparent opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Q{i + 1}</span>
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${
                      q.category === "behavioral" ? "bg-amber-500/20 text-amber-300" :
                      q.category === "technical" ? "bg-cyan-500/20 text-cyan-300" :
                      "bg-slate-500/20 text-slate-300"
                    }`}>
                      {q.category}
                    </span>
                    {isAnswered && <CheckCircle className="w-4 h-4 text-green-400 ml-auto" />}
                  </div>
                  <p className={`text-base ${isActive ? "text-white font-medium" : "text-slate-300"}`}>{q.question}</p>
                  
                  {isAnswered && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Your Answer:</p>
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{q.userAnswer}</p>
                      </div>
                      
                      {q.score && (
                        <div className="bg-black/20 rounded-lg p-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm text-slate-200">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <strong>Feedback:</strong> {q.score.feedback}
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5">
                            {[
                              { label: "Overall", score: q.score.overall },
                              { label: "Clarity", score: q.score.clarity },
                              { label: "Relevance", score: q.score.relevance },
                              { label: "STAR", score: q.score.starMethod }
                            ].map(s => (
                              <div key={s.label} className="text-center">
                                <div className="text-lg font-semibold text-white">{s.score}/10</div>
                                <div className="text-[10px] text-slate-500 uppercase">{s.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isActive && (
                    <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                      <div className="bg-slate-900/50 rounded-lg p-1">
                        <textarea
                          value={answerInput}
                          onChange={(e) => setAnswerInput(e.target.value)}
                          placeholder="Type your answer here... (Use the STAR method for behavioral questions)"
                          className="w-full bg-transparent border-0 text-sm text-white placeholder-slate-600 focus:ring-0 p-3 min-h-[120px] resize-y"
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={handleSubmit}
                          disabled={submitting || !answerInput.trim()}
                          className="flex items-center gap-2 bg-brand text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-brand/90 transition disabled:opacity-50"
                        >
                          {submitting ? "Submitting..." : (
                            <>
                              Submit Answer
                              <Send className="w-4 h-4" />
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
