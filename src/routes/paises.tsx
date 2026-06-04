import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useStickerViews, isConseguida } from "@/lib/album/store";
import { PageHeader, ProgressBar } from "@/components/album/ui";
import { StickerTable } from "@/components/album/StickerTable";

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
  const [abierto, setAbierto] = useState<string | null>(null);

  const grupos = useMemo(() => {
    const m = new Map<string, { codigo: string; nombre: string; total: number; tengo: number; falta: number; repetidas: number; revisar: number }>();
    for (const v of views) {
      const cur = m.get(v.codigo) ?? {
        codigo: v.codigo, nombre: v.pais_seccion,
        total: 0, tengo: 0, falta: 0, repetidas: 0, revisar: 0,
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
        description="Hacé clic en un país para ver cuáles tenés y cuáles faltan."
      />
      <div className="flex flex-col gap-3">
        {grupos.map((g) => {
          const pct = g.total === 0 ? 0 : Math.round((g.tengo / g.total) * 100);
          const estado = pct === 100 ? "Completo" : g.revisar > 0 ? "En revisión" : "Incompleto";
          const expandido = abierto === g.codigo;

          const stickersPais = views.filter((v) => v.codigo === g.codigo);
          const tengoList = stickersPais.filter((v) => isConseguida(v.entry));
          const faltanList = stickersPais.filter((v) => !isConseguida(v.entry));

          return (
            <div
              key={g.codigo}
              className="rounded-xl border border-border bg-card overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Cabecera clickeable */}
              <button
                onClick={() => setAbierto(expandido ? null : g.codigo)}
                className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div>
                      <p className="font-mono text-xs font-bold text-muted-foreground">{g.codigo}</p>
                      <p className="font-semibold">{g.nombre}</p>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold shrink-0"
                      style={{
                        background: pct === 100 ? "var(--status-tengo-bg)" : "var(--status-falta-bg)",
                        color: pct === 100 ? "var(--status-tengo)" : "var(--status-falta)",
                      }}
                    >
                      {estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 ml-3 shrink-0">
                    <span className="text-sm font-semibold tabular-nums text-primary">{pct}%</span>
                    {expandido
                      ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    }
                  </div>
                </div>
                <div className="mt-2">
                  <ProgressBar value={g.tengo} total={g.total} />
                </div>
                <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                  <span>Tengo: <b className="text-green-600">{g.tengo}</b></span>
                  <span>Falta: <b className="text-red-500">{g.falta}</b></span>
                  {g.repetidas > 0 && <span>Rep: <b>{g.repetidas}</b></span>}
                  {g.revisar > 0 && <span>Rev: <b>{g.revisar}</b></span>}
                </div>
              </button>

              {/* Detalle expandido */}
              {expandido && (
                <div className="border-t border-border px-4 pb-4 pt-3">
                  {/* Tengo */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                        Tengo ({tengoList.length})
                      </h3>
                    </div>
                    {tengoList.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Todavía no tenés ninguna.</p>
                    ) : (
                      <StickerTable
                        views={tengoList}
                        columns={["codigo_completo", "nombre", "tipo", "cantidad", "repetidas", "acciones"]}
                      />
                    )}
                  </div>

                  {/* Faltan */}
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Faltan ({faltanList.length})
                      </h3>
                    </div>
                    {faltanList.length === 0 ? (
                      <p className="text-xs text-muted-foreground">¡País completo! 🎉</p>
                    ) : (
                      <StickerTable
                        views={faltanList}
                        columns={["marcar", "codigo_completo", "nombre", "tipo"]}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
