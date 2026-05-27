import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Calendar, Clock, User, Search, Sparkles } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: "Placement" | "Memory" | "Veda AI" | "Engineering";
  date: string;
  readTime: string;
  author: string;
  gradient: string;
}

const mockPosts: BlogPost[] = [
  {
    id: "spaced-repetition-placements",
    title: "The Science of Spaced Repetition in SDE Placements",
    excerpt: "How practicing key algorithms in 1, 3, 7, and 30-day intervals prevents memory decay and secures standard SDE offers.",
    category: "Memory",
    date: "May 25, 2026",
    readTime: "6 min read",
    author: "Dr. Rachel Veda",
    gradient: "from-brand via-indigo-500 to-purple-600"
  },
  {
    id: "ats-resume-adaptation",
    title: "Bypassing ATS Filters: An AI-Driven Approach to Resumes",
    excerpt: "Generic resumes are failing. Explore how our contextual AI Resume tool dynamically extracts keywords and scores JDs.",
    category: "Placement",
    date: "May 18, 2026",
    readTime: "8 min read",
    author: "Vikram Sen",
    gradient: "from-purple-600 via-pink-500 to-red-500"
  },
  {
    id: "veda-ai-obsidian-notes",
    title: "Contextualizing Obsidian Notes for SDE Interviews",
    excerpt: "How Veda AI references your local Markdown notes, builds a cognitive map, and gives exact, personalized career answers.",
    category: "Veda AI",
    date: "May 10, 2026",
    readTime: "5 min read",
    author: "Sarah Jenkins",
    gradient: "from-cyan via-teal-500 to-indigo-500"
  },
  {
    id: "cpp-offline-sync-agent",
    title: "Inside the StudyBuddy C++17 Offline Sync Agent",
    excerpt: "A deep dive into CMake compiling, CPR networking, and local-first SQLite architectures that power the lightning-fast CLI.",
    category: "Engineering",
    date: "Apr 29, 2026",
    readTime: "12 min read",
    author: "Marcus Vance",
    gradient: "from-blue-600 via-indigo-600 to-cyan"
  }
];

export function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Placement", "Memory", "Veda AI", "Engineering"];

  const filteredPosts = mockPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#000000] px-6 py-16 text-slate-100 selection:bg-brand/35 selection:text-white">
      {/* Dynamic Background */}
      <div className="absolute top-0 right-10 h-[600px] w-[600px] rounded-full bg-brand/5 blur-[160px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[160px] pointer-events-none animate-pulse-glow" />

      <section className="mx-auto max-w-6xl relative z-10">
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
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
              The Cognitive Blog
            </h1>
            <p className="mt-5 text-lg text-slate-400">
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
              className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#07080a]/60 p-6 backdrop-blur-xl transition-all duration-300 hover:border-brand/30 hover:bg-[#0c0e12]/80 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:-translate-y-1"
            >
              <div>
                {/* Visual Header Card */}
                <div className={`h-48 rounded-xl bg-gradient-to-tr ${post.gradient} p-6 flex flex-col justify-between relative overflow-hidden shadow-inner`}>
                  {/* Glass Card Cover Overlay */}
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
                  <span className="relative z-10 self-start rounded-full bg-black/45 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-white border border-white/[0.08]">
                    {post.category}
                  </span>
                  <div className="relative z-10 flex items-center gap-1 text-[10px] font-bold text-white/80">
                    <Sparkles size={12} className="text-amber-300 animate-pulse" />
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
                  <h2 className="mt-4 text-2xl font-bold font-display text-white group-hover:text-brand-light transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-brand/20 flex items-center justify-center text-[10px] font-bold text-brand-light">
                    {post.author.split(" ").map(n => n[0]).join("")}
                  </div>
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <User size={12} className="text-slate-500" />
                    {post.author}
                  </span>
                </div>
                <span className="text-xs font-bold text-brand group-hover:text-brand-light transition-colors">
                  Read Article →
                </span>
              </div>
            </article>
          ))}

          {filteredPosts.length === 0 && (
            <div className="col-span-2 text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
              <p className="text-slate-500 text-sm">No articles match your search parameters.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
