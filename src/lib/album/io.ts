import * as XLSX from "xlsx";
import Papa from "papaparse";
import type { AlbumEntry, Estado, Sticker, StickerView } from "./types";

const VALID_ESTADOS: Estado[] = ["Tengo", "Falta", "Repetida", "En intercambio", "Conseguida hoy", "Revisar"];
const VALID_FUENTES = ["sobre", "intercambio", "compra", "regalo", "carga inicial", ""] as const;

export function parseChecklistCSV(text: string): Sticker[] {
  const res = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return rowsToStickers(res.data);
}

export async function parseChecklistFile(file: File): Promise<Sticker[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
  return rowsToStickers(rows);
}

function pick(r: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    for (const real of Object.keys(r)) {
      if (real.toLowerCase().trim() === k.toLowerCase()) return String(r[real] ?? "").trim();
    }
  }
  return "";
}

function rowsToStickers(rows: Record<string, string>[]): Sticker[] {
  return rows
    .map((r): Sticker | null => {
      const codigo = pick(r, "codigo", "código", "code");
      const numeroStr = pick(r, "numero", "número", "number");
      const numero = parseInt(numeroStr, 10);
      if (!codigo || isNaN(numero)) return null;
      const tipo = (pick(r, "tipo", "type") || "Jugador") as Sticker["tipo"];
      const es_especial = /^(sí|si|yes|true|1)$/i.test(pick(r, "es_especial", "especial"));
      const es_cocacola = /^(sí|si|yes|true|1)$/i.test(pick(r, "es_cocacola", "cocacola", "coca-cola"));
      return {
        id: `${codigo}-${numero}`,
        codigo: codigo.toUpperCase(),
        numero,
        codigo_completo: `${codigo.toUpperCase()}-${numero}`,
        pais_seccion: pick(r, "pais_seccion", "país", "pais", "sección", "seccion") || codigo,
        nombre: pick(r, "nombre", "name") || `${codigo}-${numero}`,
        tipo,
        categoria: pick(r, "categoria", "categoría") || "General",
        es_especial,
        es_cocacola,
        observaciones: pick(r, "observaciones", "notas"),
      };
    })
    .filter((x): x is Sticker => !!x);
}

export async function parseProgressFile(file: File): Promise<Record<string, AlbumEntry>> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf);
  const sheetName = wb.SheetNames.includes("Importar_Tengo") ? "Importar_Tengo" : wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[sheetName]);
  const entries: Record<string, AlbumEntry> = {};
  for (const r of rows) {
    const cc = pick(r, "codigo_completo").toUpperCase();
    if (!cc) continue;
    const cantidad = Math.max(0, parseInt(pick(r, "cantidad") || "1", 10) || 1);
    const cantRep = Math.max(0, parseInt(pick(r, "cantidad_repetida") || "0", 10) || 0);
    const estadoRaw = pick(r, "estado") as Estado;
    const estado: Estado = VALID_ESTADOS.includes(estadoRaw)
      ? estadoRaw
      : cantidad > 1 ? "Repetida" : "Tengo";
    const fuenteRaw = pick(r, "fuente") as typeof VALID_FUENTES[number];
    const fuente: AlbumEntry["fuente"] = (VALID_FUENTES as readonly string[]).includes(fuenteRaw)
      ? fuenteRaw
      : "carga inicial";
    const confianciaRaw = pick(r, "confianza_lectura").toLowerCase();
    const fecha = pick(r, "fecha_obtencion");
    const imgOrigen = pick(r, "imagen_origen");
    const obs = pick(r, "observaciones");
    entries[cc] = {
      sticker_id: cc,
      estado,
      cantidad,
      cantidad_repetida: cantRep,
      fuente,
      ...(fecha ? { fecha_obtencion: fecha } : {}),
      ...(imgOrigen ? { imagen_origen: imgOrigen } : {}),
      ...(["alta", "media", "baja"].includes(confianciaRaw) ? { confianza_lectura: confianciaRaw as AlbumEntry["confianza_lectura"] } : {}),
      ...(obs ? { observaciones: obs } : {}),
    };
  }
  return entries;
}

export function exportToExcel(views: StickerView[], nombre = "album-panini-wc26") {
  const data = views.map((v) => ({
    Código: v.codigo,
    Número: v.numero,
    "Código completo": v.codigo_completo,
    "País / Sección": v.pais_seccion,
    Nombre: v.nombre,
    Tipo: v.tipo,
    Categoría: v.categoria,
    Estado: v.entry.estado,
    Cantidad: v.entry.cantidad,
    Repetidas: v.entry.cantidad_repetida,
    Especial: v.es_especial ? "Sí" : "No",
    "Coca-Cola": v.es_cocacola ? "Sí" : "No",
    Fuente: v.entry.fuente,
    Fecha: v.entry.fecha_obtencion ?? "",
    Observaciones: v.entry.observaciones ?? v.observaciones ?? "",
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Álbum");
  XLSX.writeFile(wb, `${nombre}.xlsx`);
}

export function exportToCSV(views: StickerView[], nombre = "album-panini-wc26") {
  const data = views.map((v) => ({
    codigo: v.codigo,
    numero: v.numero,
    codigo_completo: v.codigo_completo,
    pais_seccion: v.pais_seccion,
    nombre: v.nombre,
    tipo: v.tipo,
    categoria: v.categoria,
    estado: v.entry.estado,
    cantidad: v.entry.cantidad,
    cantidad_repetida: v.entry.cantidad_repetida,
    es_especial: v.es_especial,
    es_cocacola: v.es_cocacola,
    fuente: v.entry.fuente,
    fecha_obtencion: v.entry.fecha_obtencion ?? "",
    observaciones: v.entry.observaciones ?? v.observaciones ?? "",
  }));
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${nombre}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}