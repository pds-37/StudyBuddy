import { Bot, Command, MessageSquareText, Sparkles } from "lucide-react";
import { CopilotChat } from "../features/copilot/components/CopilotChat";

/** Page for AI career copilot chat interface. */
export function CopilotPage() {
  return (
    <div className="h-full animate-fade-in overflow-hidden">
       <CopilotChat />
     </div>
  );
}
