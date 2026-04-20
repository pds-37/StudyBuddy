import { type ReactNode } from "react";

type FormShellProps = {
  title: string;
  children: ReactNode;
};

/** Wraps forms with consistent spacing until feature forms are implemented. */
export function FormShell({ title, children }: FormShellProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-panel p-6">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="mt-6">{children}</div>
    </section>
  );
}
