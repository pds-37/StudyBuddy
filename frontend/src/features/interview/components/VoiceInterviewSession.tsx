import { useEffect, useState, useRef } from "react";
import { Mic, PhoneOff, Play, SkipForward, BrainCircuit, Activity, Waves } from "lucide-react";
import { useInterviewStore } from "../../../store/interview-store";
import type { InterviewSession as IInterviewSession } from "@studybuddy/shared";

type Props = {
  session: IInterviewSession;
};

const MAX_INTERVIEW_RESPONSE_CHARS = 20000;

export function VoiceInterviewSession({ session }: Props) {
  const { submitAnswer, skipQuestion, submitting, fetchSessions } = useInterviewStore();
  
  const defaultActiveIndex = session.questions.findIndex(q => !q.userAnswer);
  const activeQuestionIndex = defaultActiveIndex === -1 ? session.questions.length - 1 : defaultActiveIndex;
  const activeQuestion = session.questions[activeQuestionIndex];
  const isCompleted = session.status === "completed" || session.questions.every(q => q.userAnswer);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [isAssistantReady, setIsAssistantReady] = useState(false);
  const vocalAssistantRef = useRef<any>(null);
  
  const handleReviewFinalReport = async () => {
    await fetchSessions();
    window.location.reload(); // Quick hack to go back to workspace or review report
  };

  // Initialize Vocal Assistant
  useEffect(() => {
    import("../../../lib/audio/VocalAssistant").then(({ VocalAssistant }) => {
      vocalAssistantRef.current = new VocalAssistant({
        onTranscript: (text: string, isFinal: boolean) => {
          if (isFinal) {
            setTranscript((prev) => (prev ? prev + " " + text : text));
            setInterimText("");
          } else {
            setInterimText(text);
          }
        },
        onListeningStateChange: setIsListening,
        onSpeakingStateChange: setIsSpeaking,
      });
      setIsAssistantReady(true);
    });

    return () => {
      if (vocalAssistantRef.current) {
        vocalAssistantRef.current.stopListening();
        vocalAssistantRef.current.stopSpeaking();
      }
    };
  }, []);

  // Auto-read question when it becomes active
  useEffect(() => {
    if (activeQuestion && isAssistantReady && !activeQuestion.userAnswer && !isCompleted) {
      setTranscript("");
      setInterimText("");
      
      const assistant = vocalAssistantRef.current;
      assistant.stopListening();
      
      // Delay slightly for dramatic effect before asking
      setTimeout(() => {
        assistant.speak(activeQuestion.question, () => {
          // Once question is fully asked, start listening automatically
          assistant.startListening();
        });
      }, 1000);
    }
  }, [activeQuestion?.id, isAssistantReady, isCompleted]);

  const handleEndCall = () => {
    if (vocalAssistantRef.current) {
      vocalAssistantRef.current.stopListening();
      vocalAssistantRef.current.stopSpeaking();
    }
    window.location.reload(); // Simple exit strategy
  };

  const handleManualSubmit = async () => {
    if (!transcript.trim() || !activeQuestion) return;
    
    if (vocalAssistantRef.current) {
      vocalAssistantRef.current.stopListening();
    }
    
    await submitAnswer(session.id, activeQuestion.id, transcript.slice(0, MAX_INTERVIEW_RESPONSE_CHARS));
  };

  const handleSkip = async () => {
    if (!activeQuestion) return;
    if (vocalAssistantRef.current) {
      vocalAssistantRef.current.stopListening();
      vocalAssistantRef.current.stopSpeaking();
    }
    await skipQuestion(session.id, activeQuestion.id);
  };

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
          <BrainCircuit size={48} />
        </div>
        <h2 className="text-4xl font-extrabold text-white font-display">Call Completed</h2>
        <p className="text-slate-400 max-w-md">Your voice responses have been transcribed and analyzed by Veda. You can now review your final report.</p>
        <button
          onClick={handleReviewFinalReport}
          className="bg-brand hover:bg-brand-light text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          View Full Report
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] w-full flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#030407] border border-white/[0.04]">
      {/* Background Visuals */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-brand/5 blur-[120px] pointer-events-none" />
      
      {isSpeaking && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[80px] pointer-events-none animate-pulse" />
      )}
      
      {isListening && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/5 blur-[100px] pointer-events-none animate-pulse" />
      )}

      {/* Top Bar Info */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-300">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold font-display">Veda Assistant</h3>
            <p className="text-xs text-slate-500 font-mono uppercase">Live Voice Session</p>
          </div>
        </div>
        
        <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-slate-400 tracking-wider">
          Round {activeQuestionIndex + 1} / {session.questions.length}
        </div>
      </div>

      {/* Central Visualizer / Orb */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full max-w-3xl px-8">
        
        {/* Dynamic Orb */}
        <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
          {/* Outer ripples */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-[-20px] rounded-full bg-cyan-400/10 animate-ping" style={{ animationDuration: '2.5s' }} />
            </>
          )}
          
          {isListening && !isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-[-20px] rounded-full bg-brand/10 animate-ping" style={{ animationDuration: '3s' }} />
            </>
          )}

          {/* Core Orb */}
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${
            isSpeaking 
              ? 'bg-gradient-to-tr from-cyan-600 to-blue-400 scale-110 shadow-[0_0_50px_rgba(34,211,238,0.5)]' 
              : isListening 
                ? 'bg-gradient-to-tr from-brand to-rose-500 scale-105 shadow-[0_0_40px_rgba(244,63,94,0.3)]'
                : 'bg-slate-800 border border-slate-700'
          }`}>
            {isSpeaking ? (
              <Activity size={40} className="text-white animate-pulse" />
            ) : isListening ? (
              <Mic size={40} className="text-white animate-pulse" />
            ) : (
              <Waves size={40} className="text-slate-500" />
            )}
          </div>
        </div>

        {/* Current State Text */}
        <div className="text-center space-y-6">
          <h2 className={`text-2xl sm:text-3xl font-display font-medium transition-colors ${isSpeaking ? 'text-cyan-100' : 'text-white'}`}>
            {isSpeaking ? "Veda is speaking..." : isListening ? "Listening to your response..." : "Preparing..."}
          </h2>
          
          <div className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed h-24 overflow-hidden relative">
            <p className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              {isSpeaking ? activeQuestion?.question : (interimText || transcript || "Speak now...")}
            </p>
            {/* Fade out mask */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#030407] to-transparent" />
          </div>
        </div>
      </div>

      {/* Bottom Call Controls */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10 bg-black/40 p-4 rounded-full border border-white/10 backdrop-blur-xl">
        
        {/* End Call */}
        <button 
          onClick={handleEndCall}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-all hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          title="End Call"
        >
          <PhoneOff size={24} />
        </button>

        {/* Manual Mic Toggle */}
        <button 
          onClick={() => {
            if (isListening) vocalAssistantRef.current?.stopListening();
            else vocalAssistantRef.current?.startListening();
          }}
          className={`w-14 h-14 flex items-center justify-center rounded-full transition-all hover:scale-105 ${
            isListening 
              ? 'bg-white/10 text-white border border-white/20' 
              : 'bg-white text-black'
          }`}
          title={isListening ? "Mute Mic" : "Unmute Mic"}
        >
          <Mic size={24} className={!isListening ? "opacity-50" : ""} />
        </button>

        {/* Submit Answer */}
        <button 
          onClick={handleManualSubmit}
          disabled={submitting || (!transcript.trim() && !interimText.trim())}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50 disabled:hover:scale-100 transition-all hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          title="Submit Response"
        >
          {submitting ? <Activity size={24} className="animate-spin" /> : <Play size={24} className="ml-1" />}
        </button>

        {/* Skip Question */}
        <button 
          onClick={handleSkip}
          disabled={submitting}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all hover:scale-105 disabled:opacity-50"
          title="Skip Question"
        >
          <SkipForward size={24} />
        </button>

      </div>
    </div>
  );
}
