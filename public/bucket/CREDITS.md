# Créditos de medios

Las fotos de inventario, las de clientes y el video del hero son propios de Titanium Motors.

## Video del hero

| Archivo | Fuente |
| --- | --- |
| `videos/hero-clientes.mp4` (+ frame en `images/hero-clientes-poster.jpg`) | Video propio de Titanium Motors (vertical 480×848, recomprimido) |

## Vehículos (`images/vehicles/`)

Fotos propias del inventario de Titanium Motors (`tm-<stock>-<n>.jpg`), seleccionadas y recortadas con
`scripts/import-stock.py` desde la carpeta `stock/` (sin metadatos EXIF). Si cambias las fotos elegidas,
vuelve a ejecutar ese script y luego `node scripts/seed-bucket.mjs`.

## Clientes (`images/customers/`)

| Archivo | Fuente (Unsplash) |
| --- | --- |
| `c-001` | [A woman sitting on the hood of a red car](https://unsplash.com/photos/H8KKWZHPlOQ) — Danijel Škabić |
| `c-002` | [A man standing next to a car](https://unsplash.com/photos/Ik5PhoPKxi4) |
| `c-003` | [A woman leaning on the hood of a car](https://unsplash.com/photos/LIe3MQNcECI) |
| `c-004` | [A man standing next to a car in a parking lot](https://unsplash.com/photos/LSbk6cRkfzI) |
| `c-005` | [A woman leaning on a car with her hand on her head](https://unsplash.com/photos/cdlu3HzSixU) — Danijel Škabić |
| `c-006` | [A woman leaning against a car on the side of the road](https://unsplash.com/photos/5l-InKGsH5U) |

## Clientes (carrusel del hero)

Fotos propias de clientes de Titanium Motors, con autorización para publicarlas. Viven en `public/images/clientes-web/` (`cliente-1..7.jpg`), fuera del bucket; `next/image` las optimiza al servirlas.
