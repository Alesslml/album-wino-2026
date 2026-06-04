import { useAlbum } from "./store";
import { nombrePais } from "./seed";
import type { Estado } from "./types";

export interface CommandResult {
  ok: boolean;
  msg: string;
  data?: unknown;
}

function norm(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

// Convierte "Brasil" → "BRA"
function codigoDesdeNombre(nombre: string): string | null {
  const n = nombre.toLowerCase().trim();
  const all = useAlbum.getState().stickers;
  const found = all.find((s) => s.pais_seccion.toLowerCase() === n);
  return found?.codigo ?? null;
}

const ESTADOS: Estado[] = [
  "Tengo",
  "Falta",
  "Repetida",
  "En intercambio",
  "Conseguida hoy",
  "Revisar",
];

export function runCommand(input: string): CommandResult {
  const raw = norm(input);
  if (!raw) return { ok: false, msg: "Comando vacío" };
  const store = useAlbum.getState();

  // marcar <CODIGO> <NUM> como <estado>
  let m = raw.match(/^marcar\s+([A-Za-z]+)\s+(\d+)\s+como\s+(.+)$/i);
  if (m) {
    const cc = `${m[1].toUpperCase()}-${m[2]}`;
    const estadoTxt = m[3].toLowerCase();
    const estado = ESTADOS.find((e) => e.toLowerCase() === estadoTxt);
    if (!estado) return { ok: false, msg: `Estado desconocido: ${m[3]}` };
    const sticker = store.stickers.find((s) => s.codigo_completo === cc);
    if (!sticker) return { ok: false, msg: `Figura no encontrada: ${cc}` };
    store.marcarEstado(cc, estado);
    return { ok: true, msg: `✓ ${cc} marcada como ${estado}` };
  }

  // <CODIGO> <NUM> estaba mal, márcala como <estado>
  m = raw.match(/^([A-Za-z]+)\s+(\d+).*como\s+(.+)$/i);
  if (m && /mal|err/i.test(raw)) {
    const cc = `${m[1].toUpperCase()}-${m[2]}`;
    const estadoTxt = m[3].toLowerCase().replace(/\.$/, "");
    const estado = ESTADOS.find((e) => e.toLowerCase() === estadoTxt);
    if (!estado) return { ok: false, msg: `Estado desconocido: ${m[3]}` };
    store.marcarEstado(cc, estado);
    return { ok: true, msg: `✓ ${cc} corregida → ${estado}` };
  }

  // agregar repetida <CODIGO> <NUM>
  m = raw.match(/^agregar\s+repetida\s+([A-Za-z]+)\s+(\d+)$/i);
  if (m) {
    const cc = `${m[1].toUpperCase()}-${m[2]}`;
    store.incrementar(cc);
    return { ok: true, msg: `✓ +1 repetida en ${cc}` };
  }

  // quitar repetida <CODIGO> <NUM>
  m = raw.match(/^quitar\s+repetida\s+([A-Za-z]+)\s+(\d+)$/i);
  if (m) {
    const cc = `${m[1].toUpperCase()}-${m[2]}`;
    store.decrementar(cc);
    return { ok: true, msg: `✓ -1 en ${cc}` };
  }

  // ver faltantes de <pais|codigo>
  m = raw.match(/^ver\s+faltantes\s+de\s+(.+)$/i);
  if (m) {
    let codigo = m[1].toUpperCase();
    if (codigo.length > 4) codigo = codigoDesdeNombre(m[1]) ?? codigo;
    const faltan = store.stickers.filter((s) => {
      const e = store.entries[s.id];
      return s.codigo === codigo && (!e || e.cantidad === 0);
    });
    return {
      ok: true,
      msg: `${faltan.length} figuras faltan de ${nombrePais(codigo)}`,
      data: faltan,
    };
  }

  // ver cuánto me falta para completar <pais>
  m = raw.match(/^ver\s+cu[aá]nto.*completar\s+(.+)$/i);
  if (m) {
    let codigo = m[1].toUpperCase();
    if (codigo.length > 4) codigo = codigoDesdeNombre(m[1]) ?? codigo;
    const total = store.stickers.filter((s) => s.codigo === codigo);
    const faltan = total.filter((s) => {
      const e = store.entries[s.id];
      return !e || e.cantidad === 0;
    });
    return {
      ok: true,
      msg: `Faltan ${faltan.length}/${total.length} para completar ${nombrePais(codigo)}`,
    };
  }

  // mostrar todas las especiales que faltan
  if (/mostrar.*especiales.*faltan/i.test(raw)) {
    const data = store.stickers.filter((s) => {
      const e = store.entries[s.id];
      return s.es_especial && (!e || e.cantidad === 0);
    });
    return { ok: true, msg: `${data.length} especiales faltan`, data };
  }
  // mostrar todas las coca-cola que tengo
  if (/mostrar.*coca.*tengo/i.test(raw)) {
    const data = store.stickers.filter((s) => {
      const e = store.entries[s.id];
      return s.es_cocacola && e && e.cantidad > 0;
    });
    return { ok: true, msg: `Tienes ${data.length} Coca-Cola`, data };
  }
  if (/mostrar.*dudosas|revisar/i.test(raw)) {
    const data = store.stickers.filter((s) => store.entries[s.id]?.estado === "Revisar");
    return { ok: true, msg: `${data.length} figuras en revisión`, data };
  }

  // registrar intercambio: entregué <CC> y recibí <CC>
  m = raw.match(/^registrar\s+intercambio.*entregu[eé]\s+([A-Za-z]+\s*\d+).*recib[ií]\s+([A-Za-z]+\s*\d+)/i);
  if (m) {
    const entregada = m[1].replace(/\s+/, "-").toUpperCase();
    const recibida = m[2].replace(/\s+/, "-").toUpperCase();
    store.decrementar(entregada);
    store.incrementar(recibida);
    store.addIntercambio({
      fecha: new Date().toISOString(),
      figura_entregada: entregada,
      figura_recibida: recibida,
      persona: "",
      estado: "Completado",
    });
    return { ok: true, msg: `✓ Intercambio: -${entregada} / +${recibida}` };
  }

  return {
    ok: false,
    msg: "No entendí el comando. Escribe 'ayuda' para ver ejemplos.",
  };
}

export const EJEMPLOS_COMANDOS = [
  "Marcar ESP 7 como Tengo",
  "Marcar PAN 12 como Falta",
  "Agregar repetida ARG 10",
  "Quitar repetida ESP 7",
  "Marcar CC 5 como Tengo",
  "Marcar FWC 10 como Tengo",
  "Ver faltantes de ESP",
  "Ver faltantes de Brasil",
  "Ver cuánto me falta para completar Brasil",
  "Mostrar todas las especiales que faltan",
  "Mostrar todas las Coca-Cola que tengo",
  "Mostrar figuras dudosas",
  "Registrar intercambio: entregué ARG 8 y recibí POR 12",
];