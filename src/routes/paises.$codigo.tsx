import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useStickerViews, isConseguida } from "@/lib/album/store";
import { PageHeader, ProgressBar } from "@/components/album/ui";
import { StickerTable } from "@/components/album/StickerTable";

export const Route = createFileRoute("/paises/$codigo")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.codigo} · Álbum WC 2026` },
      { name: "description", content: `Figuras de ${params.codigo}.` },
    ],
  }),
  component: PaisDetalle,
});

function PaisDetalle() {
  const { codigo } = Route.useParams();
  const all = useStickerViews();
  const views = useMemo(
    () => all.filter((v) => v.codigo.toLowerCase() === codigo.toLowerCase()),
    [all, codigo],
  );
  const nombre = views[0]?.pais_seccion ?? codigo;
  const tengo = views.filter((v) => isConseguida(v.entry)).length;

  return (
    <div>
      <Link
        to="/paises"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a países
      </Link>
      <PageHeader title={`${nombre} (${codigo})`} description={`${views.length} figuras en total`} />
      <div className="mb-6 max-w-md">
        <ProgressBar value={tengo} total={views.length} />
      </div>
      <StickerTable
        views={views}
        columns={["codigo_completo", "nombre", "tipo", "estado", "cantidad", "repetidas", "acciones"]}
      />
    </div>
  );
}