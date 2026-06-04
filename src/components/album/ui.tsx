import type { Estado } from "@/lib/album/types";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  accent = "primary",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "primary" | "tengo" | "falta" | "repetida" | "especial" | "revisar";
}) {
  const accentColor: Record<string, string> = {
    primary: "var(--primary)",
    tengo: "var(--status-tengo)",
    falta: "var(--status-falta)",
    repetida: "var(--status-repetida)",
    especial: "var(--status-especial)",
    revisar: "var(--status-revisar)",
  };
  return (
    <div
      className="rounded-xl border border-border bg-card p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: accentColor[accent] }}
        />
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ProgressBar({
  value,
  total,
  className,
}: {
  value: number;
  total: number;
  className?: string;
}) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground tabular-nums">
          {value} / {total}
        </span>
        <span className="font-semibold text-primary tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? "var(--gradient-gold)"
                : "var(--gradient-hero)",
          }}
        />
      </div>
    </div>
  );
}

export function EstadoBadge({ estado }: { estado: Estado }) {
  const map: Record<Estado, { bg: string; fg: string }> = {
    Tengo: { bg: "var(--status-tengo-bg)", fg: "var(--status-tengo)" },
    Falta: { bg: "var(--status-falta-bg)", fg: "var(--status-falta)" },
    Repetida: { bg: "var(--status-repetida-bg)", fg: "var(--status-repetida)" },
    "En intercambio": {
      bg: "var(--status-intercambio-bg)",
      fg: "var(--status-intercambio)",
    },
    "Conseguida hoy": { bg: "var(--status-tengo-bg)", fg: "var(--status-tengo)" },
    Revisar: { bg: "var(--status-revisar-bg)", fg: "var(--status-revisar)" },
  };
  const c = map[estado];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: c.bg, color: c.fg }}
    >
      {estado}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}