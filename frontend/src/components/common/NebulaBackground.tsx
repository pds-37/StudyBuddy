import { motion } from "framer-motion";
import { cn } from "../../lib/utils/cn";

type NebulaBackgroundProps = {
  className?: string;
  opacity?: number;
  showGrid?: boolean;
};

/** 
 * A reusable, premium nebula background with grid and animated glows.
 * Ensures consistent theme across different pages of the app.
 */
export function NebulaBackground({ 
  className, 
  opacity = 1, 
  showGrid = true 
}: NebulaBackgroundProps) {
  return (
    <div 
      className={cn("pointer-events-none absolute inset-0 -z-10 bg-obsidian", className)}
      style={{ opacity }}
    >
      {showGrid && <div className="absolute inset-0 bg-grid opacity-20" />}
      
      {/* Animated Purple Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3],
          x: [0, 20, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[5%] w-[50%] h-[50%] rounded-full" 
        style={{ background: 'radial-gradient(circle, rgba(124, 92, 255, 0.15) 0%, transparent 60%)' }}
      />

      {/* Animated Cyan Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
          x: [0, -30, 0],
          y: [0, 10, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] rounded-full" 
        style={{ background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 60%)' }}
      />

      {/* Subtle Central Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" 
        style={{ background: 'radial-gradient(circle, rgba(124, 92, 255, 0.05) 0%, transparent 60%)' }}
      />
    </div>
  );
}
