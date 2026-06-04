import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useStickerViews } from "@/lib/album/store";
import { PageHeader } from "@/components/album/ui";
import { StickerTable } from "@/components/album/StickerTable";

export const Route = createFileRoute("/repetidas")({
  head: () => ({
    meta: [
      { title: "Repetidas / Intercambio · WC 2026" },
      { name: "description", content: "Figuras que tienes repetidas para intercambiar." },
    ],
  }),
  component: RepetidasPage,
});

function RepetidasPage() {
  const all = useStickerViews();
  const reps = useMemo(() => all.filter((v) => v.entry.cantidad > 1), [all]);
  return (
    <div>
      <PageHeader
        title="Repetidas / Intercambio"
        description={`${reps.length} figuras con repetidas disponibles`}
      />
      <StickerTable
        views={reps}
        columns={["codigo_completo", "pais_seccion", "nombre", "cantidad", "repetidas", "estado", "acciones"]}
      />
    </div>
  );
}