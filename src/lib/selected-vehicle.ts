/**
 * Auto del inventario elegido para simular el financiamiento.
 * Se guarda en sessionStorage (sobrevive a recargas de la pestaña) y se notifica con un
 * evento para que cualquier componente cliente se suscriba con `useSyncExternalStore`.
 */
export const SELECTED_VEHICLE_EVENT = "tm:selected-vehicle";

const STORAGE_KEY = "tm:selected-vehicle";

export interface SelectedVehicle {
  id: string;
  title: string;
  stockNumber: string;
  price: number;
  /** Ruta relativa al bucket o URL absoluta. */
  image: { src: string; alt: string };
}

export function selectVehicle(vehicle: SelectedVehicle) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(vehicle));
  } catch {
    // Modo privado / storage bloqueado: la selección dura solo hasta recargar.
  }
  window.dispatchEvent(new Event(SELECTED_VEHICLE_EVENT));
}

export function clearSelectedVehicle() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ver selectVehicle.
  }
  window.dispatchEvent(new Event(SELECTED_VEHICLE_EVENT));
}

/** `useSyncExternalStore`: el snapshot es el string crudo (primitivo, estable entre lecturas). */
export function subscribeSelectedVehicle(onChange: () => void) {
  window.addEventListener(SELECTED_VEHICLE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SELECTED_VEHICLE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function getSelectedVehicleSnapshot(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export const getSelectedVehicleServerSnapshot = (): string | null => null;

export function parseSelectedVehicle(raw: string | null): SelectedVehicle | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<SelectedVehicle>;
    if (
      typeof v.id === "string" &&
      typeof v.title === "string" &&
      typeof v.stockNumber === "string" &&
      typeof v.price === "number" &&
      Number.isFinite(v.price) &&
      v.price > 0 &&
      typeof v.image?.src === "string"
    ) {
      return v as SelectedVehicle;
    }
  } catch {
    // JSON corrupto: se ignora.
  }
  return null;
}
