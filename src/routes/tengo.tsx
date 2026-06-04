import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStickerViews, isConseguida } from "@/lib/album/store";
import { PageHeader } from "@/components/album/ui";
import { StickerTable } from "@/components/album/StickerTable";

export const Route = createFileRoute("/tengo")({
  head: () => ({
    meta: [
      { title: "Ya tengo · Álbum WC 2026" },
      { name: "description", content: "Figuras conseguidas." },
    ],
  }),
  component: TengoPage,
});

function TengoPage() {
  const all = useStickerViews();
  const [filtroPais, setFiltroPais] = useState("");
  const tengo = useMemo(() => all.filter((v) => isConseguida(v.entry)), [all]);
  const paises = useMemo(() => Array.from(new Set(tengo.map((v) => v.codigo))).sort(), [tengo]);
  const filtered = filtroPais ? tengo.filter((v) => v.codigo === filtroPais) : tengo;

  return (
    <div>
      <PageHeader title="Ya tengo" description={`${tengo.length} figuras conseguidas`} />
      <div className="mb-4">
        <select
          value={filtroPais}
          onChange={(e) => setFiltroPais(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los países</option>
          {paises.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <StickerTable
        views={filtered}
        columns={["codigo_completo", "pais_seccion", "nombre", "tipo", "cantidad", "fuente", "fecha", "acciones"]}
      />
    </div>
  );
}