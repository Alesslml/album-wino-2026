import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Flag,
  CircleSlash,
  CheckCircle2,
  Copy,
  Sparkles,
  ClipboardCheck,
  Terminal,
  Upload,
  Trophy,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { buildShareLink } from "@/lib/album/sync";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/paises", icon: Flag, label: "Países / Secciones" },
  { to: "/faltantes", icon: CircleSlash, label: "Faltantes" },
  { to: "/tengo", icon: CheckCircle2, label: "Ya tengo" },
  { to: "/repetidas", icon: Copy, label: "Repetidas" },
  { to: "/especiales", icon: Sparkles, label: "Especiales" },
  { to: "/revision", icon: ClipboardCheck, label: "Revisión" },
  { to: "/comandos", icon: Terminal, label: "Comandos" },
  { to: "/importar", icon: Upload, label: "Importar / Exportar" },
] as const;

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    const link = buildShareLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      title="Copiar mi link de acceso"
      className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      <Link2 className="h-3.5 w-3.5" />
      {copied ? "¡Copiado!" : "Mi link"}
    </button>
  );
}

export function AlbumLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
            style={{ background: "var(--gradient-hero)" }}
          >
            <Trophy className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold leading-tight">
              Album de Winonita · Panini · FIFA World Cup 2026
            </h1>
            <p className="text-xs text-muted-foreground">
              Control completo de tu álbum
            </p>
          </div>
          <CopyLinkButton />
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-2 py-2 md:hidden">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav className="sticky top-24 flex flex-col gap-1">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active =
                pathname === n.to || (n.to !== "/" && pathname.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}