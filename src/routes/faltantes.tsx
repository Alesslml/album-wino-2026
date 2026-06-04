import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useStickerViews } from "@/lib/album/store";
import { PageHeader } from "@/components/album/ui";
import { StickerTable } from "@/components/album/StickerTable";

export const Route = createFileRoute("/faltantes")({
  head: () => ({
    meta: [
      { title: "Faltantes · Álbum WC 2026" },
      { name: "description", content: "Lista de figuras que aún te faltan." },
    ],
  }),
  component: FaltantesPage,
});

function FaltantesPage() {
  const all = useStickerViews();
  const [q, setQ] = useState("");
  const [filtroPais, setFiltroPais] = useState("");
  const [tipo, setTipo] = useState("");
  const [esp, setEsp] = useState<"todas" | "si" | "no">("todas");

  const faltan = useMemo(
    () => all.filter((v) => v.entry.estado === "Falta" || v.entry.cantidad === 0),
    [all],
  );
  const paises = useMemo(() => Array.from(new Set(faltan.map((v) => v.codigo))).sort(), [faltan]);
  const tipos = useMemo(() => Array.from(new Set(faltan.map((v) => v.tipo))).sort(), [faltan]);

  const filtered = useMemo(
    () =>
      faltan.filter((v) => {
        if (filtroPais && v.codigo !== filtroPais) return false;
        if (tipo && v.tipo !== tipo) return false;
        if (esp === "si" && !v.es_especial) return false;
        if (esp === "no" && v.es_especial) return false;
        if (q) {
          const s = q.toLowerCase();
          if (
            !v.nombre.toLowerCase().includes(s) &&
            !v.codigo_completo.toLowerCase().includes(s) &&
            !v.pais_seccion.toLowerCase().includes(s)
          )
            return false;
        }
        return true;
      }),
    [faltan, q, filtroPais, tipo, esp],
  );

  return (
    <div>
      <PageHeader
        title="Faltantes"
        description={`${filtered.length} de ${faltan.length} figuras faltantes`}
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar..."
            className="w-full rounded-md border border-input bg-background py-2 pl-8 pr-3 text-sm"
          />
        </div>
        <select
          value={filtroPais}
          onChange={(e) => setFiltroPais(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los códigos</option>
          {paises.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          {tipos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={esp}
          onChange={(e) => setEsp(e.target.value as "todas" | "si" | "no")}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="todas">Todas</option>
          <option value="si">Solo especiales</option>
          <option value="no">Solo normales</option>
        </select>
      </div>
      <StickerTable
        views={filtered}
        columns={["marcar", "codigo_completo", "pais_seccion", "nombre", "tipo", "observaciones"]}
      />
    </div>
  );
}