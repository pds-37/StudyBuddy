type EmptyStateProps = {
  title: string;
  description: string;
};

/** Displays a compact placeholder state for feature shells. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-white/15 p-8 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 text-slate-500 text-slate-400">{description}</p>
    </div>
  );
}
