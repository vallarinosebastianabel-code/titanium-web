/**
 * Única fuente de verdad de la URL base del bucket.
 * Se usa tanto en servidor (dataService) como en cliente (imágenes/video).
 *
 * Cambiar de `/bucket` (local) a DigitalOcean Spaces es solo una variable de entorno.
 */
export const BUCKET_URL = (process.env.NEXT_PUBLIC_BUCKET_URL ?? "/bucket").replace(/\/+$/, "");

export const isRemoteBucket = /^https?:\/\//i.test(BUCKET_URL);

/**
 * Convierte una ruta del JSON en una URL servible:
 * - "images/x.jpg"  -> relativa al bucket
 * - "/images/x.jpg" -> archivo propio de la app (carpeta `public/`), fuera del bucket
 * - "https://..."   -> URL absoluta
 */
export function assetUrl(path: string) {
  if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path;
  return `${BUCKET_URL}/${path.replace(/^\/+/, "")}`;
}
