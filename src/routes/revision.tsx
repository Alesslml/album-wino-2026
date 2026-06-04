import { createFileRoute } from "@tanstack/react-router";
import { useStickerViews, useAlbum } from "@/lib/album/store";
import { PageHeader } from "@/components/album/ui";
import { StickerTable } from "@/components/album/StickerTable";

export const Route = createFileRoute("/revision")({
  head: () => ({
    meta: [
      { title: "Revisión de carga inicial · WC 2026" },
      { name: "description", content: "Revisa figuras dudosas detectadas durante la carga inicial." },
    ],
  }),
  component: RevisionPage,
});

function RevisionPage() {
  const all = useStickerViews();
  const cargaInicial = useAlbum((s) => s.cargaInicial);
  const dudosas = all.filter((v) => v.entry.estado === "Revisar");

  return (
    <div>
      <PageHeader
        title="Revisión de carga inicial"
        description="Figuras dudosas detectadas al cargar tus imágenes. Confirma o corrige cada una."
      />
      {cargaInicial.length === 0 && dudosas.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no se ha realizado ninguna carga desde imágenes. Sube tus fotos y el sistema
            generará aquí la lista de figuras a revisar.
          </p>
        </div>
      )}
      {dudosas.length > 0 && (
        <>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Figuras marcadas como "Revisar"
          </h2>
          <StickerTable
            views={dudosas}
            columns={["codigo_completo", "pais_seccion", "nombre", "estado", "observaciones", "acciones"]}
          />
        </>
      )}
      {cargaInicial.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Imagen</th>
                <th className="px-3 py-2 text-left">Código</th>
                <th className="px-3 py-2 text-left">Número</th>
                <th className="px-3 py-2 text-left">Estado</th>
                <th className="px-3 py-2 text-left">Confianza</th>
                <th className="px-3 py-2 text-left">Obs.</th>
              </tr>
            </thead>
            <tbody>
              {cargaInicial.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-3 py-2 text-xs">{c.imagen}</td>
                  <td className="px-3 py-2 font-mono">{c.codigo_detectado}</td>
                  <td className="px-3 py-2 tabular-nums">{c.numero_detectado ?? "—"}</td>
                  <td className="px-3 py-2">{c.estado_detectado}</td>
                  <td className="px-3 py-2">{c.confianza}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{c.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}