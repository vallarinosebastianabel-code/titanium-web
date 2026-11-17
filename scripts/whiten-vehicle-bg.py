#!/usr/bin/env python3
"""Fondo blanco en fotos exteriores del inventario, con BiRefNet (gratis, local).

Las fotos 4 y 5 son cabina (salvo el Highlander TM-1011). Requiere rembg:

  /tmp/tm-rembg/bin/python scripts/whiten-vehicle-bg.py
"""
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

ROOT = Path(__file__).resolve().parents[1] / "public/bucket/images/vehicles"
ALL_EXTERIOR = {"1011"}
SKIP = {"tm-1015-3.jpg"}  # cabina en el slot 3


def is_interior(path: Path) -> bool:
    if path.name in SKIP:
        return True
    parts = path.stem.split("-")
    if len(parts) != 3:
        return False
    _pref, stock, slot = parts
    if stock in ALL_EXTERIOR:
        return False
    return slot in {"4", "5"}


CANVAS = (1200, 900)
PAD = 0.12
WHITE_MAX = 246


def flatten_white(cut: Image.Image) -> Image.Image:
    if cut.mode != "RGBA":
        cut = cut.convert("RGBA")
    white = Image.new("RGB", cut.size, (255, 255, 255))
    white.paste(cut, mask=cut.split()[-1])
    return white


def content_bbox(im: Image.Image) -> tuple[int, int, int, int] | None:
    mask = im.convert("L").point(lambda p: 255 if p < WHITE_MAX else 0)
    return mask.getbbox()


def center_on_canvas(im: Image.Image, size: tuple[int, int] = CANVAS) -> Image.Image:
    """Recorta el blanco sobrante y centra el auto en un canvas 16:10."""
    rgb = im.convert("RGB")
    box = content_bbox(rgb)
    if box is None:
        canvas = Image.new("RGB", size, (255, 255, 255))
        canvas.paste(rgb.resize(size, Image.Resampling.LANCZOS))
        return canvas

    crop = rgb.crop(box)
    cw, ch = crop.size
    canvas_w, canvas_h = size
    max_w = int(canvas_w * (1 - 2 * PAD))
    max_h = int(canvas_h * (1 - 2 * PAD))
    scale = min(max_w / cw, max_h / ch)
    new_w = max(1, int(cw * scale))
    new_h = max(1, int(ch * scale))
    fitted = crop.resize((new_w, new_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, (255, 255, 255))
    canvas.paste(fitted, ((canvas_w - new_w) // 2, (canvas_h - new_h) // 2))
    return canvas


def main() -> None:
    files = sorted(p for p in ROOT.glob("tm-*.jpg") if not is_interior(p))
    session = new_session("birefnet-general", providers=["CPUExecutionProvider"])
    for i, path in enumerate(files, start=1):
        original = Image.open(path).convert("RGB")
        cut = remove(original, session=session)
        centered = center_on_canvas(flatten_white(cut))
        centered.save(path, "JPEG", quality=84, optimize=True, progressive=True)
        print(f"[{i}/{len(files)}] {path.name}", flush=True)
    print(f"done: {len(files)} exteriors")


if __name__ == "__main__":
    main()
