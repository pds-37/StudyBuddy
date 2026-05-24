import { cn } from "../../lib/utils/cn";

type NebulaBackgroundProps = {
  className?: string;
  opacity?: number;
  showGrid?: boolean;
};

/** A restrained workspace backdrop for the premium app shell. */
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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent_30%),linear-gradient(115deg,rgba(217,181,111,0.055),transparent_32%,rgba(122,167,160,0.035)_72%,transparent)]" />
      {showGrid && <div className="absolute inset-0 bg-grid opacity-[0.08]" />}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:1px_100%] opacity-20" />
    </div>
  );
}
