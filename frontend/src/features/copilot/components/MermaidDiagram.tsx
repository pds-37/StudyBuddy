import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "monospace"
});

export function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    
    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (error) {
        console.error("Mermaid parsing error:", error);
        if (isMounted) {
          setSvgContent(`<div class="text-red-400 p-4 border border-red-500/20 rounded-md text-xs">Failed to render diagram</div>`);
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (!svgContent) {
    return <div className="my-4 animate-pulse h-32 bg-white/[0.02] rounded-xl border border-white/[0.08]" />;
  }

  return (
    <div 
      ref={containerRef}
      className="my-4 overflow-x-auto rounded-xl border border-white/[0.08] bg-slate-950/20 backdrop-blur-sm shadow-md p-4 flex justify-center custom-scrollbar mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
