import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Upload, RotateCcw } from "lucide-react";
import { useAlbum, useStickerViews } from "@/lib/album/store";
import { parseChecklistFile, parseProgressFile, exportToExcel, exportToCSV } from "@/lib/album/io";
import { PageHeader } from "@/components/album/ui";

export const Route = createFileRoute("/importar")({
  head: () => ({
    meta: [
      { title: "Importar / Exportar · Álbum WC 2026" },
      { name: "description", content: "Importa el checklist oficial desde CSV/Excel y exporta tu avance." },
    ],
  }),
  component: ImportarPage,
});

function ImportarPage() {
  const setStickers = useAlbum((s) => s.setStickers);
  const resetSeed = useAlbum((s) => s.resetSeed);
  const bulkSetEntries = useAlbum((s) => s.bulkSetEntries);
  const views = useStickerViews();
  const [msg, setMsg] = useState<string>("");
  const [progressMsg, setProgressMsg] = useState<string>("");

  async function onProgressFile(file: File) {
    try {
      const newEntries = await parseProgressFile(file);
      const count = Object.keys(newEntries).length;
      if (count === 0) {
        setProgressMsg("⚠ No se encontraron filas válidas. Verificá que el archivo tenga la columna 'codigo_completo'.");
        return;
      }
      bulkSetEntries(newEntries);
      setProgressMsg(`✓ ${count} figuritas cargadas correctamente.`);
    } catch (e) {
      setProgressMsg(`Error al leer el archivo: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function onFile(file: File) {
    try {
      const stickers = await parseChecklistFile(file);
      if (stickers.length === 0) {
        setMsg("⚠ El archivo no contenía filas válidas. Verifica las columnas.");
        return;
      }
      setStickers(stickers);
      setMsg(`✓ Checklist importado: ${stickers.length} figuras.`);
    } catch (e) {
      setMsg(`Error al leer el archivo: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const faltantes = views.filter((v) => v.entry.cantidad === 0);
  const repetidas = views.filter((v) => v.entry.cantidad > 1);

  return (
    <div>
      <PageHeader
        title="Importar / Exportar"
        description="Reemplaza el checklist provisional por el oficial y descarga tu avance."
      />
      {/* Importar mi progreso */}
      <div className="mb-6 rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-primary">Cargar mis figuritas (Excel de progreso)</h3>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Subí tu Excel de figuritas que ya tenés. Necesita la columna{" "}
          <code className="rounded bg-muted px-1 text-xs">codigo_completo</code>. Las figuritas se marcan como "Tengo" sin borrar el resto.
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          <Upload className="h-4 w-4" />
          Seleccionar archivo de progreso
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onProgressFile(f);
            }}
          />
        </label>
        {progressMsg && (
          <p className={`mt-3 text-sm font-medium ${progressMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}>
            {progressMsg}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-3 flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Importar checklist oficial</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            Sube CSV o Excel con columnas:{" "}
            <code className="rounded bg-muted px-1 text-xs">codigo, numero, pais_seccion, nombre, tipo, categoria, es_especial, es_cocacola, observaciones</code>.
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Upload className="h-4 w-4" />
            Seleccionar archivo
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onFile(f);
              }}
            />
          </label>
          {msg && <p className="mt-3 text-sm">{msg}</p>}
          <div className="mt-6 border-t border-border pt-4 space-y-2">
            <p className="mb-2 text-xs text-muted-foreground">
              ⚠ Importar reemplaza todas las figuras y borra tu progreso actual.
            </p>
            <button
              onClick={() => {
                if (confirm("¿Restaurar checklist provisional y borrar avance?")) resetSeed();
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Restaurar checklist provisional
            </button>
            <button
              onClick={() => {
                if (confirm("¿Borrar TODO el progreso y empezar de cero? Esta acción no se puede deshacer.")) {
                  resetSeed();
                }
              }}
              className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Borrar todo y empezar de 0
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-3 flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Exportar tu avance</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => exportToExcel(views)}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Descargar todo (Excel)
            </button>
            <button
              onClick={() => exportToCSV(views)}
              className="w-full rounded-md border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
            >
              Descargar todo (CSV)
            </button>
            <button
              onClick={() => exportToExcel(faltantes, "faltantes-panini-wc26")}
              className="w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Solo faltantes ({faltantes.length})
            </button>
            <button
              onClick={() => exportToExcel(repetidas, "repetidas-panini-wc26")}
              className="w-full rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Solo repetidas para intercambio ({repetidas.length})
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-xl border border-dashed border-border bg-card/40 p-4">
        <p className="text-sm text-muted-foreground">
          <b>Carga inicial desde imágenes:</b> cuando subas tus 4 fotos manuales, el reconocimiento
          se conectará aquí. Mientras tanto puedes marcar figuras rápidamente con la página de{" "}
          <b>Comandos</b> (ej. <code className="rounded bg-muted px-1 text-xs">Marcar ESP 7 como Tengo</code>).
        </p>
      </div>
    </div>
  );
}