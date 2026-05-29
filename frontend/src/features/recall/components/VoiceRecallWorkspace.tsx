import { useEffect, useRef, useState } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  ArrowRight,
  Radio,
  Clock,
  Shield,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Activity
} from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { VocalAssistant } from "../../../lib/audio/VocalAssistant";
import type { RecallPrompt, RecallReviewResult } from "@studybuddy/shared";

interface VoiceRecallWorkspaceProps {
  prompts: RecallPrompt[];
  onReviewSubmit: (answer: string) => Promise<RecallReviewResult>;
  onContinue: () => void;
  onExit: () => void;
}

export function VoiceRecallWorkspace({
  prompts,
  onReviewSubmit,
  onContinue,
  onExit
}: VoiceRecallWorkspaceProps) {
  const activePrompt = prompts[0];

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [reviewResult, setReviewResult] = useState<RecallReviewResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Initializing voice systems...");

  const vocalRef = useRef<VocalAssistant | null>(null);
  const autoAdvanceTimerRef = useRef<any>(null);

  // Initialize VocalAssistant
  useEffect(() => {
    const vocal = new VocalAssistant({
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setTranscript((prev) => {
            const next = prev ? `${prev} ${text}` : text;
            return next;
          });
          setInterimTranscript("");
        } else {
          setInterimTranscript(text);
        }
      },
      onError: (err) => {
        console.error("Vocal assistant error:", err);
        setStatusMessage(`Mic feedback error: ${err}`);
        setIsListening(false);
      },
      onListeningStateChange: (state) => {
        setIsListening(state);
        if (state) {
          setStatusMessage("AI Dost is listening... Speak your answer now.");
        } else {
          setStatusMessage("Mic paused.");
        }
      },
      onSpeakingStateChange: (state) => {
        setIsSpeaking(state);
      }
    });

    vocalRef.current = vocal;

    return () => {
      vocal.stopListening();
      vocal.stopSpeaking();
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  // Speak prompt when card changes
  useEffect(() => {
    if (!vocalRef.current || !activePrompt) return;

    // Reset transcripts and reviews
    setTranscript("");
    setInterimTranscript("");
    setReviewResult(null);

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }

    if (soundEnabled) {
      const speechText = `Next concept is about ${activePrompt.topic}. The question is: ${activePrompt.prompt}. Spill your synapses.`;
      setStatusMessage("AI Dost is reading the prompt...");
      
      vocalRef.current.speak(speechText, () => {
        setStatusMessage("Spoken cue complete. Microphone active.");
        vocalRef.current?.startListening();
      });
    } else {
      setStatusMessage("Vocal cue skipped (muted). Click Mic to speak your answer.");
    }
  }, [activePrompt, soundEnabled]);

  const handleToggleMic = () => {
    if (!vocalRef.current) return;

    if (isListening) {
      vocalRef.current.stopListening();
    } else {
      // stop speech synthesis if speaking
      vocalRef.current.stopSpeaking();
      vocalRef.current.startListening();
    }
  };

  const handleMuteToggle = () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    if (!nextSound && vocalRef.current) {
      vocalRef.current.stopSpeaking();
    }
  };

  const handleSubmitAnswer = async () => {
    const finalAnswer = (transcript + " " + interimTranscript).trim();
    if (!finalAnswer) {
      setStatusMessage("Cannot submit empty verbal response. Speak to transcribe your answer.");
      return;
    }

    if (vocalRef.current) {
      vocalRef.current.stopListening();
      vocalRef.current.stopSpeaking();
    }

    setEvaluating(true);
    setStatusMessage("Submitting verbal transcript to Veda AI review...");

    try {
      const res = await onReviewSubmit(finalAnswer);
      setReviewResult(res);
      setEvaluating(false);

      if (soundEnabled && vocalRef.current) {
        let speakResponse = "";
        if (res.grade === "good") {
          speakResponse = `Awesome! Nailed it! Veda scored you ${Math.round(res.score * 100)} percent. Veda says: ${res.feedback}`;
        } else if (res.grade === "weak") {
          speakResponse = `Fair effort. Veda scored you ${Math.round(res.score * 100)} percent. Partial recall detected. Veda says: ${res.feedback}`;
        } else {
          speakResponse = `Incorrect recall. Synaptic gap detected. Veda says: ${res.feedback}`;
        }

        setStatusMessage("Veda speaking AI evaluation...");
        vocalRef.current.speak(speakResponse, () => {
          setStatusMessage("AI feedback verbal cue completed.");
          if (autoAdvance) {
            triggerAutoAdvance();
          }
        });
      } else {
        setStatusMessage("AI evaluation complete. Review below.");
        if (autoAdvance) {
          triggerAutoAdvance();
        }
      }
    } catch (err) {
      console.error(err);
      setStatusMessage("Failed to submit review. Try again.");
      setEvaluating(false);
    }
  };

  const triggerAutoAdvance = () => {
    setStatusMessage("Auto-Pilot: Advancing to next card in 4 seconds...");
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = setTimeout(() => {
      handleNext();
    }, 4000);
  };

  const handleNext = () => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
    }
    setReviewResult(null);
    onContinue();
  };

  if (!activePrompt) {
    return (
      <div className="py-24 text-center rounded-2xl border border-dashed border-white/5 bg-[#090b11]/30 backdrop-blur-xl p-8 max-w-2xl mx-auto">
        <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
          <CheckCircle2 size={26} />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight font-display">All caught up!</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium mb-6 mt-1.5 leading-relaxed">
          No concepts are left in your active revision queue. Voice Assistant mode complete.
        </p>
        <button
          onClick={onExit}
          className="px-6 py-3 border border-white/10 text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-white/5 hover:text-white rounded-xl transition"
        >
          Exit Verbal Workspace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto rounded-3xl border border-white/[0.08] bg-[#090b11]/75 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col gap-6">
      {/* Laser header gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      {/* Floating System HUD Info */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 animate-pulse">
            <Radio size={14} />
          </div>
          <div>
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-purple-400">
              AUDITORY HANDS-FREE WORKSPACE
            </span>
            <p className="text-[10px] text-slate-500 font-medium font-mono mt-0.5 leading-none">
              AI Dost Spoken Revision Engine
            </p>
          </div>
        </div>

        {/* HUD control bar */}
        <div className="flex items-center gap-2">
          {/* Sound toggle button */}
          <button
            onClick={handleMuteToggle}
            className={cn(
              "p-2 rounded-lg border transition duration-200",
              soundEnabled
                ? "border-brand/20 bg-brand/5 text-brand-light"
                : "border-white/5 bg-white/[0.02] text-slate-500"
            )}
            title={soundEnabled ? "Mute Voice Synthesizer" : "Unmute Voice Synthesizer"}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Auto Advance Toggle */}
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={cn(
              "px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition duration-200 font-mono",
              autoAdvance
                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                : "border-white/5 bg-white/[0.02] text-slate-500"
            )}
            title="Auto-advance cards when feedback finishes reading"
          >
            Auto-Pilot: {autoAdvance ? "ON" : "OFF"}
          </button>

          {/* Exit Button */}
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 text-[8px] font-black uppercase tracking-widest hover:text-white hover:border-white/20 transition duration-200 font-mono"
          >
            Close REPL
          </button>
        </div>
      </div>

      {/* Main Verbal Deck Layout */}
      <div className="space-y-6">
        {/* Visualizer Pulsar */}
        <div className="flex flex-col items-center justify-center py-6 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isListening && (
              <>
                <div className="w-24 h-24 rounded-full border border-cyan-400/25 animate-ping opacity-60 absolute" />
                <div className="w-36 h-36 rounded-full border border-brand/15 animate-ping opacity-35 absolute" style={{ animationDelay: "0.7s" }} />
              </>
            )}
            {isSpeaking && (
              <div className="w-24 h-24 rounded-full border border-purple-500/20 animate-pulse absolute" />
            )}
          </div>

          {/* Pulsing Mic Node */}
          <button
            onClick={handleToggleMic}
            className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10 hover:scale-105 active:scale-[0.97]",
              isListening
                ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
                : isSpeaking
                ? "bg-purple-500/10 border-purple-400 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                : "bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
            )}
          >
            {isListening ? (
              <Mic size={28} className="animate-pulse" />
            ) : isSpeaking ? (
              <Volume2 size={28} className="animate-bounce" />
            ) : (
              <MicOff size={28} />
            )}
          </button>

          {/* Status Message */}
          <p className="mt-4 font-mono text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-full text-center max-w-md">
            {statusMessage}
          </p>
        </div>

        {/* Question Panel */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span className="font-mono text-[8px] font-black text-slate-500 uppercase tracking-wider">
              Topic: {activePrompt.topic}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white font-display leading-relaxed">
            {activePrompt.prompt}
          </h3>
        </div>

        {/* Live speech transcription bubble */}
        <div className="space-y-2">
          <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest font-mono">
            Transcribed Answer Dialogue
          </label>
          <div className="min-h-[100px] max-h-[180px] overflow-y-auto w-full bg-slate-950/40 rounded-2xl border border-white/[0.06] p-4 font-mono text-xs text-slate-300 leading-relaxed scrollbar-thin">
            {transcript || interimTranscript ? (
              <>
                <span className="text-white font-bold">{transcript}</span>
                {interimTranscript && (
                  <span className="text-cyan-400/80 italic ml-1">{interimTranscript}</span>
                )}
              </>
            ) : (
              <p className="text-slate-600 italic">
                (Transcribing live spoken response... Click the Mic button to trigger, then start speaking clearly.)
              </p>
            )}
          </div>
        </div>

        {/* Review Output */}
        {reviewResult && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0e15]/60 p-5 space-y-4 shadow-inner">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center border",
                  reviewResult.grade === "good" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  reviewResult.grade === "weak" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                  "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  {reviewResult.grade === "good" ? <CheckCircle2 size={15} /> :
                   reviewResult.grade === "weak" ? <Activity size={15} /> :
                   <XCircle size={15} />}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider font-display">
                    {reviewResult.grade === "good" ? "👑 BASED (Nailed it!)" :
                     reviewResult.grade === "weak" ? "📐 MID (Partial Recall)" :
                     "💀 L (Forgot Concept)"}
                  </h4>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black font-mono text-white">
                  {Math.round(reviewResult.score * 100)}% Match
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed italic">
              "{reviewResult.feedback}"
            </p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex gap-3 pt-2 border-t border-white/[0.05]">
          {reviewResult ? (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white py-3.5 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(147,51,234,0.3)] transition"
            >
              Continue revision <ArrowRight size={12} />
            </button>
          ) : (
            <>
              <button
                disabled={evaluating || !(transcript + interimTranscript).trim()}
                onClick={handleSubmitAnswer}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand hover:bg-brand-light text-white py-3.5 text-[10px] font-black uppercase tracking-widest disabled:opacity-40 transition"
              >
                {evaluating ? "Evaluating..." : "Submit Answer Transcript"}
              </button>

              <button
                onClick={() => {
                  setTranscript("");
                  setInterimTranscript("");
                }}
                disabled={evaluating || !(transcript + interimTranscript).trim()}
                className="px-4 py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.04] text-slate-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition"
              >
                Clear Speech
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
