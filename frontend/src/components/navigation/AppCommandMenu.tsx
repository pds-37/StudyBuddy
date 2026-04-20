import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  FilePenLine,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  RefreshCw,
  Route,
  Search,
  Sparkles,
  Target,
  User,
  Wand2
} from "lucide-react";
import { useAppStore } from "../../store/app-store";
import { useCopilotStore } from "../../store/copilot-store";
import { useJobsStore } from "../../store/jobs-store";
import { useRoadmapsStore } from "../../store/roadmaps-store";

type AppCommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CommandAction = {
  id: string;
  label: string;
  description: string;
  group: string;
  icon: typeof LayoutDashboard;
  keywords?: string[];
  run: () => void | Promise<void>;
};

/** Renders the authenticated app command palette powered by cmdk. */
export function AppCommandMenu({ open, onOpenChange }: AppCommandMenuProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAppStore((state) => state.user);
  const clearSession = useAppStore((state) => state.clearSession);
  const fetchJobs = useJobsStore((state) => state.fetchJobs);
  const refreshRoadmaps = useRoadmapsStore((state) => state.refreshRoadmaps);
  const refreshConversations = useCopilotStore((state) => state.refreshConversations);
  const createNewConversation = useCopilotStore((state) => state.createNewConversation);
  const jobsCount = useJobsStore((state) => state.jobs.length);
  const roadmapsCount = useRoadmapsStore((state) => state.roadmaps.length);
  const conversationsCount = useCopilotStore((state) => state.conversations.length);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenChange, open]);

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname, onOpenChange]);

  const actions = useMemo<CommandAction[]>(
    () => [
      {
        id: "dashboard",
        label: "Open dashboard",
        description: "Jump to your command center overview.",
        group: "Navigate",
        icon: LayoutDashboard,
        keywords: ["home", "overview"],
        run: () => navigate("/dashboard")
      },
      {
        id: "skill-gap",
        label: "Analyze skill gap",
        description: "See which skills matter most next.",
        group: "Navigate",
        icon: Target,
        keywords: ["analysis", "skills", "gap"],
        run: () => navigate("/skill-gap")
      },
      {
        id: "roadmap",
        label: "Open roadmap",
        description: roadmapsCount > 0 ? "Review and update your current plan." : "Generate your first roadmap.",
        group: "Navigate",
        icon: Route,
        keywords: ["learning", "milestones", "plan"],
        run: () => navigate("/roadmap")
      },
      {
        id: "jobs",
        label: "Open jobs",
        description: jobsCount > 0 ? `Review ${jobsCount} role matches.` : "Load jobs matched to your profile.",
        group: "Navigate",
        icon: Briefcase,
        keywords: ["career", "openings", "matches"],
        run: () => navigate("/jobs")
      },
      {
        id: "resume",
        label: "Tailor resume",
        description: "Rewrite resume bullets for a target role.",
        group: "Navigate",
        icon: FilePenLine,
        keywords: ["resume", "cv", "ats", "application"],
        run: () => navigate("/resume")
      },
      {
        id: "notes",
        label: "Open notes",
        description: "Capture prep, research, and project context.",
        group: "Navigate",
        icon: FileText,
        keywords: ["knowledge", "docs", "research"],
        run: () => navigate("/notes")
      },
      {
        id: "copilot",
        label: "Open copilot",
        description:
          conversationsCount > 0
            ? `Continue one of ${conversationsCount} conversations.`
            : "Start asking your AI career copilot questions.",
        group: "Navigate",
        icon: MessageSquare,
        keywords: ["chat", "assistant", "ai"],
        run: () => navigate("/copilot")
      },
      {
        id: "profile",
        label: "Edit profile",
        description: "Update your target role and current skills.",
        group: "Navigate",
        icon: User,
        keywords: ["onboarding", "account", "settings"],
        run: () => navigate("/onboarding")
      },
      {
        id: "new-chat",
        label: "Start new copilot chat",
        description: "Create a fresh conversation and jump into it.",
        group: "Quick actions",
        icon: Sparkles,
        keywords: ["new", "conversation", "copilot"],
        run: async () => {
          await createNewConversation();
          navigate("/copilot");
        }
      },
      {
        id: "refresh-jobs",
        label: "Refresh job matches",
        description: "Fetch the latest matched opportunities.",
        group: "Quick actions",
        icon: RefreshCw,
        keywords: ["reload", "jobs", "refresh"],
        run: async () => {
          await fetchJobs(true);
          navigate("/jobs");
        }
      },
      {
        id: "refresh-roadmap",
        label: "Refresh roadmap",
        description: "Re-sync roadmap progress from the API.",
        group: "Quick actions",
        icon: Wand2,
        keywords: ["reload", "roadmap", "refresh"],
        run: async () => {
          await refreshRoadmaps();
          navigate("/roadmap");
        }
      },
      {
        id: "refresh-copilot",
        label: "Refresh copilot threads",
        description: "Pull the latest conversation list.",
        group: "Quick actions",
        icon: RefreshCw,
        keywords: ["reload", "copilot", "refresh"],
        run: async () => {
          await refreshConversations();
          navigate("/copilot");
        }
      },
      {
        id: "logout",
        label: "Log out",
        description: user?.email ? `End session for ${user.email}.` : "Sign out of the workspace.",
        group: "Account",
        icon: LogOut,
        keywords: ["sign out", "session"],
        run: () => {
          clearSession();
          navigate("/");
        }
      }
    ],
    [
      clearSession,
      conversationsCount,
      createNewConversation,
      fetchJobs,
      jobsCount,
      navigate,
      refreshConversations,
      refreshRoadmaps,
      roadmapsCount,
      user?.email
    ]
  );

  const groupedActions = useMemo(() => {
    return actions.reduce<Record<string, CommandAction[]>>((groups, action) => {
      groups[action.group] ??= [];
      groups[action.group].push(action);
      return groups;
    }, {});
  }, [actions]);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="StudyBuddy command menu"
      className="cmdk-dialog"
    >
      <div className="cmdk-shell">
        <div className="cmdk-input-wrap">
          <Search className="h-4 w-4 text-slate-500" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search pages, actions, and shortcuts..."
            className="cmdk-input"
          />
          <div className="hidden items-center gap-1 rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-400 sm:inline-flex">
            <span>Esc</span>
          </div>
        </div>

        <Command.List className="cmdk-list">
          <Command.Empty className="cmdk-empty">
            No results for <span className="text-white">"{search}"</span>.
          </Command.Empty>

          {Object.entries(groupedActions).map(([group, items]) => (
            <Command.Group key={group} heading={group} className="cmdk-group">
              {items.map((action) => {
                const Icon = action.icon;

                return (
                  <Command.Item
                    key={action.id}
                    value={action.label}
                    keywords={action.keywords}
                    onSelect={() => {
                      void action.run();
                      onOpenChange(false);
                    }}
                    className="cmdk-item"
                  >
                    <div className="cmdk-item-icon">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{action.label}</p>
                      <p className="truncate text-xs text-slate-400">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-500" />
                  </Command.Item>
                );
              })}
            </Command.Group>
          ))}
        </Command.List>
      </div>
    </Command.Dialog>
  );
}
