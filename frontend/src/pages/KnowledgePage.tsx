import { useEffect, useState, useRef, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Network, Brain, NotebookText, Route, Loader2, Maximize2, Minimize2,
  Target, Shield, Activity, Zap, BookOpen, XCircle, ArrowRight, Code
} from "lucide-react";
import {
  getKnowledgeGraph, getConceptDetail, getInterviewReadiness,
  type KnowledgeGraphData, type KnowledgeNode, type ConceptDetail, type InterviewReadiness
} from "../lib/api/knowledge";
import { ThreeMindSpace } from "../features/knowledge/components/ThreeMindSpace";
import { cn } from "../lib/utils/cn";

const retentionColors: Record<string, string> = {
  strong: "#10b981", stable: "#06b6d4", weakening: "#f59e0b", critical: "#ef4444"
};
const typeColors: Record<string, string> = {
  concept: "#a78bfa", note: "#64748b", skill: "#06b6d4", milestone: "#f59e0b"
};

export function KnowledgePage() {
  const [data, setData] = useState<KnowledgeGraphData | null>(null);
  const [interview, setInterview] = useState<InterviewReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [conceptDetail, setConceptDetail] = useState<ConceptDetail | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activeTab, setActiveTab] = useState<"graph" | "interview">("graph");
  const [is3DMode, setIs3DMode] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [graph, readiness] = await Promise.all([
          getKnowledgeGraph(), getInterviewReadiness()
        ]);
        setData(graph);
        setInterview(readiness);
      } catch (err) { console.error("Failed to load graph", err); }
      finally { setLoading(false); }
    };
    void load();
  }, []);

  const handleNodeClick = useCallback(async (node: KnowledgeNode) => {
    setSelectedNode(node);
    if (node.type === "concept") {
      const rawId = node.id.replace("concept-", "");
      try {
        const detail = await getConceptDetail(rawId);
        setConceptDetail(detail);
      } catch { setConceptDetail(null); }
    } else { setConceptDetail(null); }
  }, []);

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background">
        <div className="w-14 h-14 rounded-full border-4 border-brand/20 border-t-brand animate-spin" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mapping knowledge graph...</p>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center bg-background px-8">
        <div className="w-16 h-16 bg-brand/10 flex items-center justify-center text-brand mb-6"><Network size={32} /></div>
        <h2 className="text-xl font-semibold text-white mb-2">Knowledge Graph is empty</h2>
        <p className="text-xs text-slate-500 max-w-sm">Start adding notes with concepts to see how your knowledge interconnects.</p>
      </div>
    );
  }

  const nodesWithPos = data.nodes.map((node, i) => {
    const angle = (i / data.nodes.length) * 2 * Math.PI;
    const baseRadius = node.type === "concept" ? 180 : node.type === "skill" ? 280 : node.type === "milestone" ? 340 : 240;
    const jitter = ((i * 7) % 40) - 20;
    return { ...node, x: Math.cos(angle) * (baseRadius + jitter), y: Math.sin(angle) * (baseRadius + jitter) };
  });
  const nodeMap = new Map(nodesWithPos.map(n => [n.id, n]));

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-background">
      {/* Header */}
      <header className="shrink-0 px-8 pt-8 pb-5 border-b border-border glass-panel relative z-10">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-base font-semibold text-slate-100 flex items-center gap-3">
                Knowledge Graph
                <span className="text-purple-400 text-[9px] border border-purple-500/20 px-2 py-0.5 bg-purple-500/5 font-bold tracking-wider uppercase">Neural Map</span>
              </h1>
              <p className="text-slate-400 text-[11px] mt-1.5 font-medium">Visualize concept retention, connections, and interview readiness.</p>
            </div>
            <div className="flex items-center gap-2">
              {["graph", "interview"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab as any)}
                  className={cn("px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                    activeTab === tab ? "text-brand border-b-2 border-brand" : "text-slate-400 hover:text-slate-300"
                  )}>{tab === "graph" ? "Graph" : "Interview"}</button>
              ))}
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-6">
            <Stat label="Nodes" value={data.stats.totalNodes} color="text-slate-300" icon={<Network size={12} />} />
            <Stat label="Edges" value={data.stats.totalEdges} color="text-purple-400" icon={<Activity size={12} />} />
            <Stat label="Strong" value={data.stats.strongConcepts} color="text-emerald-400" icon={<Shield size={12} />} />
            <Stat label="Critical" value={data.stats.criticalConcepts} color="text-red-400" icon={<Zap size={12} />} />
            <Stat label="Isolated" value={data.stats.isolatedConcepts} color="text-amber-400" icon={<Target size={12} />} />
            <Stat label="Retention" value={`${data.stats.avgRetention}%`} color="text-cyan-400" icon={<Brain size={12} />} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {activeTab === "graph" ? (
          <>
            {/* Graph Canvas */}
            <div className="flex-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,92,255,0.04)_0%,transparent_70%)]" />
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <button 
                  onClick={() => setIs3DMode(!is3DMode)} 
                  className="px-3 py-1.5 border border-brand/20 bg-brand/10 text-brand-light hover:bg-brand/20 text-[10px] font-mono font-bold uppercase rounded-lg transition-all"
                >
                  {is3DMode ? "2D Graph" : "3D Universe"}
                </button>
                {!is3DMode && (
                  <>
                    <button onClick={() => setZoom(z => Math.min(2, z + 0.15))} className="p-2 border border-white/10 text-slate-500 hover:text-white transition-colors"><Maximize2 size={14} /></button>
                    <button onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} className="p-2 border border-white/10 text-slate-500 hover:text-white transition-colors"><Minimize2 size={14} /></button>
                  </>
                )}
              </div>

              {is3DMode ? (
                <ThreeMindSpace 
                  data={data} 
                  onNodeClick={handleNodeClick} 
                  selectedNode={selectedNode} 
                />
              ) : (
                <Motion.div className="absolute inset-0 flex items-center justify-center" animate={{ scale: zoom }} transition={{ type: "spring", stiffness: 100, damping: 20 }}>
                  <svg className="w-full h-full overflow-visible">
                    {data.links.map((link, i) => {
                      const s = nodeMap.get(link.source), t = nodeMap.get(link.target);
                      if (!s || !t) return null;
                      const color = link.relationship === "contains" ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)";
                      return <line key={i} x1={s.x + 450} y1={s.y + 350} x2={t.x + 450} y2={t.y + 350} stroke={color} strokeWidth={link.strength ? link.strength * 2 : 1} />;
                    })}
                  {nodesWithPos.map(node => {
                    const color = node.retentionState ? retentionColors[node.retentionState] : typeColors[node.type] || "#64748b";
                    const size = Math.max(6, Math.min(16, node.val / 2));
                    return (
                      <g key={node.id} onClick={() => handleNodeClick(node)} className="cursor-pointer">
                        <circle cx={node.x + 450} cy={node.y + 350} r={size + 4} fill="transparent" />
                        <circle cx={node.x + 450} cy={node.y + 350} r={size} fill={color} opacity={0.15} stroke={color} strokeWidth={selectedNode?.id === node.id ? 2.5 : 1} />
                        <circle cx={node.x + 450} cy={node.y + 350} r={size * 0.4} fill={color} opacity={0.8} />
                        {zoom > 0.7 && (
                          <text x={node.x + 450} y={node.y + 350 + size + 12} textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="Inter, sans-serif">{node.label.length > 16 ? node.label.slice(0, 14) + "…" : node.label}</text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </Motion.div>)}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 z-10 bg-black/60 backdrop-blur p-3 border border-white/5">
                {[
                  { label: "Strong", color: retentionColors.strong },
                  { label: "Stable", color: retentionColors.stable },
                  { label: "Weakening", color: retentionColors.weakening },
                  { label: "Critical", color: retentionColors.critical }
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2 text-[9px] text-slate-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />{l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
              {selectedNode && (
                <Motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 320, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                  className="shrink-0 border-l border-border glass-panel overflow-y-auto custom-scrollbar">
                  <div className="p-6 min-w-[300px] space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{selectedNode.type}</p>
                        <h3 className="text-sm font-semibold text-white">{selectedNode.label}</h3>
                      </div>
                      <button onClick={() => { setSelectedNode(null); setConceptDetail(null); }} className="text-slate-400 hover:text-white"><XCircle size={16} /></button>
                    </div>
                    {selectedNode.retentionState && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: retentionColors[selectedNode.retentionState] }} />
                        <span className="text-[10px] font-medium text-slate-400 capitalize">{selectedNode.retentionState}</span>
                        <span className="text-[10px] text-slate-400">{selectedNode.retentionScore}%</span>
                      </div>
                    )}
                    {selectedNode.category && <DetailRow label="Category" value={selectedNode.category} />}
                    {selectedNode.difficulty && <DetailRow label="Difficulty" value={selectedNode.difficulty} />}
                    {selectedNode.interviewFrequency && <DetailRow label="Interview Freq" value={selectedNode.interviewFrequency} />}
                    <DetailRow label="Connections" value={String(data.links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length)} />

                    {conceptDetail && (
                      <>
                        {conceptDetail.linkedNotes.length > 0 && (
                          <div className="pt-4 border-t border-white/5 space-y-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Linked Notes</p>
                            {conceptDetail.linkedNotes.map(n => (
                              <div key={n.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                                <span className="text-[10px] text-slate-400 truncate flex-1 mr-2">{n.title}</span>
                                <span className="text-[9px] text-slate-400">{Math.round(n.strength * 100)}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {conceptDetail.relatedConcepts.length > 0 && (
                          <div className="pt-4 border-t border-white/5 space-y-2">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Related Concepts</p>
                            {conceptDetail.relatedConcepts.map(c => (
                              <div key={c.id} className="flex items-center gap-2 py-1">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: retentionColors[c.retentionState] || "#64748b" }} />
                                <span className="text-[10px] text-slate-400">{c.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </Motion.aside>
              )}
            </AnimatePresence>
          </>
        ) : (
          /* Interview Readiness Tab */
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {interview && (
                <>
                  <div className="text-center py-8">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Interview Readiness Score</p>
                    <p className={cn("text-6xl font-light tracking-tight",
                      interview.overallScore > 70 ? "text-emerald-400" : interview.overallScore > 40 ? "text-amber-400" : "text-red-400"
                    )}>{interview.overallScore}%</p>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
                      Based on retention scores of high-frequency interview concepts.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-red-500/20 bg-red-500/5 p-5 space-y-3">
                      <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Critical Gaps</h3>
                      {interview.criticalGaps.length === 0 ? (
                        <p className="text-[10px] text-slate-500">No critical gaps detected!</p>
                      ) : interview.criticalGaps.map(g => (
                        <div key={g.name} className="flex items-center justify-between py-1.5 border-b border-red-500/10 last:border-0">
                          <span className="text-[11px] text-slate-300">{g.name}</span>
                          <span className="text-[9px] text-red-400">{g.retentionScore}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
                      <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Strong Areas</h3>
                      {interview.strongAreas.length === 0 ? (
                        <p className="text-[10px] text-slate-500">Keep reviewing to build strength.</p>
                      ) : interview.strongAreas.map(s => (
                        <div key={s.name} className="flex items-center justify-between py-1.5 border-b border-emerald-500/10 last:border-0">
                          <span className="text-[11px] text-slate-300">{s.name}</span>
                          <span className="text-[9px] text-emerald-400">{s.retentionScore}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {interview.topicBreakdown.length > 0 && (
                    <div className="glass-panel p-5 space-y-4">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Topic Breakdown</h3>
                      {interview.topicBreakdown.map(t => (
                        <div key={t.category} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-300 capitalize">{t.category}</span>
                            <span className="text-[9px] text-slate-500">{t.count} concepts · {t.avgRetention}%</span>
                          </div>
                          <div className="h-1 bg-white/5 overflow-hidden">
                            <div className={cn("h-full", t.avgRetention > 60 ? "bg-emerald-500" : t.avgRetention > 30 ? "bg-amber-500" : "bg-red-500")}
                              style={{ width: `${t.avgRetention}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color, icon }: { label: string; value: string | number; color: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5"><span className={cn("opacity-50", color)}>{icon}</span><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p></div>
      <p className={cn("text-xl font-light tracking-tight", color)}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-[10px] text-slate-400 capitalize">{value}</span>
    </div>
  );
}
