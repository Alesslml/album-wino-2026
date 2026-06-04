import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useStickerViews, isConseguida } from "@/lib/album/store";
import { StatCard, ProgressBar, PageHeader } from "@/components/album/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Mi Álbum Panini WC 2026" },
      { name: "description", content: "Resumen general del avance de tu álbum." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const views = useStickerViews();

  const stats = useMemo(() => {
    const total = views.length;
    const tengo = views.filter((v) => isConseguida(v.entry)).length;
    const falta = views.filter((v) => v.entry.estado === "Falta").length;
    const repetidas = views.filter((v) => v.entry.cantidad > 1).length;
    const revisar = views.filter((v) => v.entry.estado === "Revisar").length;
    const especialesTotal = views.filter((v) => v.es_especial).length;
    const especialesTengo = views.filter((v) => v.es_especial && isConseguida(v.entry)).length;
    // por país
    const porPais = new Map<string, { nombre: string; total: number; tengo: number }>();
    for (const v of views) {
      const k = v.codigo;
      const cur = porPais.get(k) ?? { nombre: v.pais_seccion, total: 0, tengo: 0 };
      cur.total++;
      if (isConseguida(v.entry)) cur.tengo++;
      porPais.set(k, cur);
    }
    const paisesArr = Array.from(porPais.entries()).map(([codigo, x]) => ({
      codigo,
      ...x,
      pct: x.total === 0 ? 0 : Math.round((x.tengo / x.total) * 100),
    }));
    const completos = paisesArr.filter((p) => p.pct === 100).length;
    const incompletos = paisesArr.length - completos;
    const ultimas = [...views]
      .filter((v) => v.entry.fecha_obtencion)
      .sort((a, b) =>
        (b.entry.fecha_obtencion ?? "").localeCompare(a.entry.fecha_obtencion ?? ""),
      )
      .slice(0, 6);
    return {
      total, tengo, falta, repetidas, revisar,
      especialesTotal, especialesTengo, completos, incompletos,
      paisesArr, ultimas,
    };
  }, [views]);

  const pieData = [
    { name: "Tengo", value: stats.tengo },
    { name: "Falta", value: Math.max(0, stats.total - stats.tengo) },
  ];
  const pieColors = ["oklch(0.62 0.18 145)", "oklch(0.6 0.22 25)"];

  const topPaises = [...stats.paisesArr].sort((a, b) => b.pct - a.pct).slice(0, 8);
  const peoresPaises = [...stats.paisesArr].sort((a, b) => a.pct - b.pct).slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Resumen del álbum"
        description="Estado general de tu colección Panini FIFA World Cup 2026."
      />

      {/* Hero progress */}
      <div
        className="mb-6 rounded-2xl p-6 text-primary-foreground"
        style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-card)" }}
      >
        <p className="text-sm opacity-80">Progreso general</p>
        <p className="mt-1 text-5xl font-bold tabular-nums">
          {stats.total === 0 ? 0 : Math.round((stats.tengo / stats.total) * 100)}%
        </p>
        <p className="mt-1 text-sm opacity-90">
          {stats.tengo} de {stats.total} figuras conseguidas
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-white"
            style={{ width: `${stats.total === 0 ? 0 : (stats.tengo / stats.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total álbum" value={stats.total} />
        <StatCard label="Tengo" value={stats.tengo} accent="tengo" />
        <StatCard label="Faltan" value={stats.falta} accent="falta" />
        <StatCard label="Repetidas" value={stats.repetidas} accent="repetida" />
        <StatCard label="En revisión" value={stats.revisar} accent="revisar" />
        <StatCard label="Especiales" value={`${stats.especialesTengo}/${stats.especialesTotal}`} accent="especial" />
        <StatCard label="Países completos" value={stats.completos} accent="tengo" />
        <StatCard label="Países incompletos" value={stats.incompletos} accent="falta" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie */}
        <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="mb-3 text-sm font-semibold">Tengo vs Falta</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
                  {pieData.map((_, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top países */}
        <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="mb-3 text-sm font-semibold">Países más completos</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={topPaises} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="codigo" type="category" width={50} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="pct" fill="oklch(0.55 0.17 150)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peores */}
        <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="mb-3 text-sm font-semibold">Países con más faltantes</h3>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={peoresPaises} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="codigo" type="category" width={50} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="pct" fill="oklch(0.6 0.22 25)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Especiales */}
        <div className="rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="mb-3 text-sm font-semibold">Avance de especiales</h3>
          <ProgressBar value={stats.especialesTengo} total={stats.especialesTotal} />
          <Link
            to="/especiales"
            className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
          >
            Ver todas las especiales →
          </Link>
        </div>
      </div>

      {/* Últimas */}
      {stats.ultimas.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
          <h3 className="mb-3 text-sm font-semibold">Últimas figuras agregadas</h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {stats.ultimas.map((v) => (
              <li key={v.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{v.nombre}</p>
                  <p className="text-xs text-muted-foreground font-mono">{v.codigo_completo}</p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {v.entry.fecha_obtencion
                    ? new Date(v.entry.fecha_obtencion).toLocaleDateString("es")
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
