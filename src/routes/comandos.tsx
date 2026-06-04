import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send } from "lucide-react";
import { runCommand, EJEMPLOS_COMANDOS } from "@/lib/album/commands";
import { PageHeader } from "@/components/album/ui";

export const Route = createFileRoute("/comandos")({
  head: () => ({
    meta: [
      { title: "Comandos · Álbum WC 2026" },
      { name: "description", content: "Actualiza tu álbum con comandos simples en español." },
    ],
  }),
  component: ComandosPage,
});

interface HistItem {
  cmd: string;
  ok: boolean;
  msg: string;
  ts: string;
}

function ComandosPage() {
  const [cmd, setCmd] = useState("");
  const [hist, setHist] = useState<HistItem[]>([]);

  function ejecutar(text: string) {
    if (!text.trim()) return;
    const r = runCommand(text);
    setHist((h) => [{ cmd: text, ok: r.ok, msg: r.msg, ts: new Date().toLocaleTimeString("es") }, ...h]);
    setCmd("");
  }

  return (
    <div>
      <PageHeader
        title="Comandos rápidos"
        description="Actualiza tu álbum escribiendo en lenguaje natural."
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          ejecutar(cmd);
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          placeholder="Ej: Marcar ESP 7 como Tengo"
          className="flex-1 rounded-md border border-input bg-background px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Send className="h-4 w-4" /> Ejecutar
        </button>
      </form>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Ejemplos</h3>
          <ul className="space-y-1.5">
            {EJEMPLOS_COMANDOS.map((e) => (
              <li key={e}>
                <button
                  onClick={() => ejecutar(e)}
                  className="w-full rounded-md bg-muted/40 px-3 py-1.5 text-left text-xs font-mono hover:bg-muted"
                >
                  {e}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Historial</h3>
          {hist.length === 0 ? (
            <p className="text-xs text-muted-foreground">Aún no has ejecutado ningún comando.</p>
          ) : (
            <ul className="space-y-2">
              {hist.map((h, i) => (
                <li
                  key={i}
                  className="rounded-lg border p-2 text-xs"
                  style={{
                    borderColor: h.ok ? "var(--status-tengo)" : "var(--status-falta)",
                    background: h.ok ? "var(--status-tengo-bg)" : "var(--status-falta-bg)",
                  }}
                >
                  <p className="font-mono">{h.cmd}</p>
                  <p className="mt-1 text-muted-foreground">{h.msg} · {h.ts}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}