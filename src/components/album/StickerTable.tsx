import { Plus, Minus } from "lucide-react";
import { useAlbum } from "@/lib/album/store";
import type { StickerView } from "@/lib/album/types";
import { EstadoBadge } from "./ui";

export function StickerTable({
  views,
  columns = ["codigo_completo", "pais_seccion", "nombre", "tipo", "estado", "acciones"],
}: {
  views: StickerView[];
  columns?: Array<
    | "marcar"
    | "codigo_completo"
    | "pais_seccion"
    | "nombre"
    | "tipo"
    | "estado"
    | "cantidad"
    | "repetidas"
    | "fuente"
    | "fecha"
    | "observaciones"
    | "acciones"
  >;
}) {
  const inc = useAlbum((s) => s.incrementar);
  const dec = useAlbum((s) => s.decrementar);

  if (views.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
        No hay figuras que mostrar con los filtros actuales.
      </div>
    );
  }

  const head: Record<string, string> = {
    marcar: "",
    codigo_completo: "Código",
    pais_seccion: "País / Sección",
    nombre: "Nombre",
    tipo: "Tipo",
    estado: "Estado",
    cantidad: "Cant.",
    repetidas: "Rep.",
    fuente: "Fuente",
    fecha: "Fecha",
    observaciones: "Obs.",
    acciones: "",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-3 py-2 text-left font-semibold">
                  {head[c]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {views.map((v) => (
              <tr
                key={v.id}
                className="border-t border-border hover:bg-muted/30"
              >
                {columns.map((c) => (
                  <td key={c} className="px-3 py-2 align-middle">
                    {c === "codigo_completo" && (
                      <span className="font-mono text-xs font-semibold">{v.codigo_completo}</span>
                    )}
                    {c === "pais_seccion" && v.pais_seccion}
                    {c === "nombre" && <span className="font-medium">{v.nombre}</span>}
                    {c === "tipo" && <span className="text-muted-foreground">{v.tipo}</span>}
                    {c === "estado" && <EstadoBadge estado={v.entry.estado} />}
                    {c === "cantidad" && (
                      <span className="tabular-nums">{v.entry.cantidad}</span>
                    )}
                    {c === "repetidas" && (
                      <span className="tabular-nums">{v.entry.cantidad_repetida}</span>
                    )}
                    {c === "fuente" && (
                      <span className="text-xs text-muted-foreground">{v.entry.fuente || "—"}</span>
                    )}
                    {c === "fecha" && (
                      <span className="text-xs text-muted-foreground">
                        {v.entry.fecha_obtencion
                          ? new Date(v.entry.fecha_obtencion).toLocaleDateString("es")
                          : "—"}
                      </span>
                    )}
                    {c === "observaciones" && (
                      <span className="text-xs text-muted-foreground">
                        {v.entry.observaciones || v.observaciones || "—"}
                      </span>
                    )}
                    {c === "marcar" && (
                      <button
                        onClick={() => inc(v.codigo_completo)}
                        className="rounded-md bg-primary p-1.5 text-primary-foreground hover:opacity-90"
                        aria-label="Marcar como tengo"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                    {c === "acciones" && (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => dec(v.codigo_completo)}
                          className="rounded-md border border-border bg-background p-1 hover:bg-muted"
                          aria-label="Quitar una"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => inc(v.codigo_completo)}
                          className="rounded-md bg-primary p-1 text-primary-foreground hover:opacity-90"
                          aria-label="Agregar una"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}