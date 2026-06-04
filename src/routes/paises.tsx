import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStickerViews, isConseguida } from "@/lib/album/store";
import { PageHeader, ProgressBar } from "@/components/album/ui";

export const Route = createFileRoute("/paises")({
  head: () => ({
    meta: [
      { title: "Países y secciones · Álbum WC 2026" },
      { name: "description", content: "Avance por país y por sección especial." },
    ],
  }),
  component: PaisesPage,
});

function PaisesPage() {
  const views = useStickerViews();
  const grupos = useMemo(() => {
    const m = new Map<string, { codigo: string; nombre: string; total: number; tengo: number; falta: number; repetidas: number; revisar: number; especial: boolean }>();
    for (const v of views) {
      const cur = m.get(v.codigo) ?? {
        codigo: v.codigo, nombre: v.pais_seccion,
        total: 0, tengo: 0, falta: 0, repetidas: 0, revisar: 0,
        especial: v.es_especial,
      };
      cur.total++;
      if (isConseguida(v.entry)) cur.tengo++;
      if (v.entry.estado === "Falta") cur.falta++;
      if (v.entry.cantidad > 1) cur.repetidas++;
      if (v.entry.estado === "Revisar") cur.revisar++;
      m.set(v.codigo, cur);
    }
    return Array.from(m.values()).sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [views]);

  return (
    <div>
      <PageHeader
        title="Países y secciones"
        description="Haz clic en una tarjeta para ver todas sus figuras."
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {grupos.map((g) => {
          const pct = g.total === 0 ? 0 : Math.round((g.tengo / g.total) * 100);
          const estado = pct === 100 ? "Completo" : g.revisar > 0 ? "En revisión" : "Incompleto";
          return (
            <Link
              key={g.codigo}
              to="/paises/$codigo"
              params={{ codigo: g.codigo }}
              className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="font-mono text-xs font-bold text-muted-foreground">{g.codigo}</p>
                  <p className="font-semibold">{g.nombre}</p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{
                    background: pct === 100 ? "var(--status-tengo-bg)" : "var(--status-falta-bg)",
                    color: pct === 100 ? "var(--status-tengo)" : "var(--status-falta)",
                  }}
                >
                  {estado}
                </span>
              </div>
              <ProgressBar value={g.tengo} total={g.total} />
              <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                <span>Falta: <b>{g.falta}</b></span>
                <span>Rep: <b>{g.repetidas}</b></span>
                {g.revisar > 0 && <span>Rev: <b>{g.revisar}</b></span>}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}