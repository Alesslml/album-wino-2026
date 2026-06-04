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
  const tengo = useMemo(() => views.filter((v) => isConseguida(v.entry)), [views]);
  const faltan = useMemo(() => views.filter((v) => !isConseguida(v.entry)), [views]);

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
        <ProgressBar value={tengo.length} total={views.length} />
      </div>

      {/* Tengo */}
      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <h2 className="font-semibold text-green-700 dark:text-green-400">
            Tengo ({tengo.length})
          </h2>
        </div>
        {tengo.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            Todavía no tenés ninguna figura de este país.
          </p>
        ) : (
          <StickerTable
            views={tengo}
            columns={["codigo_completo", "nombre", "tipo", "estado", "cantidad", "repetidas", "acciones"]}
          />
        )}
      </section>

      {/* Faltan */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <h2 className="font-semibold text-red-600 dark:text-red-400">
            Faltan ({faltan.length})
          </h2>
        </div>
        {faltan.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
            ¡País completo! 🎉
          </p>
        ) : (
          <StickerTable
            views={faltan}
            columns={["marcar", "codigo_completo", "nombre", "tipo", "acciones"]}
          />
        )}
      </section>
    </div>
  );
}
