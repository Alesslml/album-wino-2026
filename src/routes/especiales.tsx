import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useStickerViews, isConseguida } from "@/lib/album/store";
import { PageHeader, StatCard, ProgressBar } from "@/components/album/ui";
import { StickerTable } from "@/components/album/StickerTable";

export const Route = createFileRoute("/especiales")({
  head: () => ({
    meta: [
      { title: "Especiales · Álbum WC 2026" },
      { name: "description", content: "FWC, Coca-Cola, estadios, logos y otras especiales." },
    ],
  }),
  component: EspecialesPage,
});

function EspecialesPage() {
  const all = useStickerViews();
  const [tipo, setTipo] = useState("");
  const esp = useMemo(() => all.filter((v) => v.es_especial), [all]);
  const tengo = esp.filter((v) => isConseguida(v.entry)).length;
  const tipos = useMemo(() => Array.from(new Set(esp.map((v) => v.tipo))).sort(), [esp]);
  const filtered = tipo ? esp.filter((v) => v.tipo === tipo) : esp;

  return (
    <div>
      <PageHeader title="Figuras especiales" description="FWC, Coca-Cola, estadios, logos, escudos y más." />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total especiales" value={esp.length} accent="especial" />
        <StatCard label="Tengo" value={tengo} accent="tengo" />
        <StatCard label="Faltan" value={esp.length - tengo} accent="falta" />
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Avance
          </p>
          <ProgressBar value={tengo} total={esp.length} />
        </div>
      </div>
      <div className="mb-4">
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos especiales</option>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <StickerTable
        views={filtered}
        columns={["codigo_completo", "pais_seccion", "nombre", "tipo", "estado", "cantidad", "acciones"]}
      />
    </div>
  );
}