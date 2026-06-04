import { supabase } from "../supabase";
import { useAlbum } from "./store";

const UID_KEY = "panini-wc26-uid";

function getOrCreateUid(): string {
  // Check URL params first (allows sharing the link)
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const urlUid = params.get("uid");
    if (urlUid) {
      localStorage.setItem(UID_KEY, urlUid);
      // Clean uid from URL without reloading
      params.delete("uid");
      const newUrl =
        window.location.pathname + (params.toString() ? "?" + params.toString() : "");
      window.history.replaceState({}, "", newUrl);
      return urlUid;
    }
    const stored = localStorage.getItem(UID_KEY);
    if (stored) return stored;
    const fresh = crypto.randomUUID();
    localStorage.setItem(UID_KEY, fresh);
    return fresh;
  }
  return "";
}

export function getUid(): string {
  return localStorage.getItem(UID_KEY) ?? "";
}

export function buildShareLink(): string {
  const uid = getUid();
  return `${window.location.origin}/?uid=${uid}`;
}

export async function loadFromSupabase(): Promise<boolean> {
  const uid = getOrCreateUid();
  if (!uid) return false;

  const { data, error } = await supabase
    .from("album_states")
    .select("data")
    .eq("id", uid)
    .maybeSingle();

  if (error) {
    console.error("[sync] load error", error);
    return false;
  }

  if (data?.data) {
    // Merge into store: replace entries, intercambios, log
    const saved = data.data as {
      entries?: Record<string, unknown>;
      intercambios?: unknown[];
      cargaInicial?: unknown[];
      log?: unknown[];
    };
    useAlbum.setState({
      ...(saved.entries !== undefined && { entries: saved.entries as never }),
      ...(saved.intercambios !== undefined && { intercambios: saved.intercambios as never }),
      ...(saved.cargaInicial !== undefined && { cargaInicial: saved.cargaInicial as never }),
      ...(saved.log !== undefined && { log: saved.log as never }),
    });
    return true;
  }
  return false;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    const uid = getUid();
    if (!uid) return;
    const { entries, intercambios, cargaInicial, log } = useAlbum.getState();
    const { error } = await supabase.from("album_states").upsert(
      { id: uid, data: { entries, intercambios, cargaInicial, log }, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );
    if (error) console.error("[sync] save error", error);
  }, 1500);
}

export function initSync() {
  // Load from Supabase on startup (also runs rehydrate for localStorage fallback)
  loadFromSupabase().then((loaded) => {
    if (!loaded) {
      // Fallback to localStorage if nothing in Supabase yet
      useAlbum.persist.rehydrate();
    }
  });

  // Subscribe to store changes and auto-save
  useAlbum.subscribe(() => {
    scheduleSave();
  });
}
