import { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Conversation, createConversation, getConversations, sendMessage } from "../../lib/api/copilot";
import { CopilotMessage } from "../../../../shared/src/types/copilot";

/** Main copilot chat interface component. */
export function CopilotChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const loadConversations = async () => {
    try {
      const convs = await getConversations();
      setConversations(convs);
      // Auto-select the most recent conversation
      if (convs.length > 0 && !currentConversation) {
        setCurrentConversation(convs[0]);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const handleNewConversation = async () => {
    try {
      const conversationId = await createConversation();
      await loadConversations(); // Refresh the list

      // Find and select the new conversation
      const newConv = conversations.find(c => c._id === conversationId);
      if (newConv) {
        setCurrentConversation(newConv);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentConversation || isLoading) return;

    const messageToSend = message.trim();
    setMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await sendMessage(currentConversation._id, messageToSend);

      // Update the current conversation with the new messages
      setCurrentConversation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...prev.messages, aiResponse],
          updatedAt: new Date().toISOString()
        };
      });

      // Update conversations list
      setConversations(prev =>
        prev.map(conv =>
          conv._id === currentConversation._id
            ? { ...conv, messages: [...conv.messages, aiResponse], updatedAt: new Date().toISOString() }
            : conv
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore the message if sending failed
      setMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-[600px] bg-slate-900 rounded-lg border border-slate-700">
      {/* Conversations Sidebar */}
      <div className="w-64 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <Button
            onClick={handleNewConversation}
            className="w-full bg-brand hover:bg-brand/90"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => setCurrentConversation(conv)}
              className={`w-full p-3 text-left hover:bg-slate-800 transition ${
                currentConversation?._id === conv._id ? "bg-slate-800 border-r-2 border-brand" : ""
              }`}
            >
              <div className="text-sm text-white text-white text-white truncate">
                {conv.messages.length > 1
                  ? conv.messages[1].content.substring(0, 50) + "..."
                  : "New conversation"
                }
              </div>
              <div className="text-xs text-slate-500 text-slate-500 text-slate-400 mt-1">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages
                .filter(msg => msg.role !== 'system') // Don't show system messages
                .map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-brand text-white text-white text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-slate-500 text-slate-500 text-slate-400'
                    }`}>
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-100 rounded-lg px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse">AI is thinking...</div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex space-x-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your career..."
                  className="flex-1 bg-slate-800 border border-slate-600 text-white text-white text-white placeholder-slate-400 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  rows={2}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="bg-brand hover:bg-brand/90"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white text-white text-white mb-2">Start a conversation</h3>
              <p className="text-slate-500 text-slate-500 text-slate-400 mb-4">
                Get personalized career guidance from your AI copilot
              </p>
              <Button onClick={handleNewConversation} className="bg-brand hover:bg-brand/90">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}