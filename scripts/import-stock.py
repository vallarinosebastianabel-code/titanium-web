#!/usr/bin/env python3
"""
Importa las fotos reales del inventario (carpeta `stock/`, fotos de celular) al bucket:

  public/images/stock/<carpeta>/IMG_xxxx.jpeg  ->  public/bucket/images/vehicles/tm-10NN-K.jpg

- Fondo original. No se recorta el auto ni se quita el fondo.
- Exteriores: se centran en un canvas 4:3. Si la foto es vertical, el hueco se rellena
  con un blur de la misma foto (no blanco).
- Interiores: se guardan completas (lado largo <= 1600 px).
- Se re-codifica sin EXIF (sin GPS) y se corrige la orientación.
- `picks` son posiciones (1-based) dentro de las fotos JPEG de la carpeta, ordenadas por nombre
  (tal como se ven en una hoja de contactos): portada, ángulos exteriores, interior.

Uso:  python3 scripts/import-stock.py [carpeta_origen]
Requiere Pillow. Después ejecuta:  node scripts/seed-bucket.mjs
"""
import glob
import os
import sys

from PIL import Image, ImageFilter, ImageOps

SRC = sys.argv[1] if len(sys.argv) > 1 else "public/images/stock"
OUT = "public/bucket/images/vehicles"
CANVAS = (1200, 900)
ALL_EXTERIOR = {1011}
INTERIOR_SLOT3 = {1015}

# (n.º de stock, carpeta, picks, centrado vertical del recorte de portada si la foto es vertical)
STOCK = [
    (1000, "RAM-bordo", [3, 8, 7, 10, 14], 0.55),
    (1001, "f150-limited", [3, 4, 5, 11, 12], 0.55),
    (1002, "highlander-gris", [3, 4, 5, 8, 12], 0.55),
    (1003, "crv-azul2", [1, 4, 5, 10, 13], 0.55),
    (1004, "honda-crv-gris", [2, 3, 4, 10, 13], 0.55),
    (1005, "tacoma-gris", [2, 6, 3, 8, 10], 0.55),
    (1006, "sienna-blanca", [3, 4, 5, 10, 12], 0.55),
    (1007, "suburban-gris-oscuro", [2, 4, 5, 10, 13], 0.55),
    (1008, "silverado-blanca", [2, 5, 7, 9, 12], 0.55),
    (1009, "tacoma-blanca2", [3, 4, 5, 9, 11], 0.55),
    (1010, "f150-gris-oscuro", [2, 3, 4, 8, 10], 0.55),
    (1011, "highlander-plata-2", [1, 3, 2, 4, 5], 0.5),
    (1012, "pilot-negra", [3, 4, 5, 10, 12], 0.55),
    (1013, "cvr-gris-2", [2, 4, 5, 11, 13], 0.55),
    (1014, "crv-azul", [3, 4, 7, 10, 12], 0.55),
    (1015, "Accord-negro", [1, 3, 6, 7, 9], 0.5),
    (1016, "honda bordo", [2, 3, 4, 8, 12], 0.5),
    (1017, "Honda accord plateado", [2, 3, 5, 9, 13], 0.5),
    (1018, "corolla-blanco", [1, 2, 5, 8, 12], 0.5),
]


def load(path):
    im = Image.open(path)
    return ImageOps.exif_transpose(im).convert("RGB")


def is_interior(stock, slot):
    if stock in ALL_EXTERIOR:
        return False
    if stock in INTERIOR_SLOT3 and slot == 3:
        return True
    return slot in (4, 5)


def center_on_original(im, size=CANVAS):
    """Centra la foto en 4:3. Si no calza, rellena con un blur del fondo original."""
    canvas_w, canvas_h = size
    src_ratio = im.width / im.height
    dst_ratio = canvas_w / canvas_h
    if abs(src_ratio - dst_ratio) < 0.03:
        return im.resize(size, Image.Resampling.LANCZOS)

    bg = ImageOps.fit(im, size, Image.Resampling.LANCZOS, centering=(0.5, 0.55))
    bg = bg.filter(ImageFilter.GaussianBlur(32))
    scale = min(canvas_w / im.width, canvas_h / im.height)
    new_w = max(1, int(im.width * scale))
    new_h = max(1, int(im.height * scale))
    fitted = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
    bg.paste(fitted, ((canvas_w - new_w) // 2, (canvas_h - new_h) // 2))
    return bg


def main():
    os.makedirs(OUT, exist_ok=True)
    for stock, folder, picks, _cy in STOCK:
        files = sorted(glob.glob(os.path.join(SRC, folder, "IMG_*.jp*g")))
        for k, pick in enumerate(picks, start=1):
            im = load(files[pick - 1])
            im.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            im = im.filter(ImageFilter.UnsharpMask(radius=1.0, percent=45, threshold=3))
            if not is_interior(stock, k):
                im = center_on_original(im)
            im.save(os.path.join(OUT, f"tm-{stock}-{k}.jpg"), "JPEG", quality=84, optimize=True, progressive=True)
        print(stock, folder, len(picks))


if __name__ == "__main__":
    main()
