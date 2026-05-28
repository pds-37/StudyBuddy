import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Sparkles, 
  ArrowRight,
  Copy,
  Check,
  Share2,
  Bookmark,
  ChevronRight,
  Code2
} from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: "Placement" | "Memory" | "Veda AI" | "Engineering";
  date: string;
  readTime: string;
  author: string;
  authorRole: string;
  authorInitials: string;
  gradient: string;
  content: React.ReactNode;
}

// Custom animated visual headers
function BlogVisualHeader({ id }: { id: string }) {
  if (id === "spaced-repetition-placements") {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#0b0818] overflow-hidden flex items-center justify-center">
        {/* Animated timeline grid */}
        <svg className="w-full h-full opacity-60" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="indigo-glow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Timeline axis */}
          <line x1="40" y1="110" x2="360" y2="110" stroke="#1e1b4b" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Exponential Forgetting curve overlay */}
          <path d="M 40 40 Q 90 110, 160 110 Q 210 50, 280 110 Q 320 60, 360 110" fill="none" stroke="url(#indigo-glow)" strokeWidth="3" />
          
          {/* Animated pulsing light along path */}
          <circle r="5" fill="#a5b4fc" className="shadow-[0_0_10px_#818cf8]">
            <animateMotion dur="5s" repeatCount="indefinite" path="M 40 40 Q 90 110, 160 110 Q 210 50, 280 110 Q 320 60, 360 110" />
          </circle>

          {/* Nodes */}
          {[
            { cx: 40, cy: 40, label: "Day 1 (Learn)" },
            { cx: 160, cy: 110, label: "Day 3 (Review)" },
            { cx: 280, cy: 110, label: "Day 7 (Recall)" },
            { cx: 360, cy: 110, label: "Day 30 (Master)" }
          ].map((node, i) => (
            <g key={i}>
              <circle cx={node.cx} cy={node.cy} r="10" fill="#0b0818" stroke="#6366f1" strokeWidth="2" />
              <circle cx={node.cx} cy={node.cy} r="4" fill="#818cf8" className="animate-ping" style={{ animationDuration: `${2 + i}s` }} />
              <circle cx={node.cx} cy={node.cy} r="4" fill="#818cf8" />
              <text x={node.cx} y={node.cy + (node.cy === 40 ? -16 : 24)} fill="#94a3b8" fontSize="8" textAnchor="middle" fontWeight="bold" className="font-sans">{node.label}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  if (id === "ats-resume-adaptation") {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#140609] overflow-hidden flex items-center justify-center">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_14px]" />
        
        {/* Animated Resume Scanner Card */}
        <div className="w-[220px] h-[130px] bg-slate-950/90 border border-red-950/60 rounded-xl p-3 relative overflow-hidden shadow-[0_10px_30px_rgba(239,68,68,0.06)] z-10">
          {/* Mock lines */}
          <div className="w-16 h-2 bg-slate-800 rounded mb-2.5" />
          <div className="w-full h-1 bg-slate-900 rounded mb-1" />
          <div className="w-5/6 h-1 bg-slate-900 rounded mb-1" />
          <div className="w-4/5 h-1 bg-slate-900 rounded mb-3.5" />
          
          <div className="w-20 h-2 bg-slate-800 rounded mb-2" />
          <div className="flex gap-1.5 flex-wrap">
            <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-900/40 font-mono animate-pulse">React</span>
            <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-900/40 font-mono">TypeScript</span>
            <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-900/40 font-mono animate-pulse" style={{ animationDelay: "0.5s" }}>SQLite</span>
            <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-red-950/40 text-red-400 border border-red-900/40 font-mono">Algorithms</span>
          </div>

          {/* Scanning line laser */}
          <div className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-[resumeScan_3s_infinite_ease-in-out]" />
        </div>

        {/* CSS keyframes for scan animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes resumeScan {
            0%, 100% { top: 5%; opacity: 0.2; }
            50% { top: 95%; opacity: 1; }
          }
        `}} />
      </div>
    );
  }

  if (id === "veda-ai-obsidian-notes") {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#040e11] overflow-hidden flex items-center justify-center">
        {/* Knowledge graph network */}
        <svg className="w-full h-full opacity-70" viewBox="0 0 400 200">
          <defs>
            <radialGradient id="cyan-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="100" r="70" fill="url(#cyan-glow)" />

          {/* Connectors */}
          <line x1="200" y1="100" x2="120" y2="55" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="200" y1="100" x2="280" y2="55" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="200" y1="100" x2="140" y2="145" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="200" y1="100" x2="260" y2="145" stroke="#0891b2" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="120" y1="55" x2="280" y2="55" stroke="#155e75" strokeWidth="1" />
          <line x1="140" y1="145" x2="260" y2="145" stroke="#155e75" strokeWidth="1" />

          {/* Active signal pulsing along paths */}
          <circle r="3" fill="#22d3ee">
            <animateMotion dur="4s" repeatCount="indefinite" path="M 200 100 L 120 55" />
          </circle>
          <circle r="3" fill="#22d3ee">
            <animateMotion dur="3s" repeatCount="indefinite" path="M 200 100 L 260 145" />
          </circle>

          {/* Central Veda AI Node */}
          <g>
            <circle cx="200" cy="100" r="18" fill="#040e11" stroke="#22d3ee" strokeWidth="3" />
            <circle cx="200" cy="100" r="7" fill="#22d3ee" className="animate-ping" />
            <circle cx="200" cy="100" r="5" fill="#22d3ee" />
            <text x="200" y="76" fill="#22d3ee" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-sans">VEDA CORE</text>
          </g>

          {/* Note Nodes */}
          {[
            { cx: 120, cy: 55, label: "STAR Notes" },
            { cx: 280, cy: 55, label: "System Design" },
            { cx: 140, cy: 145, label: "Algorithms" },
            { cx: 260, cy: 145, label: "Behavioral" }
          ].map((node, i) => (
            <g key={i}>
              <circle cx={node.cx} cy={node.cy} r="9" fill="#040e11" stroke="#0891b2" strokeWidth="1.5" />
              <circle cx={node.cx} cy={node.cy} r="3" fill="#0891b2" />
              <text x={node.cx} y={node.cy + 20} fill="#94a3b8" fontSize="8" textAnchor="middle" className="font-sans">{node.label}</text>
            </g>
          ))}
        </svg>
      </div>
    );
  }

  if (id === "cpp-offline-sync-agent") {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#050911] overflow-hidden flex items-center justify-center">
        {/* IDE compiler and DB Sync illustration */}
        <div className="w-[210px] h-[130px] bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 font-mono text-[7px] text-slate-400 relative overflow-hidden flex flex-col justify-between shadow-2xl">
          {/* Header Bar */}
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-900 text-slate-500">
            <span className="flex items-center gap-1"><Code2 size={8} /> sync_engine.cpp</span>
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/80" />
            </span>
          </div>
          {/* Logs */}
          <div className="flex-1 py-1.5 space-y-0.5 overflow-hidden">
            <p className="text-blue-400">[100%] Compiling local_sqlite.o</p>
            <p className="text-slate-500">sqlite3_exec() {"->"} SUCCESS</p>
            <p className="text-amber-400">[Sync] Pushing transaction queue...</p>
            <p className="text-cyan-400">[CPR] POST https://api.studybuddy.ai/sync</p>
            <p className="text-emerald-400">{" >> "} status_code: 200 OK</p>
          </div>
          {/* Sync indicator */}
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-indigo-300 font-bold text-[6px]">SYNC COMPLETE</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Fully functional copy code block
function CodeBlock({ code, language, filename }: { code: string; language: string; filename?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl border border-white/[0.08] bg-[#050608] overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06] text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5 font-sans">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          <span className="ml-1 text-slate-500">|</span>
          <span className="text-slate-300">{filename || `main.${language}`}</span>
        </span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors duration-200"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="font-mono text-xs md:text-sm text-slate-300 leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

// Gorgeous Tips Cards
function AlertCard({ type, title, children }: { type: "info" | "warning" | "success"; title: string; children: React.ReactNode }) {
  const borderColors = {
    info: "border-cyan-500/35 bg-cyan-950/10 text-cyan-200",
    warning: "border-amber-500/35 bg-amber-950/10 text-amber-200",
    success: "border-emerald-500/35 bg-emerald-950/10 text-emerald-200"
  };

  const badgeColors = {
    info: "bg-cyan-500/10 text-cyan-300 border-cyan-400/20",
    warning: "bg-amber-500/10 text-amber-300 border-amber-400/20",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-400/20"
  };

  return (
    <div className={`my-8 border rounded-xl p-5 ${borderColors[type]} leading-relaxed`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${badgeColors[type]}`}>
          {type === "info" ? "Tip" : type === "warning" ? "Warning" : "Strategy"}
        </span>
        <h4 className="font-display font-semibold text-white text-sm">{title}</h4>
      </div>
      <div className="text-sm text-slate-300">{children}</div>
    </div>
  );
}

// Real comprehensive SDE articles content
const mockPosts: BlogPost[] = [
  {
    id: "spaced-repetition-placements",
    title: "The Science of Spaced Repetition in SDE Placements",
    excerpt: "How practicing key algorithms in 1, 3, 7, and 30-day intervals prevents memory decay and secures standard SDE offers.",
    category: "Memory",
    date: "May 25, 2026",
    readTime: "6 min read",
    author: "Dr. Rachel Veda",
    authorRole: "Neuroscientist & Placement Consultant",
    authorInitials: "DRV",
    gradient: "from-indigo-600 via-purple-600 to-brand",
    content: (
      <>
        <p className="text-lg text-slate-300 font-serif leading-relaxed">
          If you are preparing for software engineering interviews, you have likely encountered the classic recommendation: <strong>"Just grind LeetCode."</strong> You open the platform, solve ten questions on Arrays, then twenty on HashMaps. You feel accomplished. But four weeks later, you encounter a variation of the same Sliding Window problem you solved, and your mind goes blank.
        </p>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-brand pl-4">
          The Cognitive Problem: Ebbinghaus Forgetting Curve
        </h2>
        <p className="mt-4">
          In psychology, the **Forgetting Curve** shows how memory retention decays exponentially over time without review. Typically, a human forgets up to **90% of newly learned algorithmic patterns within 7 days**. 
        </p>
        <p className="mt-4">
          Grinding problems back-to-back creates a false sense of security called <em>fluency illusion</em>. Because you just wrote the code, you assume you've mastered the concept. In reality, you've only stored it in working memory.
        </p>

        <AlertCard type="info" title="Spaced Repetition vs. Grinding">
          Grinding 500 questions once is scientifically inferior to solving 100 key patterns and reviewing them on an optimized spaced timeline. The review forces your brain to actively retrieve the pattern just as it is about to forget it, moving it permanently into long-term memory.
        </AlertCard>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-brand pl-4">
          The Master Timeline: The 1-3-7-30 Rule
        </h2>
        <p className="mt-4">
          To master SDE placement patterns, implement the following spaced intervals:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-300">
          <li><strong>Day 1 (Learn & Solve):</strong> Understand the pattern (e.g., Breadth-First Search). Write the code, analyze the complexity, and register the core problem.</li>
          <li><strong>Day 3 (First Review):</strong> Re-open the problem. Do NOT look at your past code. Attempt to rewrite the logic from memory. If you struggle, reset back to Day 1.</li>
          <li><strong>Day 7 (Second Review):</strong> Attempt to solve a variation of the problem. This reinforces the pattern rather than the exact code.</li>
          <li><strong>Day 30 (Final Mastery Check):</strong> Re-visit the problem under interview time pressure (e.g. 20-minute limit). If successful, you have locked it in.</li>
        </ul>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-brand pl-4">
          How to Structure Anki Flashcards for Coding
        </h2>
        <p className="mt-4">
          The secret to using spaced repetition software like Anki is avoiding raw code blocks on your cards. Anki is for active recall of <em>patterns</em>, not syntax. Use this layout:
        </p>

        <CodeBlock 
          filename="Example Anki Flashcard Format"
          language="text"
          code={`FRONT SIDE:
- Problem: LeetCode 239. Sliding Window Maximum (Hard)
- Core Question: Find the maximum element in every sliding window of size k.
- Constraints: Time Complexity must be O(N).

BACK SIDE:
- Data Structure: Monotonic Deque (Double-ended queue)
- Pattern:
  1. Store array indices in the deque, maintaining them in decreasing order of value.
  2. For each element:
     a. Remove indices out of current window bounds: q.front() < i - k + 1.
     b. Remove indices with values smaller than current element: nums[q.back()] <= nums[i].
     c. Push current index.
     d. Window maximum is always nums[q.front()].
- Time/Space Complexity: O(N) Time, O(K) Space.`}
        />

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-brand pl-4">
          Measuring Your Growth
        </h2>
        <p className="mt-4">
          By adopting this memory-first framework, you shift from a numbers game ("I did 400 questions") to an efficiency game ("I master 95% of critical patterns"). When you walk into your next SDE interview, you will not have to memorize code—you will simply recall the intuitive mental path you reinforced over 30 days.
        </p>
      </>
    )
  },
  {
    id: "ats-resume-adaptation",
    title: "Bypassing ATS Filters: An AI-Driven Approach to Resumes",
    excerpt: "Generic resumes are failing. Explore how our contextual AI Resume tool dynamically extracts keywords and scores JDs.",
    category: "Placement",
    date: "May 18, 2026",
    readTime: "8 min read",
    author: "Vikram Sen",
    authorRole: "Technical Recruiter & Career Advisor",
    authorInitials: "VS",
    gradient: "from-rose-500 via-pink-500 to-amber-500",
    content: (
      <>
        <p className="text-lg text-slate-300 font-serif leading-relaxed">
          Over **75% of resumes** submitted for software engineering roles are filtered out by Applicant Tracking Systems (ATS) before they ever reach a human eyes. If you are applying to highly competitive tech companies and receiving immediate rejection emails, your resume isn't necessarily poor—it's failing to be parsed correctly by the automated scoring algorithms.
        </p>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-rose-500 pl-4">
          How the ATS Matching Algorithm Works
        </h2>
        <p className="mt-4">
          Modern ATS platforms like Workday, Greenhouse, and Lever don't read resumes like humans. They convert PDFs into a structured schema using two main operations:
        </p>
        <ol className="list-decimal pl-6 mt-4 space-y-3 text-slate-300">
          <li><strong>Text Segmentation & Parsing:</strong> The parser scans standard section titles ("Skills", "Work Experience", "Education") and buckets text blocks accordingly. Side-by-side columns or tables confuse the parser, often scrambling the chronological order of your jobs.</li>
          <li><strong>Entity & Keyword Extraction:</strong> The system extracts tags from the job description (JD)—such as "React", "Distributed Systems", "Kubernetes"—and matches them against the parsed resume tokens.</li>
        </ol>

        <AlertCard type="warning" title="The Penalty of Double Columns">
          Resumes designed in graphic software (e.g. Canva) with beautiful double columns are the most common source of immediate ATS rejections. When parsed, the left and right columns are read line-by-line across, merging phrases like "React Developer" and "Interests: Chess" into "React Developer Interests: Chess".
        </AlertCard>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-rose-500 pl-4">
          The Matching Formula (Algorithmic Perspective)
        </h2>
        <p className="mt-4">
          Behind the scenes, the ATS calculates a **relevance score** between the parsed resume vector and the job description vector, often utilizing a variation of Cosine Similarity weighted by section importance.
        </p>

        <CodeBlock 
          filename="ats_score_simulator.py"
          language="python"
          code={`def calculate_ats_score(resume_skills, jd_skills, experience_years, required_years):
    # Calculate Jaccard similarity for skills
    matched_skills = set(resume_skills).intersection(set(jd_skills))
    skill_score = len(matched_skills) / len(set(jd_skills)) if jd_skills else 0
    
    # Calculate experience matching
    experience_score = min(experience_years / required_years, 1.2) if required_years > 0 else 1.0
    
    # Total weighted match index
    total_score = (skill_score * 0.7) + (experience_score * 0.3)
    return round(total_score * 100, 2)

# Simulating a matched candidate
print(calculate_ats_score(
    resume_skills=['C++', 'SQLite', 'CMake', 'Git'], 
    jd_skills=['C++', 'CMake', 'SQLite', 'Networking'], 
    experience_years=3, 
    required_years=2
)) # Output: 88.5%`}
        />

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-rose-500 pl-4">
          5 Actionable Ways to Beat the Parser
        </h2>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-300">
          <li><strong>Single-Column Layout:</strong> Use a simple, clean, single-column document formatted in standard fonts (like Calibri, Arial, or Inter).</li>
          <li><strong>Match Skill Nomenclature:</strong> If a job description lists "AWS," do not write "Amazon Web Services." The keyword engine looks for exact token matches.</li>
          <li><strong>Adopt the STAR Method:</strong> Under work experience, structure points as: <em>"Accomplished X, measured by Y, by implementing Z."</em> (e.g., "Reduced database lookup latency by 45% through custom SQLite indexing").</li>
          <li><strong>Create a Dedicated Skills Block:</strong> Group your technologies strictly into categorized lines (Languages, Frameworks, Tools) so the segmenter maps them with high confidence.</li>
          <li><strong>Use StudyBuddy's Resume Optimizer:</strong> Our built-in scanner runs your PDF against the target job description in real-time, highlighting missing keywords and structural warnings before you hit submit.</li>
        </ul>
      </>
    )
  },
  {
    id: "veda-ai-obsidian-notes",
    title: "Contextualizing Obsidian Notes for SDE Interviews",
    excerpt: "How Veda AI references your local Markdown notes, builds a cognitive map, and gives exact, personalized career answers.",
    category: "Veda AI",
    date: "May 10, 2026",
    readTime: "5 min read",
    author: "Sarah Jenkins",
    authorRole: "Principal AI Research Engineer",
    authorInitials: "SJ",
    gradient: "from-cyan-500 via-teal-500 to-indigo-500",
    content: (
      <>
        <p className="text-lg text-slate-300 font-serif leading-relaxed">
          Software engineering is an increasingly vast discipline. Preparing for placements typically means studying three distinct pillars: **Algorithms & Data Structures**, **System Design**, and **Behavioral Stories**. When your knowledge is scattered across folders, bookmarks, and Google Docs, you lose the ability to see relationships between these concepts.
        </p>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-cyan-500 pl-4">
          The Power of an Atomic Knowledge Graph
        </h2>
        <p className="mt-4">
          Obsidian has transformed note-taking by replacing linear structures with a **bi-directional knowledge graph**. Instead of writing long, monolithic documents, the atomic method encourages you to create short notes dedicated to a single concept—such as `[[Load Balancing]]` or `[[STAR - Distributed Sync Project]]`.
        </p>
        <p className="mt-4">
          By utilizing bi-directional links (`[[concept]]`), you establish edges in your personal knowledge graph. Over time, you form a robust mental mesh.
        </p>

        <AlertCard type="info" title="The Bi-Directional Link Rule">
          Whenever you solve a sliding window question, link it to your core algorithmic node: {"`[[LeetCode 3]] -> [[Sliding Window Pattern]]`"}. When writing about a system design design decision, link it to your behavioral story: {"`[[Design: Cache Cluster]] -> [[STAR: Handling Scalability Challenges]]`"}. This makes interview recall incredibly quick.
        </AlertCard>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-cyan-500 pl-4">
          Finding Your Knowledge Gaps
        </h2>
        <p className="mt-4">
          In Obsidian's Graph View, notes appear as nodes, and links appear as edges. Analyzing your graph gives you immediate diagnostic feedback on your placement preparation:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-300">
          <li><strong>Orphan Nodes (Singletons):</strong> Notes with zero links represent isolated facts. These have the highest probability of being forgotten.</li>
          <li><strong>Super-Clusters:</strong> Heavily connected clusters show your strong suites (e.g. standard coding concepts).</li>
          <li><strong>Structural Bridges:</strong> Notes that link two distinct clusters (e.g., bridging an algorithm with a project architectural decision) are the goldmine for unique interview answers.</li>
        </ul>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-cyan-500 pl-4">
          Enter Veda AI: Personalizing Your Context
        </h2>
        <p className="mt-4">
          StudyBuddy's **Veda AI** takes this one step further. By connecting to your local Obsidian notes directory, Veda parses your custom knowledge graph. During interview prep, instead of feeding you generic answers, Veda references your personal notes:
        </p>
        
        <CodeBlock 
          filename="Veda AI Context Generation Prompt"
          language="text"
          code={`[User Query]: "How do I explain how I handle database scale in an interview?"

[Veda AI processing]:
- Scanning linked Obsidian vault...
- Found matching atomic node: [[STAR - SQLite Offline Sync Project]]
- Found related tech stack: [[SQLite Write-Ahead Logging]], [[CPR Threading Pool]]
- Generating custom narrative using user's actual project vocabulary...

[Veda AI response]:
"In your interview, explain how you tackled the scale limits of SQLite in your Sync Project by implementing Write-Ahead Logging (WAL) and offloading network synchronization to background worker threads using CPR, keeping the user interface completely non-blocking..."`}
        />
      </>
    )
  },
  {
    id: "cpp-offline-sync-agent",
    title: "Inside the StudyBuddy C++17 Offline Sync Agent",
    excerpt: "A deep dive into CMake compiling, CPR networking, and local-first SQLite architectures that power the lightning-fast CLI.",
    category: "Engineering",
    date: "Apr 29, 2026",
    readTime: "12 min read",
    author: "Marcus Vance",
    authorRole: "Lead Systems Engineer",
    authorInitials: "MV",
    gradient: "from-blue-600 via-indigo-600 to-cyan-500",
    content: (
      <>
        <p className="text-lg text-slate-300 font-serif leading-relaxed">
          Modern developers expect applications to be blazingly fast, highly reliable, and operable without an internet connection. At StudyBuddy, we designed our command-line companion agent with a **local-first philosophy**. To ensure maximum performance, low footprint, and portability, we engineered the engine in modern **C++17**.
        </p>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-blue-600 pl-4">
          The Architecture: SQLite & CPR
        </h2>
        <p className="mt-4">
          A local-first architecture mandates that the **local database is the absolute source of truth**. Reads and writes happen instantly locally. Synchronization occurs asynchronously in the background:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-slate-300">
          <li><strong>Local Persistence:</strong> We utilize **SQLite** due to its serverless, zero-configuration nature and rapid read speed.</li>
          <li><strong>Networking Layer:</strong> We integrate **CPR** (C++ Requests), a modern wrapper around libcurl, providing standard HTTP verbs in a clean, functional syntax.</li>
        </ul>

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-blue-600 pl-4">
          The Compile System: Modern CMake
        </h2>
        <p className="mt-4">
          C++ is historically plagued by difficult dependency management. We bypassed this entirely using **CMake's FetchContent** module, fetching and compiling CPR and SQLite dynamically at build time, ensuring seamless build steps across Linux, Windows, and macOS.
        </p>

        <CodeBlock 
          filename="CMakeLists.txt"
          language="cmake"
          code={`cmake_minimum_required(VERSION 3.15)
project(StudyBuddySyncAgent LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Fetch CPR (C++ Requests)
include(FetchContent)
FetchContent_Declare(
    cpr
    GIT_REPOSITORY https://github.com/libcpr/cpr.git
    GIT_TAG 1.10.x
)
FetchContent_MakeAvailable(cpr)

# Find local SQLite3
find_package(SQLite3 REQUIRED)

add_executable(sync_agent src/main.cpp src/sync_engine.cpp)
target_link_libraries(sync_agent PRIVATE cpr::cpr SQLite::SQLite3)`}
        />

        <h2 className="text-2xl font-bold font-display text-white mt-10 mb-4 tracking-tight border-l-4 border-blue-600 pl-4">
          Synchronizing State (Production C++ Snippet)
        </h2>
        <p className="mt-4">
          Our synchronization protocol relies on a dirty-tracking transaction log. When the sync agent wakes up, it queries SQLite for all entries marked with `synced = 0`, builds a JSON payload, and posts it using CPR.
        </p>

        <CodeBlock 
          filename="sync_engine.cpp"
          language="cpp"
          code={`#include <iostream>
#include <sqlite3.h>
#include <cpr/cpr.h>

bool synchronize_local_notes(sqlite3* db) {
    // 1. Fetch dirty transactions from local SQLite cache
    std::string select_query = "SELECT id, content, last_modified FROM notes WHERE synced = 0;";
    sqlite3_stmt* stmt;
    
    if (sqlite3_prepare_v2(db, select_query.c_str(), -1, &stmt, nullptr) != SQLITE_OK) {
        std::cerr << "Failed to query local database." << std::endl;
        return false;
    }
    
    // 2. Perform bulk upload using CPR
    std::string payload = "[";
    while (sqlite3_step(stmt) == SQLITE_ROW) {
        std::string id = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 0));
        std::string content = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
        payload += "{\\"id\\":\\"" + id + "\\",\\"content\\":\\"" + content + "\\"},";
    }
    sqlite3_finalize(stmt);
    
    if (payload.back() == ',') payload.pop_back();
    payload += "]";
    
    if (payload == "[]") return true; // Nothing to sync

    // 3. Network post with CPR
    cpr::Response r = cpr::Post(
        cpr::Url{"https://api.studybuddy.ai/v1/sync"},
        cpr::Header{{"Content-Type", "application/json"}},
        cpr::Body{payload}
    );
    
    // 4. Update sync status on success (200 OK)
    if (r.status_code == 200) {
        sqlite3_exec(db, "UPDATE notes SET synced = 1 WHERE synced = 0;", nullptr, nullptr, nullptr);
        std::cout << "[Sync] Upload success: " << r.text << std::endl;
        return true;
    }
    
    std::cerr << "[Sync] Error: Network sync returned " << r.status_code << std::endl;
    return false;
}`}
        />

        <AlertCard type="success" title="Why Modern C++ Matters">
          By utilizing standard multi-threading models (`std::jthread` in newer compilations) and direct C-bindings to SQLite, the StudyBuddy agent completes checks in under 8 milliseconds, consuming less than 12MB of RAM, making it practically invisible on the host system.
        </AlertCard>
      </>
    )
  }
];

export function BlogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Track read state for current active article
  const activePostId = searchParams.get("post");
  const activePost = mockPosts.find(p => p.id === activePostId);

  const categories = ["All", "Placement", "Memory", "Veda AI", "Engineering"];

  // Filter posts for main grid
  const filteredPosts = mockPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle article clicks
  const handleOpenArticle = (id: string) => {
    setSearchParams({ post: id });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseArticle = () => {
    setSearchParams({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Scroll Progress Hook (Framer Motion)
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Dynamic share logic
  const [copiedLink, setCopiedLink] = useState(false);
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#020203] text-slate-100 selection:bg-brand/35 selection:text-white relative">
      {/* Background Gradients */}
      <div className="absolute top-0 right-10 h-[600px] w-[600px] rounded-full bg-brand/5 blur-[180px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[180px] pointer-events-none animate-pulse-glow" />

      <AnimatePresence mode="wait">
        {!activePost ? (
          /* Main Articles Grid View */
          <motion.section 
            key="grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="mx-auto max-w-6xl px-6 py-16 relative z-10"
          >
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-all group"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back to Home
            </Link>

            {/* Heading */}
            <div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-light">
                  <BookOpen size={14} />
                  StudyBuddy Insights
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400 leading-none">
                  The Cognitive Blog
                </h1>
                <p className="mt-5 text-lg text-slate-400 leading-relaxed">
                  Actionable deep dives, technical guides, and cognitive learning theories curated by our placement and AI research teams.
                </p>
              </div>

              {/* Search bar */}
              <div className="relative w-full md:w-80 shrink-0">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-brand/40 focus:bg-white/[0.05] transition-all"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="mt-10 flex flex-wrap gap-2.5 pb-6 border-b border-white/[0.06]">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    selectedCategory === category 
                      ? "bg-brand text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                      : "border border-white/10 bg-white/[0.02] text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Blog Posts Grid */}
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#07080a]/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand/35 hover:bg-[#0c0e12]/80 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:-translate-y-1"
                >
                  <div>
                    {/* Visual Header Card - Render custom interactive illustrations */}
                    <div className="h-48 rounded-xl relative overflow-hidden shadow-inner border border-white/[0.03]">
                      <BlogVisualHeader id={post.id} />
                      {/* Glass Card Cover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-4 left-4 z-20 rounded-full bg-black/60 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white border border-white/[0.08]">
                        {post.category}
                      </span>
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-1 text-[10px] font-bold text-white/90 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/5">
                        <Sparkles size={11} className="text-amber-300 animate-pulse" />
                        StudyBuddy Original
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={13} />
                          {post.readTime}
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl font-bold font-display text-white group-hover:text-brand-light transition-colors duration-200">
                        {post.title}
                      </h2>
                      <p className="mt-3 text-sm leading-relaxed text-slate-400 line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/[0.05] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-7 w-7 rounded-full bg-gradient-to-br ${post.gradient} flex items-center justify-center text-[10px] font-black text-white shadow`}>
                        {post.authorInitials}
                      </div>
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                        <User size={12} className="text-slate-500" />
                        {post.author}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleOpenArticle(post.id)}
                      className="text-xs font-bold text-brand group-hover:text-brand-light transition-colors flex items-center gap-1 group-hover:translate-x-0.5 duration-200"
                    >
                      Read Article <ArrowRight size={12} />
                    </button>
                  </div>
                </article>
              ))}

              {filteredPosts.length === 0 && (
                <div className="col-span-2 text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                  <p className="text-slate-500 text-sm">No articles match your search parameters.</p>
                </div>
              )}
            </div>
          </motion.section>
        ) : (
          /* Premium Article Reader Canvas */
          <motion.div
            key="reader"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
          >
            {/* Scroll Indicator Bar */}
            <motion.div 
              style={{ scaleX }} 
              className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand to-accent origin-left z-50 shadow-[0_0_10px_#6366f1]"
            />

            {/* Reading navigation bar */}
            <nav className="sticky top-0 bg-[#020203]/80 backdrop-blur-md border-b border-white/[0.05] py-4 px-6 z-40 flex items-center justify-between">
              <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
                <button 
                  onClick={handleCloseArticle}
                  className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors duration-200 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                  Back to Insights
                </button>
                <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 max-w-[500px] truncate">
                  <span>{activePost.category}</span>
                  <ChevronRight size={12} />
                  <span className="text-slate-300 truncate">{activePost.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleShare}
                    className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all duration-200"
                    title="Copy Article Link"
                  >
                    {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
                  </button>
                  <button className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 text-slate-400 hover:text-white transition-all duration-200">
                    <Bookmark size={14} />
                  </button>
                </div>
              </div>
            </nav>

            <article className="max-w-4xl mx-auto px-6 pt-10 pb-24 relative z-10">
              {/* Hero Banner Illustration */}
              <div className="h-64 sm:h-80 w-full rounded-2xl relative overflow-hidden shadow-2xl border border-white/[0.08]">
                <BlogVisualHeader id={activePost.id} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-6 left-6 z-20 rounded-full bg-black/60 px-4.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white border border-white/[0.08]">
                  {activePost.category}
                </span>
              </div>

              {/* Meta */}
              <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {activePost.date}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/[0.12]" />
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {activePost.readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-4 text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
                {activePost.title}
              </h1>

              {/* Author Card */}
              <div className="mt-6 flex items-center gap-3.5 pb-8 border-b border-white/[0.08]">
                <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${activePost.gradient} flex items-center justify-center text-xs font-black text-white shadow-lg`}>
                  {activePost.authorInitials}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-snug flex items-center gap-1.5">
                    <User size={13} className="text-slate-500" />
                    {activePost.author}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{activePost.authorRole}</p>
                </div>
              </div>

              {/* Deep Readable Content Frame */}
              <div className="mt-10 font-sans text-[#cbd5e1] leading-relaxed text-base sm:text-lg space-y-6 antialiased">
                {activePost.content}
              </div>

              {/* Footer CTA & Related */}
              <div className="mt-20 pt-10 border-t border-white/[0.08] flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center border border-brand/20 mb-4 animate-bounce">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-bold font-display text-white">Accelerate Your Placements</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-md">
                  Veda AI integrates directly with your study guides and notes to tailor an optimal, offline-first interview roadmap.
                </p>
                <Link 
                  to="/notes" 
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-light text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  Start Synced Note-taking <ArrowRight size={14} />
                </Link>
              </div>

              {/* Related Articles Carousel */}
              <div className="mt-24">
                <h3 className="text-lg font-bold font-display text-white mb-6">More from StudyBuddy Insights</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {mockPosts.filter(p => p.id !== activePost.id).slice(0, 2).map(post => (
                    <div 
                      key={post.id}
                      onClick={() => handleOpenArticle(post.id)}
                      className="group p-5 rounded-xl border border-white/[0.05] bg-[#07080a]/40 cursor-pointer hover:border-brand/20 hover:bg-[#0c0e12]/60 hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] transition-all duration-300"
                    >
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{post.category}</span>
                      <h4 className="mt-2 text-base font-bold text-white group-hover:text-brand-light transition-colors duration-200">{post.title}</h4>
                      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 border-t border-white/[0.04] pt-4">
                        <span>{post.date}</span>
                        <span className="text-brand font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-200">Read <ArrowRight size={10} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {/* Sticky Floating Sidebar Back Button */}
            <div className="hidden lg:block fixed left-10 bottom-10 z-40">
              <button 
                onClick={handleCloseArticle}
                className="flex items-center gap-2 p-3 rounded-full bg-slate-900 border border-white/5 hover:border-brand/35 text-slate-400 hover:text-white shadow-2xl transition-all duration-300 hover:-translate-y-0.5 group"
                title="Back to Articles"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
