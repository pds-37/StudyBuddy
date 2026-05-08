import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Network, 
  Brain, 
  NotebookText, 
  Route, 
  Loader2, 
  Search,
  Maximize2,
  Minimize2,
  Info
} from "lucide-react";
import { getKnowledgeGraph, type KnowledgeGraphData, type KnowledgeNode } from "../lib/api/knowledge";
import { cn } from "../lib/utils/cn";

export function KnowledgePage() {
  const [data, setData] = useState<KnowledgeGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadGraph = async () => {
      try {
        const graph = await getKnowledgeGraph();
        setData(graph);
      } catch (err) {
        console.error("Failed to load graph", err);
      } finally {
        setLoading(false);
      }
    };
    void loadGraph();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
        <p className="text-sm font-medium text-slate-500">Mapping your knowledge base...</p>
      </div>
    );
  }

  if (!data || data.nodes.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center text-center">
        <div className="rounded-full bg-slate-50 dark:bg-slate-50 dark:bg-white/5 p-6 mb-6">
          <Network className="h-12 w-12 text-slate-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">Your Knowledge Graph is empty</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-500 dark:text-slate-400 max-w-md">Start taking notes or generating roadmaps to see how your skills and knowledge interconnect.</p>
      </div>
    );
  }

  // Simple layout: circular
  const nodesWithPos = data.nodes.map((node, i) => {
    const angle = (i / data.nodes.length) * 2 * Math.PI;
    const radius = node.type === "skill" ? 150 : node.type === "milestone" ? 250 : 350;
    return {
      ...node,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius
    };
  });

  const nodeMap = new Map(nodesWithPos.map(n => [n.id, n]));

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col pt-4 space-y-8 animate-fade-in overflow-hidden relative">

      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-white flex items-center gap-3">
            <Network className="text-brand" />
            Knowledge Graph
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-500 dark:text-slate-400">Visualize the neural map of your learning journey</p>
        </div>

        <div className="flex items-center gap-2 bg-white/[0.03] border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-2xl p-1">
          <button onClick={() => setZoom(prev => Math.min(2, prev + 0.1))} className="p-2 text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-white transition"><Maximize2 size={18} /></button>
          <button onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))} className="p-2 text-slate-500 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-slate-900 dark:text-white transition"><Minimize2 size={18} /></button>
        </div>
      </header>

      <div 
        ref={containerRef}
        className="flex-1 rounded-[2.5rem] border border-slate-200 dark:border-slate-200 dark:border-white/10 bg-black/40 overflow-hidden relative cursor-grab active:cursor-grabbing"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,92,255,0.05)_0%,transparent_70%)]" />
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: zoom }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <svg className="w-full h-full overflow-visible">
            {/* Links */}
            {data.links.map((link, i) => {
              const s = nodeMap.get(link.source);
              const t = nodeMap.get(link.target);
              if (!s || !t) return null;
              return (
                <line
                  key={i}
                  x1={s.x + 400}
                  y1={s.y + 300}
                  x2={t.x + 400}
                  y2={t.y + 300}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Nodes as foreign objects for rich HTML */}
            {nodesWithPos.map((node) => (
              <foreignObject
                key={node.id}
                x={node.x + 400 - 40}
                y={node.y + 300 - 40}
                width="80"
                height="80"
              >
                <div className="flex items-center justify-center h-full">
                  <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedNode(node)}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-2xl relative group",
                      node.type === "skill" ? "bg-cyan/10 border-cyan/40 text-cyan" :
                      node.type === "milestone" ? "bg-purple-500/10 border-purple-500/40 text-purple-400" :
                      "bg-slate-50 dark:bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-900 dark:text-white"
                    )}
                  >
                    {node.type === "skill" ? <Brain size={20} /> :
                     node.type === "milestone" ? <Route size={20} /> :
                     <NotebookText size={20} />}
                    
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                      <span className="bg-black/80 text-[10px] text-slate-900 dark:text-slate-900 dark:text-white px-2 py-1 rounded border border-slate-200 dark:border-slate-200 dark:border-white/10">
                        {node.label}
                      </span>
                    </div>

                    {selectedNode?.id === node.id && (
                      <motion.div 
                        layoutId="active-ring"
                        className="absolute inset-[-6px] rounded-[1.5rem] border-2 border-brand/50"
                      />
                    )}
                  </motion.button>
                </div>
              </foreignObject>
            ))}
          </svg>
        </motion.div>

        {/* Info Panel Overlay */}
        <AnimatePresence>
          {selectedNode && (
            <motion.aside
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              className="absolute top-6 right-6 bottom-6 w-80 bg-slate-50 dark:bg-panel bg-slate-50 dark:bg-panel/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-2xl z-30"
            >
              <button 
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 dark:text-slate-900 dark:text-white"
              >
                ✕
              </button>

              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    selectedNode.type === "skill" ? "bg-cyan/10 text-cyan" :
                    selectedNode.type === "milestone" ? "bg-purple-500/10 text-purple-400" :
                    "bg-slate-50 dark:bg-slate-50 dark:bg-white/5 text-slate-900 dark:text-slate-900 dark:text-white"
                  )}>
                    {selectedNode.type === "skill" ? <Brain size={24} /> :
                     selectedNode.type === "milestone" ? <Route size={24} /> :
                     <NotebookText size={24} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{selectedNode.type}</p>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-900 dark:text-white leading-tight">{selectedNode.label}</h3>
                  </div>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Relationship Density</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-slate-50 dark:bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-brand" style={{ width: `${Math.min(100, selectedNode.val * 5)}%` }} />
                      </div>
                      <span className="text-xs font-mono text-slate-900 dark:text-slate-900 dark:text-white">{selectedNode.val}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-slate-900 dark:text-white mb-3">
                      <Info size={14} className="text-brand" />
                      AI Insight
                    </div>
                    <p className="text-xs leading-5 text-slate-500 dark:text-slate-500 dark:text-slate-400">
                      This {selectedNode.type} is a central node in your learning network. It has {data.links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).length} active connections.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5">
                  <button className="w-full py-3 rounded-xl bg-brand text-sm font-bold text-slate-900 dark:text-slate-900 dark:text-white hover:bg-brand/90 transition shadow-lg shadow-brand/20">
                    Open Node Details
                  </button>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-3 z-10 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-slate-400">
            <div className="w-3 h-3 rounded bg-cyan/40 border border-cyan/60" />
            Skills (Core Knowledge)
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-slate-400">
            <div className="w-3 h-3 rounded bg-purple-500/40 border border-purple-500/60" />
            Roadmap Milestones
          </div>
          <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-500 dark:text-slate-400">
            <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-100 dark:bg-white/10 border border-white/20" />
            Personal Notes
          </div>
        </div>
      </div>
    </div>
  );
}
