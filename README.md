# Titanium Motors

Landing + catálogo de vehículos. Next.js (App Router) · TypeScript · Tailwind CSS v4 · react-hook-form + zod · slim-select.

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

## Estructura

```
public/bucket/                  # "Bucket" simulado (en prod vive en DigitalOcean Spaces)
  data/site.json                # negocio, hero, configuración del simulador
  data/vehicles.json            # inventario
  data/testimonials.json        # clientes felices (foto + testimonio)
  data/faqs.json                # preguntas frecuentes
  images/ · videos/             # media propia (ver CREDITS.md); hero.webm es opcional
  CREDITS.md                    # fuente y licencia de cada foto/video
scripts/seed-bucket.mjs         # regenera data/vehicles.json desde las fotos ya importadas
scripts/import-stock.py          # elige/recorta las fotos de stock/ hacia public/bucket/images/vehicles
src/
  app/
    layout.tsx · page.tsx       # home (SSG + ISR 5 min)
    inventario/page.tsx         # resultados del buscador (SSR por searchParams)
    api/leads/route.ts          # captura de leads (valida con zod; TODO: CRM/email)
  services/dataService.ts       # ÚNICA capa de datos (server-only)
  lib/
    schemas/                    # zod: vehicle, site, loan, lead, search
    finance.ts · format.ts · assets.ts · vehicle-filters.ts
  components/
    layout/                     # Header, Footer
    sections/hero/              # Hero (server) + HeroVideo, HeroSearchForm (client)
    sections/loan/              # FinancingSection (server) + LoanSimulator, MoneyRangeField, PrequalifyForm (client)
    sections/catalog/           # CatalogSection, VehicleGrid, VehicleCard
    sections/trust/             # TrustSection (server) + TestimonialCarousel (client, scroll-snap)
    sections/faq/               # FaqSection: acordeón <details name="faq"> sin JS + JSON-LD FAQPage
    sections/contact/           # ContactSection (server, solo datos de contacto)
    ui/                         # SlimSelectField, GlowButton, GlowGroup, Reveal, TextField...
  styles/
    animista.css                # animaciones (formato animista.net)
    glow.css                    # efecto del CodePen inescodes/PoxMyvX
    slim-select-theme.css       # tema de marca para slim-select
```

## Panel admin (Supabase)

El inventario se puede administrar en `/admin` con login. Sin variables de Supabase, el sitio sigue leyendo `vehicles.json`.

1. Creá un proyecto en [supabase.com](https://supabase.com) (plan free).
2. SQL Editor → pegá y ejecutá `supabase/schema.sql`.
3. Authentication → Users → Create user (email/password de Sebastián).
4. En ese usuario → **App Metadata**: `{ "role": "admin" }`.
5. Project Settings → API → copiá URL, `anon` key y `service_role` a `.env`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

6. Migrá el inventario actual:

```bash
node --env-file=.env scripts/migrate-to-supabase.mjs
```

7. Abrí `http://localhost:3000/admin`, iniciá sesión y administrá carros/fotos.

Deploy: Vercel (front) + Supabase (DB/Auth/Storage). Ambos tienen plan gratis.

## Migrar a DigitalOcean Spaces

Los componentes nunca saben de dónde vienen los datos. Basta con cambiar una variable:

```bash
NEXT_PUBLIC_BUCKET_URL=https://titanium-motors.nyc3.cdn.digitaloceanspaces.com
```

- `dataService` pasa de leer `public/bucket/data/*.json` a `fetch` con revalidación (`DATA_REVALIDATE_SECONDS`).
- `next.config.ts` autoriza automáticamente el host en `next/image`.
- Sube al Space la misma estructura de `public/bucket/` y habilita CORS/CDN público de lectura.
- Cada JSON se valida con zod al cargarse: un archivo mal publicado falla de forma explícita.

## Decisiones clave

- **SSR/CSR**: el copy, póster, catálogo y encabezados son Server Components. Son `use client` solo: video, formulario de búsqueda, simulador, selects, efectos de hover y `Reveal`.
- **Hero video**: el póster (`next/image`, `priority`) es el LCP. El video se inyecta en idle, no se descarga con `prefers-reduced-motion`/ahorro de datos/2G y se pausa fuera de pantalla.
- **Glow hover**: port fiel del CodePen (overlay clon + `mask: radial-gradient` siguiendo el puntero + `--lightness: 95%` en hover). `GlowGroup` para tarjetas, `GlowButton` para CTAs.
- **Animista**: las clases viven en `animista.css`. Para añadir otra, genérala en animista.net y pega "Class + Keyframes".
- **slim-select**: copia las clases del `<select>` a su contenedor, por eso el fallback pre-hidratación se estiliza por estructura (`.slim-field > select`) y no por clase.

## Pendiente antes de producción

- Reemplazar datos de demo (`site.json`, fotos de clientes/vehículos) y reemplazar las fotos/video de stock por los reales (opcional: añadir `videos/hero.webm` y `media.webm` en `site.json`).
- Conectar `src/app/api/leads/route.ts` a tu CRM / correo (hoy solo valida y responde 201). Añadir rate limiting / captcha.
