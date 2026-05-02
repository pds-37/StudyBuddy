import { useState } from "react";
import { CheckCircle2, ChevronRight, Loader2, PlayCircle, XCircle } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { cn } from "../../../lib/utils/cn";
import { useCopilotStore } from "../../../store/copilot-store";
import { apiClient } from "../../../lib/api/client";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
};

type MilestoneQuizProps = {
  milestoneId: string;
  milestoneTitle: string;
};

export function MilestoneQuiz({ milestoneId, milestoneTitle }: MilestoneQuizProps) {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  
  const { sendMessage, createNewConversation, currentConversation } = useCopilotStore();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<{ quiz: QuizQuestion[] }>(`/roadmaps/milestones/${milestoneId}/quiz`);
      setQuestions(response.data.quiz);
      setCurrentIndex(0);
      setScore(0);
      setFinished(false);
      setSelectedOption(null);
    } catch (error) {
      console.error("Failed to generate quiz", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (optionIndex: number) => {
    if (selectedOption !== null) return; // already answered this question
    setSelectedOption(optionIndex);
    
    if (questions && optionIndex === questions[currentIndex].correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = async () => {
    if (!questions) return;
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
    } else {
      setFinished(true);
      // Trigger AI
      if (!currentConversation) {
        await createNewConversation();
      }
      await sendMessage(`I just scored ${score + (selectedOption === questions[currentIndex].correctAnswer ? 1 : 0)} out of ${questions.length} on the "${milestoneTitle}" quiz. Can you review my weak areas?`);
    }
  };

  if (!questions) {
    return (
      <div className="rounded-xl border border-white/[0.04] bg-ink p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white">Knowledge Check</h3>
            <p className="mt-1 text-xs text-[#666666]">{milestoneTitle}</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-xs font-medium text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />}
            Generate Quiz
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="rounded-xl border border-white/[0.04] bg-ink p-8 text-center">
        <h3 className="text-xl font-medium text-white">Completed</h3>
        <p className="mt-2 text-sm text-[#888888]">Score: {score}/{questions.length}</p>
        <button
          onClick={() => setQuestions(null)}
          className="mt-6 rounded-lg border border-white/[0.04] px-4 py-2 text-xs text-[#888888] hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const isAnswered = selectedOption !== null;

  return (
    <div className="rounded-xl border border-white/[0.04] bg-ink p-6">
      <div className="mb-6 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-[#666666]">Question {currentIndex + 1}/{questions.length}</span>
        <span className="text-[10px] uppercase tracking-widest text-white">{score} Correct</span>
      </div>

      <h4 className="mb-8 text-base font-medium leading-relaxed text-white">{currentQ.question}</h4>

      <div className="space-y-2">
        {currentQ.options.map((option, idx) => {
          const isCorrect = idx === currentQ.correctAnswer;
          const isSelected = idx === selectedOption;
          
          let optionClass = "border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03]";
          if (isAnswered) {
            if (isCorrect) optionClass = "border-white/[0.1] bg-white/[0.05] text-white";
            else if (isSelected) optionClass = "border-red-500/20 bg-red-500/5 text-red-200";
            else optionClass = "border-white/[0.02] opacity-30";
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={isAnswered}
              className={cn("w-full rounded-lg border p-3 text-left text-sm transition-all", optionClass)}
            >
              {option}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mt-8 pt-6 border-t border-white/[0.04]">
          <p className="text-[10px] uppercase tracking-widest text-[#666666] mb-2">Explanation</p>
          <p className="text-sm text-[#888888] leading-relaxed">{currentQ.explanation}</p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleNext}
              className="flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-xs font-medium text-slate-950 transition hover:bg-slate-200"
            >
              {currentIndex < questions.length - 1 ? "Next" : "Finish"}
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
