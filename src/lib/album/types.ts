export type Estado =
  | "Tengo"
  | "Falta"
  | "Repetida"
  | "En intercambio"
  | "Conseguida hoy"
  | "Revisar";

export type TipoFigura =
  | "Jugador"
  | "Escudo"
  | "Equipo"
  | "Estadio"
  | "Mascota"
  | "Logo"
  | "Copa"
  | "Especial"
  | "Coca-Cola"
  | "FWC"
  | "Sección inicial"
  | "Otra";

export type Confianza = "alta" | "media" | "baja";
export type Fuente =
  | "sobre"
  | "intercambio"
  | "compra"
  | "regalo"
  | "carga inicial"
  | "";

export interface Sticker {
  id: string;
  codigo: string; // ESP, ARG, FWC, CC...
  numero: number;
  codigo_completo: string; // ESP-1
  pais_seccion: string;
  nombre: string;
  tipo: TipoFigura;
  categoria: string;
  es_especial: boolean;
  es_cocacola: boolean;
  observaciones?: string;
}

export interface AlbumEntry {
  sticker_id: string;
  estado: Estado;
  cantidad: number;
  cantidad_repetida: number;
  fecha_obtencion?: string;
  fuente: Fuente;
  imagen_origen?: string;
  confianza_lectura?: Confianza;
  observaciones?: string;
}

export interface Intercambio {
  id: string;
  fecha: string;
  figura_entregada: string; // codigo_completo
  figura_recibida: string;
  persona: string;
  estado: "Pendiente" | "Completado" | "Cancelado";
  observaciones?: string;
}

export interface CargaInicialItem {
  id: string;
  imagen: string;
  codigo_detectado: string;
  numero_detectado: number | null;
  estado_detectado: Estado;
  confianza: Confianza;
  requiere_revision: boolean;
  observaciones?: string;
}

export interface StickerView extends Sticker {
  entry: AlbumEntry;
}