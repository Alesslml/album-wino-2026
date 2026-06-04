import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AlbumEntry,
  CargaInicialItem,
  Estado,
  Intercambio,
  Sticker,
  StickerView,
} from "./types";
import { SEED_STICKERS } from "./seed";

interface AlbumState {
  stickers: Sticker[];
  entries: Record<string, AlbumEntry>;
  intercambios: Intercambio[];
  cargaInicial: CargaInicialItem[];
  log: { ts: string; msg: string }[];

  // acciones
  setStickers: (s: Sticker[]) => void;
  resetSeed: () => void;
  setCantidad: (codigo_completo: string, cantidad: number, fuente?: AlbumEntry["fuente"]) => void;
  incrementar: (codigo_completo: string) => void;
  decrementar: (codigo_completo: string) => void;
  marcarEstado: (codigo_completo: string, estado: Estado) => void;
  setObservaciones: (codigo_completo: string, obs: string) => void;
  addIntercambio: (i: Omit<Intercambio, "id">) => void;
  setCargaInicial: (items: CargaInicialItem[]) => void;
  pushLog: (msg: string) => void;
  bulkSetEntries: (newEntries: Record<string, AlbumEntry>) => void;
}

function emptyEntry(): AlbumEntry {
  return {
    sticker_id: "",
    estado: "Falta",
    cantidad: 0,
    cantidad_repetida: 0,
    fuente: "",
  };
}

function estadoFor(cantidad: number, prev?: Estado): Estado {
  if (prev === "Revisar") return "Revisar";
  if (cantidad <= 0) return "Falta";
  if (cantidad === 1) return "Tengo";
  return "Repetida";
}

export const useAlbum = create<AlbumState>()(
  persist(
    (set, get) => ({
      stickers: SEED_STICKERS,
      entries: {},
      intercambios: [],
      cargaInicial: [],
      log: [],

      setStickers: (s) => set({ stickers: s, entries: {} }),
      resetSeed: () =>
        set({
          stickers: SEED_STICKERS,
          entries: {},
          intercambios: [],
          cargaInicial: [],
          log: [],
        }),

      setCantidad: (cc, cantidad, fuente) =>
        set((st) => {
          const sticker = st.stickers.find((x) => x.codigo_completo === cc);
          if (!sticker) return st;
          const prev = st.entries[sticker.id] ?? emptyEntry();
          const c = Math.max(0, Math.floor(cantidad));
          const next: AlbumEntry = {
            ...prev,
            sticker_id: sticker.id,
            cantidad: c,
            cantidad_repetida: Math.max(0, c - 1),
            estado: estadoFor(c),
            fuente: fuente ?? prev.fuente ?? "",
            fecha_obtencion: c > 0 ? prev.fecha_obtencion ?? new Date().toISOString() : prev.fecha_obtencion,
          };
          return {
            entries: { ...st.entries, [sticker.id]: next },
            log: [{ ts: new Date().toISOString(), msg: `${cc}: cantidad=${c}` }, ...st.log].slice(0, 100),
          };
        }),

      incrementar: (cc) => {
        const st = get();
        const sticker = st.stickers.find((x) => x.codigo_completo === cc);
        if (!sticker) return;
        const cur = st.entries[sticker.id]?.cantidad ?? 0;
        get().setCantidad(cc, cur + 1);
      },
      decrementar: (cc) => {
        const st = get();
        const sticker = st.stickers.find((x) => x.codigo_completo === cc);
        if (!sticker) return;
        const cur = st.entries[sticker.id]?.cantidad ?? 0;
        get().setCantidad(cc, Math.max(0, cur - 1));
      },

      marcarEstado: (cc, estado) =>
        set((st) => {
          const sticker = st.stickers.find((x) => x.codigo_completo === cc);
          if (!sticker) return st;
          const prev = st.entries[sticker.id] ?? emptyEntry();
          let cantidad = prev.cantidad;
          if (estado === "Tengo" && cantidad < 1) cantidad = 1;
          if (estado === "Falta") cantidad = 0;
          if (estado === "Repetida" && cantidad < 2) cantidad = 2;
          const next: AlbumEntry = {
            ...prev,
            sticker_id: sticker.id,
            estado,
            cantidad,
            cantidad_repetida: Math.max(0, cantidad - 1),
            fecha_obtencion:
              estado === "Conseguida hoy"
                ? new Date().toISOString()
                : prev.fecha_obtencion ?? (cantidad > 0 ? new Date().toISOString() : undefined),
          };
          return {
            entries: { ...st.entries, [sticker.id]: next },
            log: [{ ts: new Date().toISOString(), msg: `${cc}: ${estado}` }, ...st.log].slice(0, 100),
          };
        }),

      setObservaciones: (cc, obs) =>
        set((st) => {
          const sticker = st.stickers.find((x) => x.codigo_completo === cc);
          if (!sticker) return st;
          const prev = st.entries[sticker.id] ?? { ...emptyEntry(), sticker_id: sticker.id };
          return { entries: { ...st.entries, [sticker.id]: { ...prev, observaciones: obs } } };
        }),

      addIntercambio: (i) =>
        set((st) => ({
          intercambios: [
            { ...i, id: crypto.randomUUID() },
            ...st.intercambios,
          ],
        })),

      setCargaInicial: (items) => set({ cargaInicial: items }),

      bulkSetEntries: (newEntries) =>
        set((st) => ({
          entries: { ...st.entries, ...newEntries },
          log: [
            { ts: new Date().toISOString(), msg: `Carga masiva: ${Object.keys(newEntries).length} figuritas importadas` },
            ...st.log,
          ].slice(0, 100),
        })),

      pushLog: (msg) =>
        set((st) => ({
          log: [{ ts: new Date().toISOString(), msg }, ...st.log].slice(0, 100),
        })),
    }),
    { name: "panini-wc26-album-v1", skipHydration: true },
  ),
);

// Selector helper
export function useStickerViews(): StickerView[] {
  const { stickers, entries } = useAlbum();
  return stickers.map((s) => ({
    ...s,
    entry:
      entries[s.id] ??
      {
        sticker_id: s.id,
        estado: "Falta",
        cantidad: 0,
        cantidad_repetida: 0,
        fuente: "",
      },
  }));
}

export function isConseguida(e: AlbumEntry): boolean {
  return e.estado === "Tengo" || e.estado === "Repetida" || e.estado === "Conseguida hoy";
}