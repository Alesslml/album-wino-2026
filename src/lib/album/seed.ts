import type { Sticker, TipoFigura } from "./types";

// Códigos de país detectados en la lista manual del usuario.
// Nombres oficiales en español. NO inventamos numeraciones reales:
// generamos un checklist PROVISIONAL de 20 figuras por país (1 escudo + 19 jugadores)
// que el usuario puede reemplazar importando el checklist oficial vía CSV/Excel.
export const PAISES: { codigo: string; nombre: string }[] = [
  { codigo: "ESP", nombre: "España" },
  { codigo: "IRQ", nombre: "Irak" },
  { codigo: "POR", nombre: "Portugal" },
  { codigo: "CRC", nombre: "Costa Rica" },
  { codigo: "NOR", nombre: "Noruega" },
  { codigo: "COD", nombre: "RD del Congo" },
  { codigo: "KSA", nombre: "Arabia Saudita" },
  { codigo: "ARG", nombre: "Argentina" },
  { codigo: "UZB", nombre: "Uzbekistán" },
  { codigo: "URU", nombre: "Uruguay" },
  { codigo: "ALG", nombre: "Argelia" },
  { codigo: "GHA", nombre: "Ghana" },
  { codigo: "PAN", nombre: "Panamá" },
  { codigo: "AUT", nombre: "Austria" },
  { codigo: "ENG", nombre: "Inglaterra" },
  { codigo: "SEN", nombre: "Senegal" },
  { codigo: "JOR", nombre: "Jordania" },
  { codigo: "CDO", nombre: "Cabo Verde" },
  { codigo: "HAI", nombre: "Haití" },
  { codigo: "GER", nombre: "Alemania" },
  { codigo: "SWE", nombre: "Suecia" },
  { codigo: "SCO", nombre: "Escocia" },
  { codigo: "CUN", nombre: "Curazao" },
  { codigo: "TUN", nombre: "Túnez" },
  { codigo: "USA", nombre: "Estados Unidos" },
  { codigo: "CIV", nombre: "Costa de Marfil" },
  { codigo: "BEL", nombre: "Bélgica" },
  { codigo: "PAR", nombre: "Paraguay" },
  { codigo: "ECU", nombre: "Ecuador" },
  { codigo: "EGY", nombre: "Egipto" },
  { codigo: "AUS", nombre: "Australia" },
  { codigo: "NED", nombre: "Países Bajos" },
  { codigo: "IRN", nombre: "Irán" },
  { codigo: "TUR", nombre: "Turquía" },
  { codigo: "JPN", nombre: "Japón" },
  { codigo: "NZL", nombre: "Nueva Zelanda" },
  { codigo: "MEX", nombre: "México" },
  { codigo: "BIH", nombre: "Bosnia y Herzegovina" },
  { codigo: "RSA", nombre: "Sudáfrica" },
  { codigo: "QAT", nombre: "Catar" },
  { codigo: "KOR", nombre: "Corea del Sur" },
  { codigo: "SUI", nombre: "Suiza" },
  { codigo: "BRA", nombre: "Brasil" },
  { codigo: "CAN", nombre: "Canadá" },
  { codigo: "MAR", nombre: "Marruecos" },
  { codigo: "CZE", nombre: "República Checa" },
];

// Secciones especiales detectadas
export const SECCIONES_ESPECIALES: {
  codigo: string;
  nombre: string;
  tipo: TipoFigura;
  cantidad: number;
  es_cocacola?: boolean;
}[] = [
  { codigo: "FWC", nombre: "FIFA World Cup", tipo: "FWC", cantidad: 20 },
  { codigo: "CC", nombre: "Coca-Cola", tipo: "Coca-Cola", cantidad: 12, es_cocacola: true },
  { codigo: "STAD", nombre: "Estadios", tipo: "Estadio", cantidad: 16 },
  { codigo: "LEG", nombre: "Leyendas / Logos", tipo: "Logo", cantidad: 10 },
];

function build(): Sticker[] {
  const out: Sticker[] = [];
  for (const p of PAISES) {
    // 1 escudo
    out.push({
      id: `${p.codigo}-1`,
      codigo: p.codigo,
      numero: 1,
      codigo_completo: `${p.codigo}-1`,
      pais_seccion: p.nombre,
      nombre: `Escudo ${p.nombre}`,
      tipo: "Escudo",
      categoria: "Selección",
      es_especial: false,
      es_cocacola: false,
      observaciones: "Provisional — reemplazar con checklist oficial",
    });
    // 1 foto de equipo
    out.push({
      id: `${p.codigo}-2`,
      codigo: p.codigo,
      numero: 2,
      codigo_completo: `${p.codigo}-2`,
      pais_seccion: p.nombre,
      nombre: `Equipo ${p.nombre}`,
      tipo: "Equipo",
      categoria: "Selección",
      es_especial: false,
      es_cocacola: false,
    });
    // 18 jugadores
    for (let n = 3; n <= 20; n++) {
      out.push({
        id: `${p.codigo}-${n}`,
        codigo: p.codigo,
        numero: n,
        codigo_completo: `${p.codigo}-${n}`,
        pais_seccion: p.nombre,
        nombre: `Jugador ${p.nombre} #${n - 2}`,
        tipo: "Jugador",
        categoria: "Selección",
        es_especial: false,
        es_cocacola: false,
      });
    }
  }
  for (const s of SECCIONES_ESPECIALES) {
    for (let n = 1; n <= s.cantidad; n++) {
      out.push({
        id: `${s.codigo}-${n}`,
        codigo: s.codigo,
        numero: n,
        codigo_completo: `${s.codigo}-${n}`,
        pais_seccion: s.nombre,
        nombre: `${s.nombre} #${n}`,
        tipo: s.tipo,
        categoria: "Especial",
        es_especial: true,
        es_cocacola: !!s.es_cocacola,
      });
    }
  }
  return out;
}

export const SEED_STICKERS: Sticker[] = build();

export function nombrePais(codigo: string): string {
  return (
    PAISES.find((p) => p.codigo === codigo.toUpperCase())?.nombre ??
    SECCIONES_ESPECIALES.find((s) => s.codigo === codigo.toUpperCase())?.nombre ??
    codigo
  );
}