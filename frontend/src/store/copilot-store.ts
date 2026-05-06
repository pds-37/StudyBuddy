import { create } from "zustand";
import { createConversation, getConversations, sendMessage, type Conversation } from "../lib/api/copilot";
import { getApiErrorMessage } from "../lib/api/error";
import type { CopilotMessage } from "@studybuddy/shared";

type CopilotState = {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  sending: boolean;
  isWidgetOpen: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  setIsWidgetOpen: (open: boolean) => void;
  fetchConversations: (force?: boolean) => Promise<void>;
  createNewConversation: () => Promise<string | null>;
  sendMessage: (message: string) => Promise<CopilotMessage | null>;
  selectConversation: (conversationId: string) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearError: () => void;
  refreshConversations: () => Promise<void>;
};

/** Zustand store for copilot chat state management. */
export const useCopilotStore = create<CopilotState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  loading: false,
  sending: false,
  isWidgetOpen: false,
  error: null,
  lastFetched: null,

  setIsWidgetOpen: (open) => set({ isWidgetOpen: open }),

  fetchConversations: async (force = false) => {
    const state = get();

    // Don't refetch if we have recent data and not forcing
    if (!force && !state.error && state.lastFetched && Date.now() - state.lastFetched < 30 * 1000) {
      return;
    }

    set({ loading: true, error: null });

    try {
      const conversations = await getConversations();
      const nextConversation =
        conversations.find((conversation) => conversation._id === state.currentConversation?._id) ??
        conversations[0] ??
        null;

      set({
        conversations,
        currentConversation: nextConversation,
        loading: false,
        lastFetched: Date.now(),
        error: null
      });
    } catch (error) {
      set({
        loading: false,
        error: getApiErrorMessage(error, "Failed to load conversations")
      });
    }
  },

  createNewConversation: async () => {
    set({ loading: true, error: null });

    try {
      const conversationId = await createConversation();

      // Refresh conversations to get the new one
      await get().fetchConversations(true);

      // Find and set the new conversation as current
      const state = get();
      const newConversation = state.conversations.find(c => c._id === conversationId);
      if (newConversation) {
        set({ currentConversation: newConversation, loading: false });
      } else {
        set({ loading: false });
      }

      return conversationId;
    } catch (error) {
      set({
        loading: false,
        error: getApiErrorMessage(error, "Failed to create conversation")
      });
      return null;
    }
  },

  sendMessage: async (message: string) => {
    let state = get();

    if (!state.currentConversation) {
      const conversationId = await get().createNewConversation();
      state = get();

      if (!conversationId || !state.currentConversation) {
        set({ error: "Could not start a new conversation. Please try again." });
        return null;
      }
    }

    const activeConversation = state.currentConversation;

    if (!activeConversation) {
      set({ error: "No active conversation" });
      return null;
    }

    set({ sending: true, error: null });

    try {
      const optimisticUserMessage: CopilotMessage = {
        id: `local-${Date.now()}`,
        role: "user",
        content: message,
        createdAt: new Date().toISOString()
      };

      set((previousState) => {
        if (!previousState.currentConversation) {
          return previousState;
        }

        const updatedConversation = {
          ...previousState.currentConversation,
          messages: [...previousState.currentConversation.messages, optimisticUserMessage],
          updatedAt: optimisticUserMessage.createdAt
        };

        return {
          currentConversation: updatedConversation,
          conversations: previousState.conversations.map((conversation) =>
            conversation._id === updatedConversation._id ? updatedConversation : conversation
          )
        };
      });

      const aiResponse = await sendMessage(activeConversation._id, message);

      // Update the current conversation with the new messages
      set((previousState) => {
        if (!previousState.currentConversation) {
          return previousState;
        }

        const updatedConversation = {
          ...previousState.currentConversation,
          messages: [...previousState.currentConversation.messages, aiResponse],
          updatedAt: new Date().toISOString()
        };

        return {
          currentConversation: updatedConversation,
          conversations: previousState.conversations.map((conv) =>
            conv._id === updatedConversation._id ? updatedConversation : conv
          ),
          sending: false
        };
      });

      return aiResponse;
    } catch (error) {
      set({
        sending: false,
        error: getApiErrorMessage(error, "Failed to send message")
      });
      return null;
    }
  },

  selectConversation: (conversationId) =>
    set((state) => ({
      currentConversation: state.conversations.find((conversation) => conversation._id === conversationId) ?? null
    })),

  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

  clearError: () => set({ error: null }),

  refreshConversations: async () => {
    await get().fetchConversations(true);
  }
}));
