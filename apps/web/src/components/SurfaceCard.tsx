import type { PropsWithChildren, ReactNode } from "react";

type SurfaceCardProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}>;

export default function SurfaceCard({
  title,
  subtitle,
  action,
  className,
  children
}: SurfaceCardProps) {
  return (
    <section className={`surface-card ${className ?? ""}`.trim()}>
      {(title || subtitle || action) && (
        <header className="surface-card__header">
          <div>
            {title ? <h3>{title}</h3> : null}
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
